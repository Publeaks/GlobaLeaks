# -*- encoding: utf-8 -*-
"""
Implementation of BaseHandler, the Cyclone class RequestHandler postponeed with
our needs.
"""

import collections
import httplib
import json
import logging
import mimetypes
import os
import re
import sys
import time
import types

from StringIO import StringIO

from cryptography.hazmat.primitives.constant_time import bytes_eq

from twisted.internet import fdesc, task
from twisted.internet.defer import inlineCallbacks
from twisted.python.failure import Failure

from cyclone import escape, httputil
from cyclone.escape import native_str
from cyclone.httpserver import HTTPConnection, HTTPRequest, _BadRequestException
from cyclone.web import RequestHandler, HTTPError, HTTPAuthenticationRequired, RedirectHandler

from globaleaks.event import outcoming_event_monitored, EventTrack
from globaleaks.rest import errors
from globaleaks.settings import GLSettings
from globaleaks.security import GLSecureTemporaryFile, directory_traversal_check
from globaleaks.utils.mailutils import mail_exception_handler, send_exception_email
from globaleaks.utils.monitor import ResourceMonitor
from globaleaks.utils.utility import log, log_remove_escapes, log_encode_html, \
    datetime_now, datetime_null, deferred_sleep


HANDLER_EXEC_TIME_THRESHOLD = 30

GLUploads = {}


def validate_host(host_key):
    """
    validate_host checks in the GLSettings list of valid 'Host:' values
    and if matched, return True, else return False
    Is used by all the Web handlers inherit from Cyclone
    """
    # strip eventually port
    hostchunk = str(host_key).split(":")
    if len(hostchunk) == 2:
        host_key = hostchunk[0]

    # hidden service has not a :port
    if re.match(r'^[0-9a-z]{16}\.onion$', host_key):
        return True

    if host_key != '' and host_key in GLSettings.accepted_hosts:
        return True

    log.debug("Error in host requested: %s not accepted between: %s " %
              (host_key, GLSettings.accepted_hosts))

    return False


class GLHTTPConnection(HTTPConnection):
    def __init__(self):
        self.uploaded_file = {}

    def _on_headers(self, data):
        try:
            data = native_str(data.decode("latin1"))
            eol = data.find("\r\n")
            start_line = data[:eol]
            try:
                method, uri, version = start_line.split(" ")
            except ValueError:
                raise _BadRequestException("Malformed HTTP request line")
            if not version.startswith("HTTP/"):
                raise _BadRequestException(
                    "Malformed HTTP version in HTTP Request-Line")
            try:
                headers = httputil.HTTPHeaders.parse(data[eol:])
                content_length = int(headers.get("Content-Length", 0))
            except ValueError:
                raise _BadRequestException(
                    "Malformed Content-Length header")
            self._request = HTTPRequest(
                connection=self, method=method, uri=uri, version=version,
                headers=headers, remote_ip=self._remote_ip)

            if content_length:
                megabytes = int(content_length) / (1024 * 1024)
                if megabytes > GLSettings.defaults.maximum_filesize:
                    raise _BadRequestException("Request exceeded size limit %d" %
                                               GLSettings.defaults.maximum_filesize)

                if headers.get("Expect") == "100-continue":
                    self.transport.write("HTTP/1.1 100 (Continue)\r\n\r\n")

                if content_length < 100000:
                    self._contentbuffer = StringIO()
                else:
                    self._contentbuffer = GLSecureTemporaryFile(GLSettings.tmp_upload_path)

                self.content_length = content_length
                self.setRawMode()
                return

            self.request_callback(self._request)
        except _BadRequestException as e:
            log.msg("Exception while handling HTTP request from %s: %s" % (self._remote_ip, e))
            self.transport.loseConnection()


