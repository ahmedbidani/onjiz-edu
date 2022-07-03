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
  KINDIE.signup();
  KINDIE.login();
  KINDIE.initPlugins();
  KINDIE.initialize();
  KINDIE.forgotPassword();
  //KINDIE.initChats();
});

KINDIE.initialize = function () {
  console.log(EKPAction);

  var pathName = EKPAction;
  switch (pathName) {
    case 'superAdmin/register':
      curBackendEKP = new IndexAccountSABackendEKP();
      break;
      //------------------------------------------------
    case 'backend/superadmin/school':
      curBackendEKP = new IndexListSchoolSABackendEKP();
      break;
      //------------------------------------------------
    case 'backend/agency/profile':
      curBackendEKP = new IndexFormProfileAGBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/agency/index':
      curBackendEKP = new IndexListSchoolAGBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/agency/form':
      curBackendEKP = new IndexFormSchoolAGBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/superadmin/form-school':
      curBackendEKP = new IndexFormSchoolSABackendEKP();
      break;
      //------------------------------------------------
    case 'backend/superadmin/form-school-admin':
      curBackendEKP = new IndexFormSchoolAdminSABackendEKP();
      break;
      //------------------------------------------------
    case 'backend/superadmin/role':
      curBackendEKP = new IndexRoleSABackendEKP();
      break;
      //------------------------------------------------
    case 'installation/account':
      curBackendEKP = new IndexAccountSABackendEKP();
      break;
      //------------------------------------------------
    case 'backend/superadmin/agency':
      curBackendEKP = new IndexListAgencySABackendEKP();
      break;
      //------------------------------------------------
    case 'backend/superadmin/form-agency':
    curBackendEKP = new IndexFormAgencySABackendEKP();
    break;
    //------------------------------------------------
    case 'backend/agency/form-school-admin':
      curBackendEKP = new IndexFormSchoolAdminAGBackendEKP();
      break;
      //------------------------------------------------
    case 'installation/setting':
      curBackendEKP = new IndexSettingSABackendEKP();
      break;
      //------------------------------------------------
    case 'installation/school':
      curBackendEKP = new IndexFormSchoolSABackendEKP();
      break;
        //------------------------------------------------
      // case 'installation/courseSession':
      //   curBackendEKP = new IndexCourseSessionSABackendEKP();
      //   break;
      //------------------------------------------------
    case 'backend/dashboard/index':
      curBackendEKP = new IndexDashboardBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/album/form':
      curBackendEKP = new IndexFormAlbumBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/album/edit':
      curBackendEKP = new IndexFormAlbumBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/album/list':
      curBackendEKP = new IndexListAlbumBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/album/view':
      curBackendEKP = new IndexViewAlbumBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/food/index':
      curBackendEKP = new IndexFoodBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/subject/index':
      curBackendEKP = new IndexSubjectBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/coursesession/index':
      curBackendEKP = new IndexCourseSessionBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/taxonomy/categories':
      curBackendEKP = new IndexCategoryBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/taxonomy/tag':
      curBackendEKP = new IndexTagBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/user/index':
      curBackendEKP = new IndexListUserBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/user/form':
      curBackendEKP = new IndexUserBackendEKP();
      break;
      //------------------------------------------------
    case "backend/account/view-edit-profile":
      curBackendEKP = new IndexProfileBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/parent/list':
      curBackendEKP = new IndexListParentBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/parent/form':
      curBackendEKP = new FormIndexParentBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/setting/index':
      curBackendEKP = new IndexSettingBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/setting/fee-collection-setting':
      curBackendEKP = new IndexFeeCollectionSettingBackendEKP();
      break;
      //------------------------------------------------
      // case 'backend/schedule/add':
      //   curBackendEKP = new IndexFormScheduleBackendEKP();
      //   break;
      // //------------------------------------------------
      // case 'backend/schedule/edit':
      //   curBackendEKP = new IndexFormScheduleBackendEKP();
      //   break;
      //------------------------------------------------
    case 'backend/schedule/index':
      curBackendEKP = new IndexListScheduleBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/menu/index':
      curBackendEKP = new IndexListMenuBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/menu/form':
      curBackendEKP = new IndexFormMenuBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/attendent/index':
      curBackendEKP = new IndexAttendentBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/student/list':
      curBackendEKP = new IndexListStudentBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/studentmaster/index':
      curBackendEKP = new IndexListStudentMasterBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/pickup/index':
      curBackendEKP = new IndexPickUpBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/student/form':
      curBackendEKP = new IndexFormStudentBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/student/form':
      curBackendEKP = new IndexFormStudentBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/class/list':
      curBackendEKP = new IndexClassBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/class/change':
      curBackendEKP = new IndexChangeClassBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/post/form':
      curBackendEKP = new IndexFormPostBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/post/list':
      curBackendEKP = new IndexListPostBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/page/form':
      curBackendEKP = new IndexFormPageBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/page/list':
      curBackendEKP = new IndexListPageBackendEKP();
      break;
      //------------------------------------------------
      // case 'backend/notification/edit':
      //   curBackendEKP = new IndexFormNotificationBackendEKP();
      //   break;
      // //------------------------------------------------
    case 'backend/notification/list':
      curBackendEKP = new IndexNotificationBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/execute':
      curBackendEKP = new IndexExecuteBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/setting/index':
      curBackendEKP = new IndexSettingBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/import/form':
      curBackendEKP = new IndexFormImportBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/report/student-attendance':
      curBackendEKP = new IndexReportStudentBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/import/parent':
      curBackendEKP = new IndexFormImportParentBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/import/food':
      curBackendEKP = new IndexFormImportFoodBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/import/subject':
      curBackendEKP = new IndexFormImportSubjectBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/import/medical':
      curBackendEKP = new IndexFormImportMedicalBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/import/schedule':
      curBackendEKP = new IndexFormImportScheduleBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/import/menu':
      curBackendEKP = new IndexImportMenuBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/message/index':
      curBackendEKP = new IndexListMessageBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/message/detail':
      curBackendEKP = new IndexListMessageBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/feeitem/index':
      curBackendEKP = new IndexFeeItemBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/feeinvoice/index':
      curBackendEKP = new IndexFeeInvoiceBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/feeinvoice/form':
      curBackendEKP = new FormFeeInvoiceBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/feedback/form':
      curBackendEKP = new IndexFormFeedbackBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/feedback/new':
      curBackendEKP = new IndexFormNewFeedbackBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/branch/index':
      curBackendEKP = new IndexBranchBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/event/form':
      curBackendEKP = new IndexFormEventBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/event/list':
      curBackendEKP = new IndexListEventBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/medical/list':
      curBackendEKP = new IndexListMedicalBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/medical/detail':
      curBackendEKP = new IndexDetailMedicalBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/medical/edit':
      curBackendEKP = new IndexEditMedicalBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/medical/form':
      curBackendEKP = new IndexFormMedicalBackendEKP();
      break;
      //------------------------------------------------
    case 'backend/formation/index':
      curBackendEKP = new IndexFormationBackendEKP();
      break;
      //------------------------------------------------
    default:
      break;
  }
}

