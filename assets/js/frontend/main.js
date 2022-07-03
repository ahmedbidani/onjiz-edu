// Avoid `console` errors in browsers that lack a console.
(function ($) {
  var method;
  var noop = function () {};
  var methods = [
    'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
    'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
    'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
    'timeStamp', 'trace', 'warn'
  ];
  var length = methods.length;
  var console = (window.console = window.console || {});

  while (length--) {
    method = methods[length];

    // Only stub undefined methods.
    if (!console[method]) {
      console[method] = noop;
    }
  }

}(jQuery));

var KINDIE = KINDIE || {};
//global variable for current backend instance
var curBackendEKP;

$(document).ready(function () {
  KINDIE.initialize();
  KINDIE.login();
  KINDIE.forgotPassword();
  KINDIE.mainSlider();
  //===== Prealoder

  $(window).on('load', function (event) {
    $('#preloader').delay(500).fadeOut(500);
  });


  //===== Sticky

  $(window).on('scroll', function (event) {
    var scroll = $(window).scrollTop();
    if (scroll < 110) {
      $(".navigation").removeClass("sticky");
    } else {
      $(".navigation").addClass("sticky");
    }
  });

  //===== Search

  $('#search').on('click', function (event) {
    $(".search_bar").slideToggle(500);
  });


  //===== Mobile Menu

  $(".navbar-toggler").on('click', function () {
    $(this).toggleClass("active");
  });

  var subMenu = $('.sub-menu-bar .navbar-nav .sub-menu');

  if (subMenu.length) {
    subMenu.parent('li').children('a').append(function () {
      return '<button class="sub-nav-toggler"> <span></span> </button>';
    });

    var subMenuToggler = $('.sub-menu-bar .navbar-nav .sub-nav-toggler');

    subMenuToggler.on('click', function () {
      $(this).parent().parent().children('.sub-menu').slideToggle();
      return false
    });

  }





  //===== Counter Up

  $('.counter').counterUp({
    delay: 10,
    time: 3000
  });


  //====== Slick Testimonial

  $('.testimonial_items').slick({
    dots: true,
    arrows: false,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    adaptiveHeight: true,
  });


  //====== Slick Testimonial

  $('.testimonial_items_2').slick({
    dots: true,
    arrows: false,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    adaptiveHeight: true,
  });


  //====== Count Down

  $('[data-countdown]').each(function () {
    var $this = $(this),
      finalDate = $(this).data('countdown');
    $this.countdown(finalDate, function (event) {
      $this.html(event.strftime('<div class="register_countdown d-flex flex-wrap"><div class="single_countdown"><div class="countdown_wrapper"><span class="count">%D</span><p>Days</p></div></div><div class="single_countdown"><div class="countdown_wrapper"><span class="count">%H</span><p>Days</p></div></div><div class="single_countdown"><div class="countdown_wrapper"><span class="count">%M</span><p>Days</p></div></div><div class="single_countdown"><div class="countdown_wrapper"><span class="count">%S</span><p>Days</p></div></div></div>'));
    });
  });


  //====== slick Testimonial

  $('.testimonial_content_active').slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    dots: false,
    fade: true,
    speed: 800,
    asNavFor: '.testimonial_author_active',
  });
  $('.testimonial_author_active').slick({
    slidesToShow: 3,
    slidesToScroll: 1,
    asNavFor: '.testimonial_content_active',
    arrows: false,
    dots: false,
    speed: 800,
    centerMode: true,
    focusOnSelect: true,
    centerPadding: '0',
    responsive: [{
      breakpoint: 992,
      settings: {
        slidesToShow: 1,
      }
    }, ]
  });


  //====== slick Event

  $('.event_active_3').slick({
    slidesToShow: 3,
    slidesToScroll: 1,
    asNavFor: '.testimonial_content_active',
    arrows: false,
    dots: false,
    speed: 800,
    centerMode: true,
    focusOnSelect: true,
    centerPadding: '0',
    responsive: [{
      breakpoint: 992,
      settings: {
        slidesToShow: 1,
      }
    }, ]
  });



  //====== slick Testimonial

  $('.testimonial_content_active_3').slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    dots: false,
    fade: true,
    speed: 800,
    asNavFor: '.testimonial_author_active_3',
  });
  $('.testimonial_author_active_3').slick({
    slidesToShow: 3,
    slidesToScroll: 1,
    asNavFor: '.testimonial_content_active_3',
    arrows: false,
    dots: false,
    speed: 800,
    centerMode: true,
    focusOnSelect: true,
    centerPadding: '0',
  });



  ///===== Progress Bar

  if ($('.progress_line').length) {
    $('.progress_line').appear(function () {
      var el = $(this);
      var percent = el.data('width');
      $(el).css('width', percent + '%');
    }, {
      accY: 0
    });
  }


  //====== Magnific Popup

  $('.video-popup').magnificPopup({
    type: 'iframe'
    // other options
  });


  //===== Magnific Popup

  $('.image-popup').magnificPopup({
    type: 'image',
    gallery: {
      enabled: true
    }
  });


  //===== Nice Select

  $('select').niceSelect();



  //===== Back to top

  // Show or hide the sticky footer button
  $(window).on('scroll', function (event) {
    if ($(this).scrollTop() > 600) {
      $('.back-to-top').fadeIn(200)
    } else {
      $('.back-to-top').fadeOut(200)
    }
  });


  //Animate the scroll to yop
  $('.back-to-top').on('click', function (event) {
    event.preventDefault();

    $('html, body').animate({
      scrollTop: 0,
    }, 1500);
  });
});


