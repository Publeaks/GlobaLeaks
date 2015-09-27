/* Main js file */




/* new js */

$( document ).ready(function() {
    
    
    window.location = "/#/submission";
	/*document.getElementById('main-intro-video').addEventListener('loadedmetadata', function() {
	  this.currentTime = 11.014395;
	}, false);*/

	var mainVideo = document.getElementById('main-intro-video');
	var PausedMainVideoTime;
	//var StartVideoPos = 11.014395;




$('.video-overlay,#intro').click(function(){
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
	mainVideo.currentTime = PausedMainVideoTime;
	mainVideo.play();
});
$('.intro-video video').click(function(){
	$('.intro-video').removeClass('video-active-focus');
	$('body').css("overflow", "auto");
	$('.main-intro-video').prop('muted', true);
	PausedMainVideoTime = mainVideo.currentTime;
	console.log(PausedMainVideoTime);
	mainVideo.currentTime = PausedMainVideoTime;
	mainVideo.play();
});

var SmallVideoProces = 		document.getElementById('small-intro-video-1');
var SmallVideoTechnologie = document.getElementById('small-intro-video-2');
var SmallVideoOmgeving = 	document.getElementById('small-intro-video-3');


$('.proces-video-box .play-video').click(function(){
	
	SmallVideoProces.play();
})
$('.proces-video-box video,.proces-video-box .close-video').click(function(){
	
	SmallVideoProces.pause();
})

$('.technologie-video-box .play-video').click(function(){
	
	SmallVideoTechnologie.play();
})
$('.technologie-video-box video,.technologie-video-box .close-video').click(function(){
	
	SmallVideoTechnologie.pause();
})

$('.omgeving-video-box .play-video').click(function(){
	
	SmallVideoOmgeving.play();
})
$('.omgeving-video-box video,.omgeving-video-box .close-video').click(function(){
	
	SmallVideoOmgeving.pause();
})






$('.main-nav').stickThis({
    top:        26,      // top position of sticky element, measured from 'ceiling'
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
  	this.destroy()
},{
	offset:'0',
});
$('.intro').waypoint(function() {
  	$('.main-nav ul li').removeClass('active');
  	$('.main-nav ul li.start-link').addClass('active');
},{
	offset:'0',
});
$('.organisatie').waypoint(function() {
  	$('.main-nav ul li').removeClass('active');
  	$('.main-nav ul li.organisatie-link').addClass('active');
},{
	offset:'0',
});
$('.waarom-delen').waypoint(function() {
  	$('.main-nav ul li').removeClass('active');
  	$('.main-nav ul li.waarom-delen-link').addClass('active');
},{
	offset:'0',
});
$('.veiligheid').waypoint(function() {
  	$('.main-nav ul li').removeClass('active');
  	$('.main-nav ul li.veiligheid-link').addClass('active');
},{
	offset:'0',
});
$('.uploaden').waypoint(function() {
  	$('.main-nav ul li').removeClass('active');
  	$('.main-nav ul li.uploaden-link').addClass('active');
},{
	offset:'0',
});


$


    
    
    
    
    
    
    
    
    
    
    
});
