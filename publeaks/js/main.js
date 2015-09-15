/* Main js file */
$('.icon-security').click(function(){
	$(this).toggleClass('Clicked-Step');
	var ReadyToggleProgression = parseInt($('.loading-security p b').text());
	if(ReadyToggleProgression == 100){
		console.log('Equals 100% competion');
		$('.security-loading-container').addClass('activate-upload-progression');
	}else{
		console.log('Does not equal 100% completion');
	}
});
$('.icon-security').click(function(){
	if($(this).hasClass('Progression-step')){
		//do nothing
	}else{
		$(this).addClass('Progression-step')
		var loadingStatus = parseInt($('.loading-security p b').text());
		$('.loading-security p b').text(loadingStatus+25);
		$('.loading-security span').css('width', loadingStatus + 25.40 + '%');
	}
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
$('.main-nav a').click(function(){
	$('.main-nav li').removeClass('active');
	$(this).parent().addClass('active');
});


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
			/*$("body").css("overflow", "hidden");
			$("html.touch body").css("overflow", "hidden");*/
		} else {
			$("button#nav span").removeAttr("style");
			$("button#nav span").toggleClass("white");
			$(".update-screen").fadeToggle();
			$('.main-header').addClass('white-header');
			/*$("body").removeAttr("style");
			$("html.touch body").removeAttr("style");*/
		}
	});           
})(jQuery);

var mainVideo = document.getElementById('intro-video');
var PausedMainVideoTime;

$('.video-overlay').click(function(){
	$('.intro-video').addClass('video-active-focus');
	$('body').css("overflow", "hidden");
	$('.main-intro-video').prop('muted', false);
	if($('.main-intro-video').hasClass('watched-video')){
		
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


$('.icon-security').click(function(){
	$('.icon-security').toggle();
	$(this).toggle();
	$(this).find('.security-popup-container').fadeToggle();
	$(this).find('.security-popup-container').toggleClass('security-popup-container-active');
	
});

/* Waypoints */



$('.waarom-lekken').waypoint(function() {
  	$('.main-nav ul li').removeClass('active');
  	$('.organisatie-nav').addClass('active');
    $('.main-header').removeClass('white-header');
    $('.main-nav').removeClass('white-nav');
    console.log('waarom-lekken-in-view');
    
    
    
    
},{
  offset:'0'
});
$('.security-section').waypoint(function() {
  	$('.main-nav ul li').removeClass('active');
  	$('.veiligheid-nav').addClass('active');
    $('.main-header').removeClass('white-header');
    $('.main-nav').removeClass('white-nav');
    
    
    
    
},{
  offset:'0'
});
$('.waarom-lekken').waypoint(function() {
    var options = {
	  useEasing : true, 
	  useGrouping : true, 
	  separator : ',', 
	  decimal : '.', 
	  prefix : '', 
	  suffix : '' 
	};
	var WhyLeakCountUp = new CountUp("countUpWhyLeak", 0, 23, 0, 4, options);
	WhyLeakCountUp.start();
    this.destroy()
    
},{
	offset:'0'
});


$('.organisation-section').waypoint(function() {
  	
    $('.main-nav ul li').removeClass('active');
    $('.main-header').addClass('white-header');
    $('.main-nav').addClass('white-nav');
    $('.organisatie-nav').addClass('active');
});
$('.organisation-section').waypoint(function() {
  	
    $('.main-nav ul li').removeClass('active');
    $('.main-header').addClass('white-header');
    $('.main-nav').addClass('white-nav');
    $('.organisatie-nav').addClass('active');
});
$('.intro-video').waypoint(function() {
  	$('.main-nav ul li').removeClass('active');
    $('.main-header').addClass('white-header');
    $('.main-nav').addClass('white-nav');
    $('.start-nav').addClass('active');
    console.log('intro-video-in-view');
});
$('.waarom-zou-ik-delen').waypoint(function() {
  	$('.main-nav ul li').removeClass('active');
    $('.main-header').addClass('white-header');
    $('.main-nav').addClass('white-nav');
    $('.waarom-nav').addClass('active');
    console.log('intro-video-in-view');
});


/* FORM HIDE AND SEEK & SUCH NONSENSE */
$('.document-upload .stap-1-info i').click(function(){
	$('.document-upload .stap-1-info').hide();
	$('.collapse-form-content').addClass('show-first-content-form');
});
$('.section-2-form-1-1 input').click(function(){
    if (this.checked) {
        $('.section-2-form-1-2').css({
        	'opacity': '1',
        	'pointer-events': 'all'
        });
    }
});
$('.section-2-form-1-2 select').change(function(){
	$('.section-2-form-1-3').css({
        	'opacity': '1',
        	'pointer-events': 'all'
        });

});
$('.section-2-form-1-3 select').change(function(){
	$('.section-2-form-1-4').css({
        	'opacity': '1',
        	'pointer-events': 'all'
        });

});
$('.section-2-form-1-4 select').change(function(){
	$('.progressie-button').css({
	    	'opacity': '1',
	    	'pointer-events': 'all'
	});
	if($(this).val() == 'Ja'){ // or this.value == 'volvo'
		$('.section-2-form-1-5').css({
		    	'display': 'block',
		    	'opacity': '1',
		    	'pointer-events': 'all'
		});
		$('.section-2-form-1-6').css({
		    	'display': 'block',
		    	'opacity': '1',
		    	'pointer-events': 'all'
		});
	}
  console.log($(this).val());
});
$('.first-form-part').click(function (){
	$(this).replaceWith('<button class="progressie-button second-form-part">Volgende Stap</button>');
	$('.second-form-part').css({
	    	'opacity': '0.5',
	    	'pointer-events': 'none'
	});
	$('.section-2-form-container').addClass('hidden-form-part');
	$('.section-3-form-container').removeClass('hidden-form-part');
	
});
$('.section-3-form-1-1 textarea').change(function(){
	$('.progressie-button').css({
	    	'opacity': '1',
	    	'pointer-events': 'all'
	});

});
$(document).on('click', '.second-form-part', function(){
	
	$(this).replaceWith('<button class="progressie-button third-form-part">Bevestig media keuze</button>');
	$('.third-form-part').css({
	    	'opacity': '0.5',
	    	'pointer-events': 'none'
	});
	$('.section-3-form-container').addClass('hidden-form-part');
	$('.section-4-form-container').removeClass('hidden-form-part');
	console.log('second-form button beeing pushed');
});
/* pers keuze */
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