KINDIE.signup = function () {
  if ($('#frmSignup').length) {
    $('#frmSignup').validator().on('submit', (e) => {
      if (e.isDefaultPrevented()) {
        //nothing
      } else {
        e.preventDefault();
        //looks good
        console.log('[SUBMIT][START] ----- frmSignup -----');
        //prepare data
        let formData = $('#frmSignup').serializeArray();
        let tmpData = {};
        _.each(formData, (item) => {
          tmpData[item.name] = item.value;
        });
        //sign up start
        Cloud.signup.with(tmpData).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
          if (err) {
            //err from server responde
            if (err.code == 'badCombo') {
              $('#loginFail').removeClass('hidden');
              $('#otherError').addClass('hidden');
            } else {
              $('#loginFail').addClass('hidden');
              $('#otherError').removeClass('hidden');
            }
            return;
          }
          //cloud success
          console.log('----- frmSignup ----- [SUBMIT][END]');
          window.location = 'backend/login';
        });
      }
    });
  }
};

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
        const captcha = document.querySelector("#g-recaptcha-response").value;
        if (captcha.length == 0) {
          $('#captchaFail').removeClass('d-none').addClass("alert-danger");
          setTimeout(function () {
            $('#captchaFail').removeClass('alert-danger').addClass("d-none");
          }, 5000);
        }

        //looks good
        console.log('[SUBMIT][START] ----- frmLogin -----');
        //prepare data
        let formData = $('#frmLogin').serializeArray();
        let tmpData = {};
        _.each(formData, (item) => {
          tmpData[item.name] = item.value;
        });
        tmpData.captcha = captcha
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

          }
          //cloud success
          console.log('----- frmLogin ----- [SUBMIT][END]');
          window.location = '/backend/dashboard';
          // if (responseBody.user.isSuperAdmin == true) {
          //   window.location = '/sa/school';
          // } else {
          //   if (responseBody.user.isAgency == true) {
          //     window.location = '/agency/index';
          //   } else{
          //     window.location = '/backend/dashboard';
          //   }

          // }
        });
      }
    });
  }
};

