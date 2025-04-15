$(function () {
    $("#slider, #slider1").responsiveSlides({
        auto: true,
        nav: true,
        speed: 1500,
        namespace: "callbacks",
        pager: false,
    });
});

jQuery(document).ready(function($) {
    $(".scroll").click(function(event){		
        event.preventDefault();
        $('html,body').animate({scrollTop:$(this.hash).offset().top},1000);
    });
});

$(document).ready(function() {
                        
    $().UItoTop({ easingType: 'easeOutQuart' });
                        
    });

$(window).load(function(){
    $('.flexslider').flexslider({
      animation: "slide",
      start: function(slider){
        $('body').removeClass('loading');
      }
    });
  });
  
  $(window).load(function() {
    $("#flexiselDemo1").flexisel({
        visibleItems:3,
        animationSpeed: 1000,
        autoPlay: true,
        autoPlaySpeed: 3000,    		
        pauseOnHover: true,
        enableResponsiveBreakpoints: true,
        responsiveBreakpoints: { 
            portrait: { 
                changePoint:480,
                visibleItems: 1
            }, 
            landscape: { 
                changePoint:640,
                visibleItems:2
            },
            tablet: { 
                changePoint:768,
                visibleItems: 2
            }
        }
    });
    
});