//===== Slick Slider
KINDIE.mainSlider = function () {
  var BasicSlider = $('.slider-active');
  BasicSlider.on('init', function (e, slick) {
    var $firstAnimatingElements = $('.single_slider:first-child').find('[data-animation]');
    doAnimations($firstAnimatingElements);
  });
  BasicSlider.on('beforeChange', function (e, slick, currentSlide, nextSlide) {
    var $animatingElements = $('.single_slider[data-slick-index="' + nextSlide + '"]').find('[data-animation]');
    doAnimations($animatingElements);
  });
  BasicSlider.slick({
    autoplay: true,
    autoplaySpeed: 10000,
    dots: false,
    fade: true,
    arrows: true,
    prevArrow: '<span class="prev"><i class="fa fa-angle-left"></i></span>',
    nextArrow: '<span class="next"><i class="fa fa-angle-right"></i></span>',
    responsive: [{
      breakpoint: 767,
      settings: {
        arrows: false
      }
    }]
  });

  function doAnimations(elements) {
    var animationEndEvents = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
    elements.each(function () {
      var $this = $(this);
      var $animationDelay = $this.data('delay');
      var $animationType = 'animated ' + $this.data('animation');
      $this.css({
        'animation-delay': $animationDelay,
        '-webkit-animation-delay': $animationDelay
      });
      $this.addClass($animationType).one(animationEndEvents, function () {
        $this.removeClass($animationType);
      });
    });
  }
}


