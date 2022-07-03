/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

var routes_api = require('./routes/api');
// var routes_frontend = require('./routes/frontend');
var routes_api_mobile = require('./routes/mobile');
var routes_socket_mobile = require('./routes/socket');

module.exports.routes = Object.assign(routes_api_mobile.mobile, routes_api.api, routes_socket_mobile.socket, {


  //  ╦ ╦╔═╗╔╗ ╔═╗╔═╗╔═╗╔═╗╔═╗
  //  ║║║║╣ ╠╩╗╠═╝╠═╣║ ╦║╣ ╚═╗
  //  ╚╩╝╚═╝╚═╝╩  ╩ ╩╚═╝╚═╝╚═╝

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` your home page.            *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/
 //==============================
 // SUPER ADMIN
 //==============================
 'GET /sa/register': { action: 'backend/superAdmin/register', locals: { layout: 'backend/layouts/layout-sa-register' } },
 'GET /sa/school': { action: 'backend/superAdmin/school', locals: { layout: 'backend/layouts/layout-sa' } },
 'GET /sa/school/add': { action: 'backend/superAdmin/form-school', locals: { layout: 'backend/layouts/layout-sa' } },
 'GET /sa/school/edit/:id': { action: 'backend/superAdmin/form-school', locals: { layout: 'backend/layouts/layout-sa' } },
 'GET /sa/school-:schoolId/admin/add': { action: 'backend/superAdmin/form-school-admin', locals: { layout: 'backend/layouts/layout-sa' } },
 'GET /sa/school-:schoolId/admin/edit/:id': { action: 'backend/superAdmin/form-school-admin', locals: { layout: 'backend/layouts/layout-sa' } },
 'GET /sa/role': { action: 'backend/superAdmin/role', locals: { layout: 'backend/layouts/layout-sa' } },
 'GET /sa/agency': { action: 'backend/superAdmin/agency', locals: { layout: 'backend/layouts/layout-sa' } },
 'GET /sa/agency/add': { action: 'backend/superAdmin/form-agency', locals: { layout: 'backend/layouts/layout-sa' } },
 'GET /sa/agency/edit/:id': { action: 'backend/superAdmin/form-agency', locals: { layout: 'backend/layouts/layout-sa' } },

 // AGENCY
 'GET /agency/index': { action: 'backend/agency/index', locals: { layout: 'backend/layouts/layout-ag' } },
 'GET /agency/school/add': { action: 'backend/agency/form', locals: { layout: 'backend/layouts/layout-ag' } },
 'GET /agency/school/edit/:id': { action: 'backend/agency/form', locals: { layout: 'backend/layouts/layout-ag' } },
 'GET /agency/school-:schoolId/admin/add': { action: 'backend/agency/form-school-admin', locals: { layout: 'backend/layouts/layout-ag' } },
 'GET /agency/school-:schoolId/admin/edit/:id': { action: 'backend/agency/form-school-admin', locals: { layout: 'backend/layouts/layout-ag' } },
 'GET /agency/profile': { action: 'backend/agency/profile', locals: { layout: 'backend/layouts/layout-ag' } },
 //==============================
 // INSTALLATION FOR SCHOOL
 //==============================
 'GET /installation/school': { action: 'installation/school', locals: { layout: 'installation/layouts/layout-installation' } },
 'GET /installation/account': { action: 'installation/account', locals: { layout: 'installation/layouts/layout-installation' } },
 'GET /installation/setting': { action: 'installation/setting', locals: { layout: 'installation/layouts/layout-installation' } },
//  'GET /installation/courseSession': { action: 'installation/coursesession', locals: { layout: 'installation/layouts/layout-installation' } },

 //==================================
  // ADMIN VIEW ZONE
  //==================================

  'GET /': { action: 'backend/dashboard/index', locals: { layout: 'backend/layouts/layout' } },

  'GET /backend/login': { action: 'backend/entrance/view-login', locals: { layout: 'backend/layouts/layout-guest' } },
  'GET /backend/logout': { action: 'backend/account/logout', locals: { layout: 'backend/layouts/layout-guest' } },

  'GET /backend/password/forgot': { action: 'backend/entrance/view-forgot-password', locals: { layout: 'backend/layouts/layout-guest' } },
  'GET /backend/account/profile': { action: 'backend/account/view-edit-profile', locals: { layout: 'backend/layouts/layout' }  },

  'GET /backend/dashboard': { action: 'backend/dashboard/index', locals: { layout: 'backend/layouts/layout' } },

  // Setting ----- WebForm
  //'GET /backend/setting': { action: 'backend/setting/list', locals: { layout: 'backend/layouts/layout' }  },

  //USER ----- User/List
  'GET /backend/user': { action: 'backend/user/index', locals: { layout: 'backend/layouts/layout' }  },
  'GET /backend/user/add': { action: 'backend/user/form', locals: { layout: 'backend/layouts/layout' }  },
  'GET /backend/user/edit/:id': { action: 'backend/user/form', locals: { layout: 'backend/layouts/layout' }  },

  //POST (type = NEWS)
  'GET /backend/post/list': { action: 'backend/post/list', locals: { layout: 'backend/layouts/layout' }  },
  'GET /backend/post/add': { action: 'backend/post/form', locals: { layout: 'backend/layouts/layout' }  },
  'GET /backend/post/edit/:id': { action: 'backend/post/form', locals: { layout: 'backend/layouts/layout' }  },

  //ALBUM
  'GET /backend/album/list': { action: 'backend/album/list', locals: { layout: 'backend/layouts/layout' } },
  'GET /backend/album/add': { action: 'backend/album/form', locals: { layout: 'backend/layouts/layout' } },
  'GET /backend/album/edit/:id': { action: 'backend/album/form', locals: { layout: 'backend/layouts/layout' } },
  'GET /backend/album/view/:id': { action: 'backend/album/view', locals: { layout: 'backend/layouts/layout' } },

  //Notification
  'GET /backend/notification/list': { action: 'backend/notification/list', locals: { layout: 'backend/layouts/layout' } },

  //Taxonomies
  'GET /backend/category': { action: 'backend/taxonomy/categories', locals: { layout: 'backend/layouts/layout' } },
  'GET /backend/tag': { action: 'backend/taxonomy/tag', locals: { layout: 'backend/layouts/layout' } },

  //Schedule
  'GET /backend/class-:classId/schedule': { action: 'backend/schedule/index', locals: { layout: 'backend/layouts/layout' } },
  // 'GET /backend/schedule/add': { action: 'backend/schedule/form', locals: { layout: 'backend/layouts/layout' }  },
  'GET /backend/buildSchedule': { action: 'backend/schedule/build' , locals: { layout: 'backend/layouts/layout' } },

  //Menu
  'GET /backend/class-:classId/menu': { action: 'backend/menu/index', locals: { layout: 'backend/layouts/layout' }  },
  // 'GET /backend/menu/add': { action: 'backend/menu/form', locals: { layout: 'backend/layouts/layout' }  },
  // 'GET /backend/menu/edit/:id': { action: 'backend/menu/form', locals: { layout: 'backend/layouts/layout' }  },

  //Attendance
  'GET /backend/class-:classActive/attendent': { action: 'backend/attendent/index', locals: { layout: 'backend/layouts/layout' }  },
  'GET /backend/attendent/filter': { action: 'backend/attendent/index', locals: { layout: 'backend/layouts/layout' }  },

  //Student
  'GET /backend/branch-:branchActive/class-:classActive/student': { action: 'backend/student/list', locals: { layout: 'backend/layouts/layout' }  },
  'GET /backend/branch-:branchActive/student': { action: 'backend/student/list', locals: { layout: 'backend/layouts/layout' }  },
  'GET /backend/student/filter': { action: 'backend/student/list', locals: { layout: 'backend/layouts/layout' }  },
  'GET /backend/student/add': { action: 'backend/student/form', locals: { layout: 'backend/layouts/layout' }  },
  'GET /backend/student/edit/:id': { action: 'backend/student/form', locals: { layout: 'backend/layouts/layout' }  },

  'GET /backend/student': { action: 'backend/student/index', locals: { layout: 'backend/layouts/layout' }  },
  'GET /backend/studentMaster': { action: 'backend/studentMaster/index', locals: { layout: 'backend/layouts/layout' }  },
  'GET /backend/studentMaster/filter': { action: 'backend/studentMaster/index', locals: { layout: 'backend/layouts/layout' }  },


  // Pick up
  'GET /backend/class-:classActive/pickup': { action: 'backend/pickup/index', locals: { layout: 'backend/layouts/layout' }  },
  'GET /backend/pickup/filter': { action: 'backend/pickup/index', locals: { layout: 'backend/layouts/layout' }  },
  //PARENT ----- Parent/List
  'GET /backend/class-:classId/parent': { action: 'backend/parent/list', locals: { layout: 'backend/layouts/layout' }  },
  'GET /backend/parent/filter': { action: 'backend/parent/list', locals: { layout: 'backend/layouts/layout' }  },
  'GET /backend/parent/add': { action: 'backend/parent/form', locals: { layout: 'backend/layouts/layout' }  },
  'GET /backend/parent/edit/:id': { action: 'backend/parent/form', locals: { layout: 'backend/layouts/layout' }  },


  //Branch
  'GET /backend/branch': { action: 'backend/branch/index', locals: { layout: 'backend/layouts/layout' } },
  'GET /backend/branch-:branchId/activities': { action: 'backend/branch/activities', locals: { layout: 'backend/layouts/layout' } },

  //Class
  'GET /backend/class': { action: 'backend/class/list', locals: { layout: 'backend/layouts/layout' } },

  // Change class
  'GET /backend/class/change': { action: 'backend/class/change', locals: { layout: 'backend/layouts/layout' }  },

  //Food
  'GET /backend/food': { action: 'backend/food/index', locals: { layout: 'backend/layouts/layout' }  },

  //Subject
  'GET /backend/subject': { action: 'backend/subject/index', locals: { layout: 'backend/layouts/layout' }  },

  // COURSE SESSION
  'GET /backend/courseSession': { action: 'backend/courseSession/index', locals: { layout: 'backend/layouts/layout' }  },

  //Setting
  'GET /backend/setting': { action: 'backend/setting/index' , locals: { layout: 'backend/layouts/layout' } },
  'GET /backend/setting/feeCollection': { action: 'backend/setting/fee-collection-setting' , locals: { layout: 'backend/layouts/layout' } },

  //IMPORT
  'GET /backend/class-:classActive/importStudent': { action: 'backend/import/form' , locals: { layout: 'backend/layouts/layout' } },
  'GET /backend/class-:classActive/importParent': { action: 'backend/import/parent', locals: { layout: 'backend/layouts/layout' } },
  'GET /backend/importFood': { action: 'backend/import/food', locals: { layout: 'backend/layouts/layout' } },
  'GET /backend/importSubject': { action: 'backend/import/subject', locals: { layout: 'backend/layouts/layout' } },
  'GET /backend/importSchedule': { action: 'backend/import/schedule' , locals: { layout: 'backend/layouts/layout' } },
  'GET /backend/importMenu': { action: 'backend/import/menu', locals: { layout: 'backend/layouts/layout' } },
  'GET /backend/importMedical': { action: 'backend/import/medical' , locals: { layout: 'backend/layouts/layout' } },

  //MESSAGE
  'GET /backend/message/class-:id': { action: 'backend/message/detail' , locals: { layout: 'backend/layouts/layout' } },
  'GET /backend/message': { action: 'backend/message/index', locals: { layout: 'backend/layouts/layout' }  },

  //FEE CURRENCY
  'GET /backend/currency': { action: 'backend/currency/index', locals: { layout: 'backend/layouts/layout' }  },

  //FEE ITEM
  'GET /backend/feeItem': { action: 'backend/feeItem/index', locals: { layout: 'backend/layouts/layout' }  },

  //FEEDBACK
  'GET /backend/feedback': { action: 'backend/feedback/list', locals: { layout: 'backend/layouts/layout' }  },
  'GET /backend/feedback/form/:id': { action: 'backend/feedback/form', locals: { layout: 'backend/layouts/layout' } },
  'GET /backend/feedback/new': { action: 'backend/feedback/new', locals: { layout: 'backend/layouts/layout' }  },

  //FEE INVOICE
  'GET /backend/feeInvoice': { action: 'backend/feeInvoice/index', locals: { layout: 'backend/layouts/layout' }  },
  'GET /backend/feeInvoice/add': { action: 'backend/feeInvoice/form', locals: { layout: 'backend/layouts/layout' }  },

  //EVENT
  'GET /backend/event/list': { action: 'backend/event/list', locals: { layout: 'backend/layouts/layout' }  },
  'GET /backend/event/add': { action: 'backend/event/form', locals: { layout: 'backend/layouts/layout' }  },
  'GET /backend/event/edit/:id': { action: 'backend/event/form', locals: { layout: 'backend/layouts/layout' } },

  //MEDICAL
  'GET /backend/medical/list': { action: 'backend/medical/list', locals: { layout: 'backend/layouts/layout' }  },
  'GET /backend/medical/add': { action: 'backend/medical/form', locals: { layout: 'backend/layouts/layout' } },
  'GET /backend/medical/edit/:id': { action: 'backend/medical/form', locals: { layout: 'backend/layouts/layout' } },
  'GET /backend/medical/detail/:id': { action: 'backend/medical/detail', locals: { layout: 'backend/layouts/layout' } },
  'GET /backend/medical/editStudentMedical/:id': { action: 'backend/medical/edit', locals: { layout: 'backend/layouts/layout' } },

  //POST (type = PAGE)
  'GET /backend/page/list': { action: 'backend/page/list', locals: { layout: 'backend/layouts/layout' }  },
  'GET /backend/page/add': { action: 'backend/page/form', locals: { layout: 'backend/layouts/layout' }  },
  'GET /backend/page/edit/:id': { action: 'backend/page/form', locals: { layout: 'backend/layouts/layout' } },

  'GET /backend/report/student-attendance': { action: 'backend/report/student-attendance', locals: { layout: 'backend/layouts/layout' } },
  // 'GET /backend/report/export': { action: 'backend/report/exportStudent', locals: { layout: 'backend/layouts/layout' }  },
  'GET /backend/report/student-attendance/filter': { action: 'backend/report/student-attendance', locals: { layout: 'backend/layouts/layout' }  },

  //FORMATION
  'GET /backend/formation': { action: 'backend/formation/index', locals: { layout: 'backend/layouts/layout' }  },

  'GET /not-found': { action: 'view-not-found', locals: { layout: 'backend/layouts/layout-guest' } }
});