class BaseHandler(RequestHandler):
    handler_exec_time_threshold = HANDLER_EXEC_TIME_THRESHOLD

    start_time = datetime_null()

    def __init__(self, application, request, **kwargs):
        super(BaseHandler, self).__init__(application, request, **kwargs)

        self.name = type(self).__name__
        self.req_id = GLSettings.http_requests_counter

        GLSettings.http_requests_counter += 1

        self.handler_time_analysis_begin()
        self.handler_request_logging_begin()


    def set_default_headers(self):
        """
        In this function are written some security enforcements
        related to WebServer versioning and XSS attacks.

        This is the first function called when a new request reach GLB
        """
        self.request.start_time = datetime_now()

        # to avoid version attacks
        self.set_header("Server", "globaleaks")

        # to reduce possibility for XSS attacks.
        self.set_header("X-Content-Type-Options", "nosniff")
        self.set_header("X-XSS-Protection", "1; mode=block")

        # to mitigate information leakage on Browser/Proxy Cache
        self.set_header("Cache-control", "no-cache, no-store, must-revalidate")
        self.set_header("Pragma", "no-cache")
        self.set_header("Expires", "-1")

        # to avoid information leakage via referrer
        self.set_header("Content-Security-Policy", "referrer no-referrer")

        # to avoid Robots spidering, indexing, caching
        self.set_header("X-Robots-Tag", "noindex")

        # to mitigate clickjaking attacks on iframes allowing only same origin
        # same origin is needed in order to include svg and other html <object>
        if not GLSettings.memory_copy.allow_iframes_inclusion:
            self.set_header("X-Frame-Options", "sameorigin")

        lang = self.request.headers.get('GL-Language', None)

        if not lang:
            # before was used the Client language. but shall be unsupported
            # lang = self.request.headers.get('Accepted-Language', None)
            lang = GLSettings.memory_copy.default_language

        self.request.language = lang


    @staticmethod
    def validate_python_type(value, python_type):
        """
        Return True if the python class instantiates the python_type given,
            'int' fields are accepted also as 'unicode' but cast on base 10
            before validate them
            'bool' fields are accepted also as 'true' 'false' because this
            happen on angular.js
        """
        if value is None:
            return True

        if python_type == int:
            try:
                int(value)
                return True
            except Exception:
                return False

        if python_type == bool:
            if value == u'true' or value == u'false':
                return True

        return isinstance(value, python_type)

    @staticmethod
    def validate_GLtype(value, gl_type):
        """
        Return True if the python class matches the given regexp.
        """
        if isinstance(value, (str, unicode)):
            return bool(re.match(gl_type, value))
        else:
            return False

    @staticmethod
    def validate_type(value, gl_type):
        # if it's callable, than assumes is a primitive class
        if callable(gl_type):
            retval = BaseHandler.validate_python_type(value, gl_type)
            if not retval:
                log.err("-- Invalid python_type, in [%s] expected %s" % (value, gl_type))
            return retval
        # value as "{foo:bar}"
        elif isinstance(gl_type, collections.Mapping):
            retval = BaseHandler.validate_jmessage(value, gl_type)
            if not retval:
                log.err("-- Invalid JSON/dict [%s] expected %s" % (value, gl_type))
            return retval
        # regexp
        elif isinstance(gl_type, str):
            retval = BaseHandler.validate_GLtype(value, gl_type)
            if not retval:
                log.err("-- Failed Match in regexp [%s] against %s" % (value, gl_type))
            return retval
        # value as "[ type ]"
        elif isinstance(gl_type, collections.Iterable):
            # empty list is ok
            if len(value) == 0:
                return True
            else:
                retval = all(BaseHandler.validate_type(x, gl_type[0]) for x in value)
                if not retval:
                    log.err("-- List validation failed [%s] of %s" % (value, gl_type))
                return retval
        else:
            raise AssertionError

    @staticmethod
    def validate_jmessage(jmessage, message_template):
        """
        Takes a string that represents a JSON messages and checks to see if it
        conforms to the message type it is supposed to be.

        This message must be either a dict or a list. This function may be called
        recursively to validate sub-parameters that are also go GLType.

        message: the message string that should be validated

        message_type: the GLType class it should match.
        """
        if isinstance(message_template, dict):
            success_check = 0
            keys_to_strip = []
            for key, value in jmessage.iteritems():
                if key not in message_template:
                    # strip whatever is not validated
                    #
                    # reminder: it's not possible to raise an exception for the
                    # in case more values are presenct because it's normal that the
                    # client will send automatically more data.
                    #
                    # e.g. the client will always send 'creation_date' attributs of
                    #      objects and attributes like this are present generally only
                    #      from the second request on.
                    #
                    keys_to_strip.append(key)
                    continue

                if not BaseHandler.validate_type(value, message_template[key]):
                    log.err("Received key %s: type validation fail " % key)
                    raise errors.InvalidInputFormat("Key (%s) type validation failure" % key)
                success_check += 1

            for key in keys_to_strip:
                del jmessage[key]

            for key, value in message_template.iteritems():
                if key not in jmessage.keys():
                    log.debug("Key %s expected but missing!" % key)
                    log.debug("Received schema %s - Expected %s" %
                              (jmessage.keys(), message_template.keys()))
                    raise errors.InvalidInputFormat("Missing key %s" % key)

                if not BaseHandler.validate_type(jmessage[key], value):
                    log.err("Expected key: %s type validation failure" % key)
                    raise errors.InvalidInputFormat("Key (%s) double validation failure" % key)
                success_check += 1

            if success_check == len(message_template.keys()) * 2:
                return True
            else:
                log.err("Success counter double check failure: %d" % success_check)
                raise errors.InvalidInputFormat("Success counter double check failure")

        elif isinstance(message_template, list):
            ret = all(BaseHandler.validate_type(x, message_template[0]) for x in jmessage)
            if not ret:
                raise errors.InvalidInputFormat("Not every element in %s is %s" %
                                                (jmessage, message_template[0]))
            return True

        else:
            raise errors.InvalidInputFormat("invalid json massage: expected dict or list")


    @staticmethod
    def validate_message(message, message_template):
        try:
            jmessage = json.loads(message)
        except ValueError:
            raise errors.InvalidInputFormat("Invalid JSON format")

        if BaseHandler.validate_jmessage(jmessage, message_template):
            return jmessage

        raise errors.InvalidInputFormat("Unexpected condition!?")


    def output_stripping(self, message, message_template):
        """
        @param message: the serialized dict received
        @param message_template: the answers definition
        @return: a dict or a list without the unwanted keys
        """
        pass

    def on_connection_close(self, *args, **kwargs):
        pass

    def prepare(self):
        """
        Here is implemented:
          - The performance analysts
          - the Request/Response logging
        """
        if not validate_host(self.request.host):
            raise errors.InvalidHostSpecified

    def on_finish(self):
        """
        Here is implemented:
          - The performance analysts
          - the Request/Response logging
        """
        for event in outcoming_event_monitored:
            if event['status_checker'](self._status_code) and \
                   event['method'] == self.request.method and \
                   event['handler_check'](self.request.uri):
                EventTrack(event, self.request.request_time())

        self.handler_time_analysis_end()
        self.handler_request_logging_end()

    def do_verbose_log(self, content):
        """
        Record in the verbose log the content as defined by Cyclone wrappers.

        This option is only available in devel mode and intentionally does not filter
        any input/output; It should be used only for debug purposes.
        """

        try:
            with open(GLSettings.httplogfile, 'a+') as fd:
                fdesc.writeToFD(fd.fileno(), content + "\n")
        except Exception as excep:
            log.err("Unable to open %s: %s" % (GLSettings.httplogfile, excep))

    def write_file(self, filepath):
        if not (os.path.exists(filepath) or os.path.isfile(filepath)):
            return

        try:
            with open(filepath, "rb") as f:
                while True:
                    chunk = f.read(GLSettings.file_chunk_size)
                    if len(chunk) == 0:
                        break
                    self.write(chunk)
        except IOError as srcerr:
            log.err("Unable to open %s: %s " % (filepath, srcerr.strerror))

    def write_error(self, status_code, **kw):
        exception = kw.get('exception')
        if exception and hasattr(exception, 'error_code'):

            error_dict = {}
            error_dict.update({'error_message': exception.reason, 'error_code': exception.error_code})
            if hasattr(exception, 'arguments'):
                error_dict.update({'arguments': exception.arguments})
            else:
                error_dict.update({'arguments': []})

            self.set_status(status_code)
            self.finish(error_dict)
        else:
            RequestHandler.write_error(self, status_code, **kw)

    def write(self, chunk):
        """
        This is a monkey patch to RequestHandler to allow us to serialize also
        json list objects.

        """
        if isinstance(chunk, types.ListType):
            chunk = escape.json_encode(chunk)
            RequestHandler.write(self, chunk)
            self.set_header("Content-Type", "application/json")
        else:
            RequestHandler.write(self, chunk)

    @inlineCallbacks
    def uniform_answers_delay(self):
        """
        @return: nothing. just put a delay to normalize a minimum
           amount of time used by requests. this impairs time execution analysis

        this safety measure, able to counteract some side channel attacks, is
        automatically disabled when the option -z and -l DEBUG are present
        (because it mean that globaleaks is runned in development mode)
        """

        if GLSettings.loglevel == logging.DEBUG and GLSettings.devel_mode:
            return

        uniform_delay = GLSettings.delay_threshold  # default 0.800
        request_time = self.request.request_time()
        needed_diff = uniform_delay - request_time

        if needed_diff > 0:
            yield deferred_sleep(needed_diff)

    @property
    def current_user(self):
        session_id = self.request.headers.get('X-Session')

        if session_id is None:
            # Check for POST based authentication.
            session_id = self.get_argument('x-session', default=None)

        if session_id is None:
            return None

        try:
            session = GLSettings.sessions[session_id]
        except KeyError:
            return None
        return session

    @property
    def is_whistleblower(self):
        if not self.current_user or 'role' not in self.current_user:
            raise errors.NotAuthenticated

        return self.current_user['role'] == 'wb'

    @property
    def is_receiver(self):
        if not self.current_user or 'role' not in self.current_user:
            raise errors.NotAuthenticated

        return self.current_user['role'] == 'receiver'

    def get_file_upload(self):
        try:
            if (int(self.request.arguments['flowTotalSize'][0]) / (1024 * 1024)) > GLSettings.memory_copy.maximum_filesize:
                log.err("File upload request rejected: file too big")
                raise errors.FileTooBig(GLSettings.memory_copy.maximum_filesize)

            if self.request.arguments['flowIdentifier'][0] not in GLUploads:
                f = GLSecureTemporaryFile(GLSettings.tmp_upload_path)
                GLUploads[self.request.arguments['flowIdentifier'][0]] = f
            else:
                f = GLUploads[self.request.arguments['flowIdentifier'][0]]

            f.write(self.request.files['file'][0]['body'])

            if self.request.arguments['flowChunkNumber'][0] != self.request.arguments['flowTotalChunks'][0]:
                return None

            uploaded_file = {}
            uploaded_file['filename'] = self.request.files['file'][0]['filename']
            uploaded_file['content_type'] = self.request.files['file'][0]['content_type']
            uploaded_file['body_len'] = int(self.request.arguments['flowTotalSize'][0])
            uploaded_file['body_filepath'] = f.filepath
            uploaded_file['body'] = f

            return uploaded_file

        except errors.FileTooBig:
            raise  # propagate the exception

        except Exception as exc:
            log.err("Error while handling file upload %s" % exc)
            return None

    def _handle_request_exception(self, e):
        if isinstance(e, Failure):
            exc_type = e.type
            exc_value = e.value
            exc_tb = e.getTracebackObject()
            e = e.value
        else:
            exc_type, exc_value, exc_tb = sys.exc_info()

        if isinstance(e, (HTTPError, HTTPAuthenticationRequired)):
            if GLSettings.http_log and e.log_message:
                string_format = "%d %s: " + e.log_message
                args = [e.status_code, self._request_summary()] + list(e.args)
                msg = lambda *args: string_format % args
                log.msg(msg(*args))
            if e.status_code not in httplib.responses:
                log.msg("Bad HTTP status code: %d" % e.status_code)
                return self.send_error(500, exception=e)
            else:
                return self.send_error(e.status_code, exception=e)
        else:
            log.err("Uncaught exception %s %s %s" % (exc_type, exc_value, exc_tb))
            if GLSettings.http_log:
                log.msg(e)
            mail_exception_handler(exc_type, exc_value, exc_tb)
            return self.send_error(500, exception=e)

    def handler_time_analysis_begin(self):
        self.start_time = time.time()

    def handler_time_analysis_end(self):
        current_run_time = time.time() - self.start_time

        if current_run_time > self.handler_exec_time_threshold:
            error = "Handler [%s] exceeded exec threshold with an execution time of %.2f seconds" % (self.name, current_run_time)
            log.err(error)
            send_exception_email(error)

    def handler_request_logging_begin(self):
        if GLSettings.devel_mode and GLSettings.http_log >= 0:
            try:
                content = (">" * 15)
                content += (" Request %d " % GLSettings.http_requests_counter)
                content += (">" * 15) + "\n\n"

                content += self.request.method + " " + self.request.full_url() + "\n\n"

                content += "headers:\n"
                for k, v in self.request.headers.get_all():
                    content += "%s: %s\n" % (k, v)

                if type(self.request.body) == dict and 'body' in self.request.body:
                    # this is needed due to cyclone hack for file uploads
                    body = self.request.body['body'].read()
                else:
                    body = self.request.body

                if len(body):
                    content += "\nbody:\n" + body + "\n"

                self.do_verbose_log(content)

            except Exception as excep:
                log.err("JSON logging fail (prepare): %s" % excep.message)
                return

            if 0 < GLSettings.http_log < GLSettings.http_requests_counter:
                log.debug("Reached I/O logging limit of %d requests: disabling" % GLSettings.http_log)
                GLSettings.http_log = -1

    def handler_request_logging_end(self):
        if GLSettings.devel_mode and GLSettings.http_log >= 0:
            try:
                content = ("<" * 15)
                content += (" Response %d " % self.req_id)
                content += ("<" * 15) + "\n\n"
                content += "status code: " + str(self._status_code) + "\n\n"

                content += "headers:\n"
                for k, v in self._headers.iteritems():
                    content += "%s: %s\n" % (k, v)

                if self._write_buffer is not None:
                    content += "\nbody: " + str(self._write_buffer) + "\n"

                self.do_verbose_log(content)
            except Exception as excep:
                log.err("HTTP Requests/Responses logging fail (end): %s" % excep.message)


class BaseStaticFileHandler(BaseHandler):
    def initialize(self, path=None):
        if path is None:
            path = GLSettings.static_path

        self.root = "%s%s" % (os.path.abspath(path), os.path.sep)

    def get(self, path):
        if path == '':
            path = 'index.html'

        path = self.parse_url_path(path)
        abspath = os.path.abspath(os.path.join(self.root, path))

        directory_traversal_check(self.root, abspath)

        if not os.path.exists(abspath) or not os.path.isfile(abspath):
            raise HTTPError(404)

        mime_type, encoding = mimetypes.guess_type(abspath)
        if mime_type:
            self.set_header("Content-Type", mime_type)

        self.write_file(abspath)

    def parse_url_path(self, url_path):
        if os.path.sep != "/":
            url_path = url_path.replace("/", os.path.sep)
        return url_path


class BaseRedirectHandler(BaseHandler, RedirectHandler):
    pass
