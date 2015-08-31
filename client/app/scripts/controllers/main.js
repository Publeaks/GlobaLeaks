GLClient.controller('MainCtrl', ['$q', '$scope', '$rootScope', '$http', '$route', '$routeParams', '$location',  '$filter', '$translate', '$modal', 'Authentication', 'Node', 'Contexts', 'Receivers', 'WhistleblowerTip', 'GLCache',
  function($q, $scope, $rootScope, $http, $route, $routeParams, $location, $filter, $translate, $modal, Authentication, Node, Contexts, Receivers, WhistleblowerTip, GLCache) {
    $scope.started = false;
    $scope.rtl = false;
    $scope.logo = 'static/globaleaks_logo.png';
    $scope.build_stylesheet = 'styles.css';

    $rootScope.language = $location.search().lang;

    $rootScope.embedded = $location.search().embedded == 'true' ? true : false;

    var iframeCheck = function() {
      try {
        return window.self !== window.top;
      } catch (e) {
        return true;
      }
    };

    $scope.reset_session = function() {
      $scope.session_id = undefined;
      $scope.role = undefined;
      $scope.auth_landing_page = undefined;
      $scope.homepage = undefined;
    };

    $scope.today = function() {
      return new Date();
    }

    $scope.update = function (model, cb, errcb) {
      var success = {};
      success.message = "Updated " + model;
      model.$update(function(result) {
        $scope.successes.push(success);
      }).then(
        function() { if (cb !== undefined) cb(); },
        function() { if (errcb !== undefined) errcb(); }
      );
    };

    $scope.go = function (hash) {
      $location.path(hash);
    }

    $scope.randomFluff = function () {
      return Math.random() * 1000000 + 1000000;
    };

    $scope.isWizard = function () {
      var path = $location.path();
      return path === '/wizard';
    };

    $scope.isHomepage = function () {
      var path = $location.path();
      return path === '/';
    };

    $scope.isLoginPage = function () {
      var path = $location.path();
      return (path === '/login' ||
              path === '/admin' ||
              path === '/receipt');
    };

    $scope.isAWhistleblowerPage = function() {
      var path = $location.path();
      return (path === '/' ||
              path === '/start' ||
              path === '/submission' ||
              path === '/receipt' ||
              path === '/status');
    }

    $scope.showLoginForm = function () {
      return (!$scope.isHomepage() &&
              !$scope.isLoginPage());
    };

    $scope.showPrivacyBadge = function() {
      return (!$rootScope.embedded &&
              !$rootScope.node.disable_privacy_badge &&
              $scope.isAWhistleblowerPage());
    }

    $scope.hasSubtitle = function () {
      return $scope.header_subtitle !== '';
    };

    $scope.open_intro = function () {
      if ($scope.intro_opened) {
        return;
      } else {
        $scope.intro_opened = true;
      }

      var modalInstance = $modal.open({
        templateUrl: 'views/partials/intro.html',
        controller: 'IntroCtrl',
        size: 'lg',
        scope: $scope
      });

    };

    $scope.set_title = function () {
      if ($rootScope.node) {
        if ($location.path() === '/') {
          $scope.ht = $rootScope.node.header_title_homepage;
        } else if ($location.path() === '/submission') {
          $scope.ht = $rootScope.node.header_title_submissionpage;
        } else if ($location.path() === '/receipt') {
          if (Authentication.keycode) {
            $scope.ht = $rootScope.node.header_title_receiptpage;
          } else {
            $scope.ht = $filter('translate')("Login");
          }
        } else {
          $scope.ht = $filter('translate')($scope.header_title);
        }
      }
    };

    $scope.route_check = function () {
      if ($rootScope.node) {

        if ($rootScope.node.wizard_done === false) {
          $location.path('/wizard');
        }

        if (($location.path() === '/') && ($rootScope.node.landing_page === 'submissionpage')) {
          $location.path('/submission');
        }

        if ($location.path() === '/submission' &&
            $scope.anonymous === false &&
            $rootScope.node.tor2web_submission === false) {
          $location.path("/");
        }

        /* Feature implemented for amnesty and currently disabled */
        //$scope.open_intro();
      }
    };

    $scope.show_file_preview = function(content_type) {
      var content_types = [
        'image/gif',
        'image/jpeg',
        'image/png',
        'image/bmp'
      ];

      return content_types.indexOf(content_type) > -1;
    };

    $scope.getXOrderProperty = function(elem) {
      return 'x';
    }

    $scope.getYOrderProperty = function(elem) {
      var key = 'presentation_order';
      if (elem[key] === undefined)
          key = 'y';
      return key;
    }

    $scope.moveUp = function(event, elem) {
      var key = $scope.getYOrderProperty(elem);
      elem[key] -= 1;

      event.stopPropagation();
    }

    $scope.moveDown = function(event, elem) {
      var key = $scope.getYOrderProperty(elem);
      elem[key] += 1;

      event.stopPropagation();
    }

    $scope.moveLeft = function(event, elem) {
      var key = $scope.getXOrderProperty(elem);
      elem[key] -= 1;

      event.stopPropagation();
    }

    $scope.moveRight = function(event, elem) {
      var key = $scope.getXOrderProperty(elem);
      elem[key] += 1;

      event.stopPropagation();
    }

    $scope.assignUniqueOrderIndex = function(elements) {
      if (elements.length <= 0)
          return;

      var key = $scope.getYOrderProperty(elements[0]);
      if (elements.length) {
        var i = 0;
        var elements = $filter('orderBy')(elements, key);
        angular.forEach(elements, function (element) {
          element[key] = i;
          i += 1;
        });
      }
    }

    $scope.minY = function(arr) {
      return $filter('min')($filter('map')(arr, 'y'));
    }

    $scope.closeAlert = function(list, index) {
      list.splice(index, 1);
    };

    var init = function () {
      $scope.logo = 'static/globaleaks_logo.png?' + $scope.randomFluff();
      $scope.build_stylesheet = "styles.css?" + $scope.randomFluff();

      Node.get(function(node, getResponseHeaders) {
        $rootScope.node = node;
        // Tor detection and enforcing of usage of HS if users are using Tor
        if (window.location.hostname.match(/^[a-z0-9]{16}\.onion$/)) {
          // A better check on this situation would be
          // to fetch https://check.torproject.org/api/ip
          $rootScope.anonymous = true;
        } else {
          if (window.location.protocol === 'https:') {
             var headers = getResponseHeaders();
             if (headers['x-check-tor'] !== undefined && headers['x-check-tor'] === 'true') {
               $rootScope.anonymous = true;
               if ($rootScope.node.hidden_service && !iframeCheck()) {
                 // the check on the iframe is in order to avoid redirects
                 // when the application is included inside iframes in order to not
                 // mix HTTPS resources with HTTP resources.
                 window.location.href = $rootScope.node.hidden_service + '/#' + $location.url();
               }
             } else {
               $rootScope.anonymous = false;
             }
          } else {
            $rootScope.anonymous = false;
          }
        }

        $scope.route_check();

        $scope.languages_supported = {};
        $scope.languages_enabled = {};
        $scope.languages_enabled_selector = [];
        angular.forEach(node.languages_supported, function (lang) {
          var code = lang.code;
          var name = lang.name;
          $scope.languages_supported[code] = name;
          if (node.languages_enabled.indexOf(code) !== -1) {
            $scope.languages_enabled[code] = name;
            $scope.languages_enabled_selector.push({"name": name, "code": code});
          }
        });

        $scope.languages_enabled_length = Object.keys(node.languages_enabled).length;

        $scope.show_language_selector = ($scope.languages_enabled_length > 1);

        $scope.set_title();

        var set_language = function(language) {
          if (language == undefined || $rootScope.node.languages_enabled.indexOf(language) == -1) {
            language = node.default_language;
            $rootScope.default_language = node.default_language;
          }

          $rootScope.language = language;

          if (["ar", "he", "ur"].indexOf(language) !== -1) {
            $scope.rtl = true;
            $scope.build_stylesheet = "styles-rtl.css";
          } else {
            $scope.rtl = false;
            $scope.build_stylesheet = "styles.css";
          }

          $translate.use($rootScope.language);
        };

        set_language($rootScope.language);


        var q1 = Contexts.query(function (contexts) {
          $rootScope.contexts = contexts;
        });

        var q2 = Receivers.query(function (receivers) {
          $rootScope.receivers = receivers;
        });

        $q.all([q1.$promise, q2.$promise]).then(function() {
          $scope.started = true;
        });

      });

    };

    $scope.view_tip = function(keycode) {
      keycode = keycode.replace(/\D/g,'');
      WhistleblowerTip(keycode, function() {
        $location.path('/status');
      });
    };

    $scope.orderByY = function(row) {
      return row[0].y;
    };

    $scope.remove = function(array, index){
      array.splice(index, 1);
    }

    $scope.reload = function() {
      $scope.started = false;
      $rootScope.successes = [];
      $rootScope.errors = [];
      GLCache.removeAll();
      init();
      $route.reload();
    };


    //////////////////////////////////////////////////////////////////
    // FIXME: this functions are in common between submission.js and
    // status.js so for this reasuns are currently pu here.
    //////////////////////////////////////////////////////////////////


    $scope.uploadedFiles = function(uploads) {
      var sum = 0;

      angular.forEach(uploads, function(flow, key) {
        if (flow != undefined) {
          sum += flow.files.length;
        }
      });

      return sum;
    };

    $scope.isUploading = function(uploads) {
      angular.forEach(uploads, function(flow, key) {
        if(flow.isUploading()) {
          return true;
        }
      });

      return false;
    };

    $scope.remainingUploadTime = function(uploads) {
      var sum = 0;

      angular.forEach(uploads, function(flow, key) {
        var x = flow.timeRemaining();
        if (x == 'Infinity') {
          return 'Infinity';
        }
        sum += x;
      });

      return sum;
    };

    $scope.uploadProgress = function(uploads) {
      var sum = 0;
      var n = 0;

      angular.forEach(uploads, function(flow, key) {
        sum += flow.progress();
        n += 1;
      });

      if (n == 0 || sum == 0) {
        return 1;
      }

      return sum / n;
    };

  //////////////////////////////////////////////////////////////////


    $scope.$on( "$routeChangeStart", function(event, next, current) {
      $scope.route_check();
    });

    $scope.$on('$routeChangeSuccess', function() {
      $scope.set_title();
    });

    $scope.$on("REFRESH", function() {
      $scope.reload();
    });

    $scope.$watch(function (scope) {
      return Authentication.id;
    }, function (newVal, oldVal) {
      if (newVal !== undefined) {
        $scope.session_id = Authentication.id;
        $scope.role = Authentication.role;
        $scope.auth_landing_page = Authentication.auth_landing_page;
        $scope.homepage = Authentication.homepage;
      } else {
        $scope.reset_session();
      }
    });

    $rootScope.$watch('language', function (newVal, oldVal) {
      if (newVal && newVal !== oldVal) {
        $rootScope.$broadcast("REFRESH");
      }
    });

    $rootScope.keypress = function(e) {
       if (((e.which || e.keyCode) === 116) || /* F5 */
           ((e.which || e.keyCode) === 82 && (e.ctrlKey || e.metaKey))) {  /* (ctrl or meta) + r */
         e.preventDefault();
         $rootScope.$broadcast("REFRESH");
       }
    }

    init();

  }

]);