KINDIE.forgotPassword = function () {
  if ($('#frmForgotPassword').length) {
    $('#frmForgotPassword').validator().on('submit', (e) => {
      if (e.isDefaultPrevented()) {
        //nothing
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
            $('#resetPasswordFail').removeClass('hidden');
            $('#resetPasswordSuccessfully').addClass('hidden');
            return;
          } else {
            $('#resetPasswordFail').addClass('hidden');
            $('#resetPasswordSuccessfully').removeClass('hidden');
          }
          //cloud success
          console.log('----- frmForgotPassword ----- [SUBMIT][END]');

        });
      }
    });
  }
}

KINDIE.initPlugins = function () {
  if ($('.preloader').length) {
    $(".preloader").fadeOut();
  }
  if ($('[data-toggle="tooltip"]').length) {
    $('[data-toggle="tooltip"]').tooltip();
  }
  if ($('.js-tags-multi-select').length) {
    $('.js-tags-multi-select').select2();
  }
  //init date range
  if ($('.input-daterange').length) {
    window.dateRange = $('.input-daterange').datepicker({
      orientation: 'bottom left'
    }).on('changeDate', function (e) {
      // `e` here contains the extra attributes
      if (e.target.name == 'start') {
        window.startDate = e.dates[0];
      } else if (e.target.name == 'end') {
        window.endDate = e.dates[0];
      }
    });;
  }
  if ($('.multi-select').length) {
    let multi = [];
    $('.multi-select').multiSelect({
      afterSelect: function (values) {
        multi.push(values);
        curBackendEKP.form.valueOfSetting = multi;
      },
      afterDeselect: function (values) {
        multi.push(values);
        curBackendEKP.form.valueOfSetting = multi;
      }
    });
  }

  $('#headerBranches').on('change', function () {
    window.location.href = window.location.pathname + "?branchId=" + this.value;
  });
}

// KINDIE.initChats = function () {
//   let userActiveId = $("#right-sidebar").attr('data-userActiveId');
//   $(".nav-settings").on("click", function() {
//     $("#right-sidebar").toggleClass("open");

//     if ($("#right-sidebar").hasClass("open")) {
//       $(".chat-list").find('li').each(function () {
//         let classId = $(this).attr('data-classId');
//         io.socket.get('/api/v1/backend/message/listGroup', { classId: classId, userActiveId : userActiveId }, function gotResponse(body, response) {
//           console.log('Data: ', body);
//           $("#timeLastTxtMsg-" + classId).html(body.data.timeLastMessage ? moment(body.data.timeLastMessage).format('hh:mm a') : '');
//           $("#lastTxtMessage-" + classId).text(body.data.lastMessage);
//           if (body.data.unreadMessages != 0) {
//             $("#numberOfUnreadMessage-" + classId).html(body.data.unreadMessages);
//             $("#numberOfUnreadMessage-" + classId).addClass('number-new-msg');
//           }
//         })
//       })
//     }
//   });
//   $(".settings-close").on("click", function() {
//     $("#right-sidebar,#theme-settings").removeClass("open");
//   });
// }
