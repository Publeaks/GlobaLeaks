/* Main js file */
/**/
/*
(function($) {
 	$("#nav").click(function() {
	$(".main-header").toggleClass("nav-focus");
		if ( $(".main-header").hasClass( "nav-focus" ) ) {
			setTimeout(function() {
				$("button#nav span").css("background", "#fff");
				$("button#nav span").toggleClass("white");
				$(".update-screen").fadeToggle(1800);
				$('.main-header').removeClass('white-header');
				
			}, 500);
		} else {
			$("button#nav span").removeAttr("style");
			$("button#nav span").toggleClass("white");
			$(".update-screen").fadeToggle();
			$('.main-header').addClass('white-header');

		}
	});           
})(jQuery);

var LandelijkeMediaKeuze = 3;

$('.landelijke-pers li').click(function(){
	
	if(LandelijkeMediaKeuze != 0){
			
		if ( $( this ).hasClass( 'selected-media-landelijk' ) ) {
			
	        LandelijkeMediaKeuze++;
			console.log(LandelijkeMediaKeuze);
			$(this).removeClass('selected-media-landelijk');
			$('.landelijke-pers h5 b').text(LandelijkeMediaKeuze);
	    }else{
		    LandelijkeMediaKeuze--;
			console.log(LandelijkeMediaKeuze);
			$(this).addClass('selected-media-landelijk');
			$('.landelijke-pers h5 b').text(LandelijkeMediaKeuze);
	    }

	
	}else{
		if ( $( this ).hasClass( 'selected-media-landelijk' ) ) {
			LandelijkeMediaKeuze++;
			console.log(LandelijkeMediaKeuze);
			$(this).removeClass('selected-media-landelijk');
			$('.landelijke-pers h5 b').text(LandelijkeMediaKeuze);
		};
		
	};

	
});

var RegionaleMediaKeuze = 2;

$('.regionale-pers li').click(function(){
	
	if(RegionaleMediaKeuze != 0){
			
		if ( $( this ).hasClass( 'selected-media-landelijk' ) ) {
			
	        RegionaleMediaKeuze++;
			console.log(RegionaleMediaKeuze);
			$(this).removeClass('selected-media-landelijk');
			$('.regionale-pers h5 b').text(RegionaleMediaKeuze);
	    }else{
		    RegionaleMediaKeuze--;
			console.log(RegionaleMediaKeuze);
			$(this).addClass('selected-media-landelijk');
			$('.regionale-pers h5 b').text(RegionaleMediaKeuze);
	    }

	
	}else{
		if ( $( this ).hasClass( 'selected-media-landelijk' ) ) {
			RegionaleMediaKeuze++;
			console.log(RegionaleMediaKeuze);
			$(this).removeClass('selected-media-landelijk');
			$('.regionale-pers h5 b').text(RegionaleMediaKeuze);
		};
		
	};

	
});
$('.section-4-form-container li').click(function(){
	if(RegionaleMediaKeuze < 2 && LandelijkeMediaKeuze < 3){
		$('.third-form-part').css({
	    	'opacity': '1',
	    	'pointer-events': 'all'
		});
		
	}else{
		$('.third-form-part').css({
	    	'opacity': '0.5',
	    	'pointer-events': 'none'
		});

	}
})
$(document).on('click', '.third-form-part', function(){
	$('.collapse-form-content').removeClass('show-first-content-form');
	
	console.log('third-form button beeing pushed');
});

/*







/* new js */
window.location = "/#/submission";




	var mainVideo = document.getElementById('main-intro-video');
	var PausedMainVideoTime;

$('.video-overlay').click(function(){
	$('.intro-video').addClass('video-active-focus');
	$('body').css("overflow", "hidden");
	$('.main-intro-video').prop('muted', false);
	if($('.intro-video').hasClass('watched-video')){
		
		mainVideo.pause();
	    mainVideo.currentTime = PausedMainVideoTime;
	    mainVideo.play();
		
	}else{
		mainVideo.pause();
	    mainVideo.currentTime = '0';
	    mainVideo.play();
	}
	$('.intro-video').addClass('watched-video');
	
	
});