GLClient.controller('ModalCtrl', ['$scope', 
  function($scope, $modalInstance, error) {
    $scope.error = error;
    $scope.seconds = error.arguments[0];
}]);

TabCtrl = ['$scope', function($scope) {
  /* Empty controller function used to implement TAB pages */
}];

GLClient.controller('DisableEncryptionCtrl', ['$scope', '$modalInstance', function($scope, $modalInstance){
    $scope.close = function() {
      $modalInstance.close(false);
    };

    $scope.no = function() {
      $modalInstance.close(false);
    };
    $scope.ok = function() {
      $modalInstance.close(true);
    };

}]);

GLClient.controller('IntroCtrl', ['$scope', '$rootScope', '$modalInstance', function ($scope, $rootScope, $modalInstance) {
  var steps = 3;

  var first_step = 0;

  if ($scope.languages_enabled_length <= 1) {
     first_step = 1;
  }

  $scope.step = first_step;

  $scope.proceed = function () {
    if ($scope.step < steps) {
      $scope.step += 1;
    }
  };

  $scope.back = function () {
    if ($scope.step > first_step) {
      $scope.step -= 1;
    }
  };

  $scope.cancel = function () {
    $modalInstance.close();
  };

  $scope.data = {
    'language': $scope.language
  };

  $scope.$watch("data.language", function (newVal, oldVal) {
    if (newVal && newVal !== oldVal) {
      $rootScope.language = $scope.data.language;
    }
  });

}]);

GLClient.controller('ConfirmableDialogCtrl', ['$scope', '$modalInstance', 'object', function($scope, $modalInstance, object) {
  $scope.object = object;

  $scope.ok = function () {
    $modalInstance.close($scope.object);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
}]);