KINDIE.initialize = function () {
  console.log(EKPAction);
  var pathName = EKPAction;
  switch (pathName) {
    //------------------------------------------------
    case 'frontend/home/index':
      curBackendEKP = new IndexDashboardFrontendEKP();
      break;
      //------------------------------------------------
    case 'frontend/notice/index':
      curBackendEKP = new IndexNotificationFrontendEKP();
      break;
      //------------------------------------------------
    case 'frontend/news/index':
      curBackendEKP = new IndexNewsFrontendEKP();
      break;
      //------------------------------------------------
    case 'frontend/news/detail':
      curBackendEKP = new IndexNewsFrontendEKP();
      break;
      //------------------------------------------------
    case 'frontend/contact/index':
      curBackendEKP = new IndexContactFrontendEKP();
      break;
      //------------------------------------------------
    case 'frontend/gallery/index':
      curBackendEKP = new IndexGalleryFrontendEKP();
      break;
      //------------------------------------------------
    case 'frontend/subject/index':
      curBackendEKP = new IndexSubjectFrontendEKP();
      break;
      //------------------------------------------------
    case 'frontend/account/profile':
      curBackendEKP = new IndexAccountFrontendEKP();
      break;
      //------------------------------------------------
    case 'frontend/event/index':
      curBackendEKP = new IndexEventFrontendEKP();
      break;
      //------------------------------------------------
    case 'frontend/menu/index':
      curBackendEKP = new IndexMenuFrontendEKP();
      break;
      //------------------------------------------------
    case 'frontend/health/index':
      curBackendEKP = new IndexHealthFrontendEKP();
      break;
    default:
      break;
  }
}

KINDIE.login = function () {
  if ($('#frmLogin').length) {
    $('#frmLogin').validator().on('submit', (e) => {
      if (e.isDefaultPrevented()) {
        //nothing
        $('#requiredFeild').removeClass('d-none').addClass("alert-danger");
        setTimeout(function () {
          $('#requiredFeild').removeClass('alert-danger').addClass("d-none");
        }, 5000);
      } else {
        e.preventDefault();
        //looks good
        console.log('[SUBMIT][START] ----- frmLogin -----');
        //prepare data
        let formData = $('#frmLogin').serializeArray();
        let tmpData = {};
        _.each(formData, (item) => {
          tmpData[item.name] = item.value;
        });
        //sign up start
        Cloud.login.with(tmpData).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
          if (err) {
            //err from server responde
            if (err.code == 'badCombo') {
              $('#loginFail').removeClass('d-none').addClass("alert-danger");
              setTimeout(function () {
                $('#loginFail').removeClass('alert-danger').addClass("d-none");
              }, 5000);
            } else if (err.code == 'accountNotReady') {
              $('#accountNotActive').removeClass('d-none').addClass("alert-danger");
              setTimeout(function () {
                $('#accountNotActive').removeClass('alert-danger').addClass("d-none");
              }, 5000);
            } else {
              $('#loginFail').addClass('d-none');
              $('#otherError').removeClass('d-none');
              $('#accountNotActive').addClass('d-none');
            }
            return;
          } else {

            window.location = `/account/profile`;
          }

          //cloud success
          console.log('----- frmLogin ----- [SUBMIT][END]');
        });
      }
    });
  }
};

KINDIE.forgotPassword = function () {
  if ($('#frmForgotPassword').length) {
    $('#frmForgotPassword').validator().on('submit', (e) => {
      if (e.isDefaultPrevented()) {
        $('#requiredFeild').removeClass('hidden').addClass("alert-danger");
        setTimeout(function () {
          $('#requiredFeild').removeClass('alert-danger').addClass("hidden");
        }, 5000);
      } else {
        e.preventDefault();
        //looks good
        console.log('[SUBMIT][START] ----- frmForgotPassword -----');
        //prepare data
        let formData = $('#frmForgotPassword').serializeArray();
        let tmpData = {};
        _.each(formData, (item) => {
          tmpData[item.name] = item.value;
        });
        //sign up start
        Cloud.sendPasswordRecoveryEmail.with(tmpData).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
          if (err) {
            //err from server responde
            $('#resetPasswordFail').removeClass('hidden').addClass("alert-danger");
            setTimeout(function () {
              $('#resetPasswordFail').removeClass('alert-danger').addClass('hidden');
            }, 5000);
            return;
          } else {
            $('#resetPasswordSuccessfully').removeClass('hidden').addClass("alert-success");
            setTimeout(function () {
              $('#resetPasswordSuccessfully').removeClass('alert-success').addClass('hidden');
            }, 5000);
          }
          //cloud success
          console.log('----- frmForgotPassword ----- [SUBMIT][END]');

        });
      }
    });
  }
}