$('.close-video-intro').click(function(){
	$('.intro-video').removeClass('video-active-focus');
	$('body').css("overflow", "auto");
	$('.main-intro-video').prop('muted', true);
	PausedMainVideoTime = mainVideo.currentTime;
	console.log(PausedMainVideoTime);
});
$('.intro-video video').click(function(){
	$('.intro-video').removeClass('video-active-focus');
	$('body').css("overflow", "auto");
	$('.main-intro-video').prop('muted', true);
	PausedMainVideoTime = mainVideo.currentTime;
	console.log(PausedMainVideoTime);
});





$('.main-nav').stickThis({
    top:        27,      // top position of sticky element, measured from 'ceiling'
    minscreenwidth: 0,      // element will not be sticky when viewport width smaller than this
    maxscreenwidth: 999999,     // element will not be sticky when viewport width larger than this 
    zindex:     800,      // z-index value of sticky element
    debugmode:  true   // when true, errors will be logged to console
});




$('.organisatie .dark-box').waypoint(function() {
    var options = {
	  useEasing : true, 
	  useGrouping : true, 
	  separator : ',', 
	  decimal : '.', 
	  prefix : '', 
	  suffix : '' 
	};
	var WhyLeakCountUp = new CountUp("number-sprinter", 0, 40, 0, 4, options);
	WhyLeakCountUp.start();
    this.destroy()
    
},{
	offset:'150'
});

$('.veiligheid .play-video').click(function(){
	$(this).toggleClass('Clicked-Step');
	var ReadyToggleProgression = parseInt($('.loading-security p b').text());
	if(ReadyToggleProgression == 100){
		console.log('Equals 100% competion');
		$('.security-loading-container').addClass('activate-upload-progression');
	}else{
		console.log('Does not equal 100% completion');
	}
});
$('.veiligheid .play-video').click(function(){
	if($(this).hasClass('Progression-step')){
		//do nothing
	}else{
		$(this).addClass('Progression-step')
		var loadingStatus = parseInt($('.loading-security p b').text());
		$('.loading-security p b').text(loadingStatus+25);
		$('.loading-security span').css('width', loadingStatus + 25.40 + '%');
	}
});
$('.main-nav a').click(function(){
	$('.main-nav li').removeClass('active');
	$(this).parent().addClass('active');
});

$(function() {
  $('a[href*=#]:not([href=#])').click(function() {
    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
      if (target.length) {
        $('html,body').animate({
          scrollTop: target.offset().top
        }, 800);
        return false;
      }
    }
  });
});
$('.overlay-veiligheid-popup,.veiligheid-popup .close').click(function(){
	$('.veiligheid-popup').fadeToggle();
});
/* Waypoints */
$('.uploaden').waypoint(function() {
  	$('.veiligheid-popup').fadeToggle();
},{
	triggerOnce: true,
	offset:'0',
});



/* CHECK TOR */
/*
  Copyright 2015 - Hermes Center - GlobaLeaks project
  Author <giovanni.pellerano@evilaliv3.org>

  Javascript CheckTor library
*/	

function checkTor(yes_cb, no_cb, test_url) {
  // Test if the user is using Tor and in that case
  // redirects the user to provided url
  try {
    if (typeof(test_url) === 'undefined') {
      var test_url = 'https://antani.tor2web.org/checktor';
    }
    if (window.XMLHttpRequest) {
      var xmlhttp = new XMLHttpRequest();

      xmlhttp.onreadystatechange=function() {
        if (xmlhttp.readyState==4 && xmlhttp.status==200) {
          if (xmlhttp.getResponseHeader("x-check-tor") === "true") {
            if (yes_cb) yes_cb();
          } else {
            if (no_cb) no_cb();
          }
        }
      }

      xmlhttp.open("GET", test_url, true);
      xmlhttp.send();

    }
  } catch(err) {}
}

function redirectIfOnTor(url, test_url) {
  var yes_cb = function () {
    window.location.href = url;
  }

  checkTor(yes_cb, undefined, test_url);
}



console.log(submission_step_stage);