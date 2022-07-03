module.exports.frontend = {

  'GET /': { action: 'frontend/home/index', locals: { layout: 'frontend/layouts/layout' } }, 
  
  //FORGOT PASSWORD
  'GET /password/forgot' : { action: 'frontend/entrance/view-forgot-password', locals: { layout: 'frontend/layouts/layout-guest' }},
  'POST  /api/v1/frontend/entrance/send-password-recovery-email': { action: 'frontend/entrance/send-password-recovery-email', locals: { layout: 'frontend/layouts/layout-guest' } },
  //LOGIN
  'GET /login': { action: 'frontend/entrance/view-login', locals: { layout: 'frontend/layouts/layout-guest' } },
  'POST /api/v1/frontend/entrance/login': { action: 'frontend/entrance/login', locals: { layout: 'frontend/layouts/layout-guest' } },
  //LOGOUT
  'GET /logout': { action: 'frontend/account/logout', locals: { layout: 'frontend/layouts/layout-guest' } },
  //SEARCH POST + EVENT
  'GET /search': { action: 'frontend/entrance/search', locals: { layout: 'frontend/layouts/layout' } },
  //PROFILE
  'GET /account/profile': { action: 'frontend/account/profile' , locals: { layout: 'frontend/layouts/layout' }},

  'GET /health': { action: 'frontend/health/index' , locals: { layout: 'frontend/layouts/layout' }},
  'GET /notice': { action: 'frontend/notice/index' , locals: { layout: 'frontend/layouts/layout' }},
  'GET /teacher': { action: 'frontend/teacher/index', locals: { layout: 'frontend/layouts/layout' }},
  'GET /menu': { action: 'frontend/menu/index' , locals: { layout: 'frontend/layouts/layout' }},
  'GET /subject': { action: 'frontend/subject/index' , locals: { layout: 'frontend/layouts/layout' }},
  'GET /news': { action: 'frontend/news/index' , locals: { layout: 'frontend/layouts/layout' }},
  'GET /news/:alias/:id': { action: 'frontend/news/detail' , locals: { layout: 'frontend/layouts/layout' }},
  'GET /gallery': { action: 'frontend/gallery/index' , locals: { layout: 'frontend/layouts/layout' }},
  'GET /gallery/:alias/:id': { action: 'frontend/gallery/detail', locals: { layout: 'frontend/layouts/layout' } },
  'GET /event': { action: 'frontend/event/index' , locals: { layout: 'frontend/layouts/layout' }},
  'GET /event/:alias/:id': { action: 'frontend/event/detail' , locals: { layout: 'frontend/layouts/layout' }},
  'GET /about-us': { action: 'frontend/aboutUs/index' , locals: { layout: 'frontend/layouts/layout' }},
  'GET /contact': { action: 'frontend/contact/index', locals: { layout: 'frontend/layouts/layout' } },
  
  //PAGE
  'GET /page/:alias/:id': { action: 'frontend/page/detail' , locals: { layout: 'frontend/layouts/layout' }},

  
  //SEND MESSAGE CONTACT
  'POST /api/v1/frontend/contact/sendMessage': { action: 'frontend/contact/send-contact-message' },
  //EVENT API
  'GET /api/v1/frontend/event/calendar': { controller: 'frontend/event/EventController', action: 'calendar' },
  //ACCOUNT API
  'PATCH /api/v1/frontend/account/edit/:id': { controller: 'frontend/account/FEAccountController', action: 'edit' },

  //MENU
  'GET /api/v1/frontend/menu/search': { controller: 'frontend/menu/MenuController', action: 'search' },

  //SCHEDULE
  'GET /api/v1/frontend/subject/search': { controller: 'frontend/subject/SubjectController', action: 'search' },

  //HEALTH API
  'GET /api/v1/frontend/health/searchStudent': { controller: 'frontend/health/FEHealthController', action: 'searchStudent' },
  'POST /api/v1/frontend/health/editStudent/:studentId': { controller: 'frontend/health/FEHealthController', action: 'editStudent' },
  
  //NOTIFICATION API
  'PUT /api/v1/frontend/notification/read/:id': { controller: 'frontend/notice/FENotificationController', action: 'read' },
}
