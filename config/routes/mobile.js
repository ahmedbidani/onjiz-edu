module.exports.mobile = {
  /************* Auth **************/
  'PUT /api/v1/mobile/auth/token': { controller: 'mobile/MobileAuthController', action: 'getToken', csrf: false  },
  'GET /api/v1/mobile/auth/sampleToken': { controller: 'mobile/MobileAuthController', action: 'sampleToken' },
  'PUT /api/v1/mobile/auth/update-token': { controller: 'mobile/MobileAuthController', action: 'updateToken', csrf: false  },

  //LOGIN
  'PUT /api/v1/mobile/entrance/login/': { controller: 'mobile/MobileLoginController', action: 'login', csrf: false  },
  'PUT /api/v1/mobile/entrance/logout/': { controller: 'mobile/MobileLoginController', action: 'logout', csrf: false  },
  'GET /api/v1/mobile/entrance/checkExpiredToken': { controller: 'mobile/MobileLoginController', action: 'checkExpiredToken' },

  //RESET-PASSWOD
  'PUT /api/v1/mobile/resetpasword/': { controller: 'mobile/MobileResetPasswordController', action: 'resetPassword', csrf: false  },

  //CHANGE-PASSWOD
  'PUT /api/v1/mobile/changepasword/': { controller: 'mobile/MobileChangePassController', action: 'changePassword', csrf: false  },

  // USER
  'PUT /api/v1/mobile/user/': { controller: 'mobile/MobileUserController', action: 'search', csrf: false  },
  'GET /api/v1/mobile/user/get/:id': { controller: 'mobile/MobileUserController', action: 'get' },
  'PUT /api/v1/mobile/user/edit': { controller: 'mobile/MobileUserController', action: 'edit', csrf: false  },
  'PUT /api/v1/mobile/user/upload': { controller: 'mobile/MobileUserController', action: 'upload', csrf: false },
  'POST /api/v1/mobile/user/addExpoToken': { controller: 'mobile/MobileUserController', action: 'addExpoToken', csrf: false  },
  'GET /api/v1/mobile/class-:classId/user': { controller: 'mobile/MobileUserController', action: 'getListTeacherByClassId' },

  // SETTINGS
  'GET /api/v1/mobile/setting/:key': { controller: 'mobile/MobileSettingsController', action: 'get' },

  // TAXONOMY
  'PUT /api/v1/mobile/taxonomy/': { controller: 'mobile/MobileTaxonomyController', action: 'search', csrf: false  },
  'GET /api/v1/mobile/taxonomy/:id/': { controller: 'mobile/MobileTaxonomyController', action: 'get' },
  'POST /api/v1/mobile/taxonomy/': { controller: 'mobile/MobileTaxonomyController', action: 'add', csrf: false  },
  'PUT /api/v1/mobile/taxonomy/:id/': { controller: 'mobile/MobileTaxonomyController', action: 'edit', csrf: false  },
  'PUT /api/v1/mobile/taxonomy/': { controller: 'mobile/MobileTaxonomyController', action: 'trash', csrf: false  },

  // PARENT
  'PUT /api/v1/mobile/parent/': { controller: 'mobile/MobileParentController', action: 'search', csrf: false  },
  'GET /api/v1/mobile/parent/get/:id': { controller: 'mobile/MobileParentController', action: 'get' },
  'PUT /api/v1/mobile/parent/edit': { controller: 'mobile/MobileParentController', action: 'edit', csrf: false  },
  'PUT /api/v1/mobile/parent/upload': { controller: 'mobile/MobileParentController', action: 'upload', csrf: false  },
  'POST /api/v1/mobile/parent/addExpoToken': { controller: 'mobile/MobileParentController', action: 'addExpoToken', csrf: false  },
  'GET /api/v1/mobile/class-:classId/parent': { controller: 'mobile/MobileParentController', action: 'getParentsFromClass' },

  // MESSAGE
  'GET /api/v1/mobile/message/listGroup': { controller: 'mobile/MobileMessageController', action: 'listGroup' },
  'POST /api/v1/mobile/message/uploadFile': { controller: 'mobile/MobileMessageController', action: 'uploadFile', csrf: false  },
  'POST /api/v1/mobile/message/storeMessageData': { controller: 'mobile/MobileMessageController', action: 'storeMessageData', csrf: false  },
  'GET /api/v1/mobile/message-:messageId/getListMessages': { controller: 'mobile/MobileMessageController', action: 'getListMessages' },
  'GET /api/v1/mobile/message-:messageId/getSeenMessage': { controller: 'mobile/MobileMessageController', action: 'getSeenMessage' },

  // STUDENT
  'GET /api/v1/mobile/student/getStudent': { controller: 'mobile/MobileStudentController', action: 'getStudent' },
  'GET /api/v1/mobile/class-:classId/student': { controller: 'mobile/MobileStudentController', action: 'getListStudentByClassId' },
  'PUT /api/v1/mobile/student/getStudentThumb': { controller: 'mobile/MobileStudentController', action: 'getStudentThumb', csrf: false  },
  'PUT /api/v1/mobile/student/updateWHHistory': { controller: 'mobile/MobileStudentController', action: 'updateWHHistory', csrf: false  },
  'PUT /api/v1/mobile/student/updateHealthHistory': { controller: 'mobile/MobileStudentController', action: 'updateHealthHistory', csrf: false  },
  'PUT /api/v1/mobile/student/edit/:id': { controller: 'mobile/MobileStudentController', action: 'edit', csrf: false  },
  'PUT /api/v1/mobile/student/upload': { controller: 'mobile/MobileStudentController', action: 'upload', csrf: false  },

  // POST
  'PUT /api/v1/mobile/post/': { controller: 'mobile/MobilePostController', action: 'search', csrf: false  },
  'GET /api/v1/mobile/post': { controller: 'mobile/MobilePostController', action: 'list' },
  'GET /api/v1/mobile/post/:id': { controller: 'mobile/MobilePostController', action: 'get' },
  'PUT /api/v1/mobile/post/addComment/': { controller: 'mobile/MobilePostController', action: 'addComment', csrf: false  },

  // ALBUM
  'GET /api/v1/mobile/class-:classId/album': { controller: 'mobile/MobileAlbumController', action: 'list' },
  'GET /api/v1/mobile/album/:id': { controller: 'mobile/MobileAlbumController', action: 'get' },
  'POST /api/v1/mobile/album': { controller: 'mobile/MobileAlbumController', action: 'add', csrf: false  },
  'PUT /api/v1/mobile/album/:id': { controller: 'mobile/MobileAlbumController', action: 'edit', csrf: false  },

  // CLASS
  'PUT /api/v1/mobile/class/': { controller: 'mobile/MobileClassController', action: 'search', csrf: false  },
  'GET /api/v1/mobile/class/:id/': { controller: 'mobile/MobileClassController', action: 'get' },
  'POST /api/v1/mobile/class/': { controller: 'mobile/MobileClassController', action: 'add', csrf: false  },
  'PUT /api/v1/mobile/class/:id/': { controller: 'mobile/MobileClassController', action: 'edit', csrf: false  },
  'PUT /api/v1/mobile/class/': { controller: 'mobile/MobileClassController', action: 'trash', csrf: false  },

  // SUBJECT
  'GET /api/v1/mobile/subject': { controller: 'mobile/MobileSubjectController', action: 'list' },
  'PUT /api/v1/mobile/subject': { controller: 'mobile/MobileSubjectController', action: 'search', csrf: false  },
  'GET /api/v1/mobile/subject/:id': { controller: 'mobile/MobileSubjectController', action: 'get' },
  'POST /api/v1/mobile/subject': { controller: 'mobile/MobileSubjectController', action: 'add', csrf: false  },
  'PUT /api/v1/mobile/subject/:id': { controller: 'mobile/MobileSubjectController', action: 'edit', csrf: false  },
  'PUT /api/v1/mobile/subject': { controller: 'mobile/MobileSubjectController', action: 'trash', csrf: false  },

  // COMMENT
  'PUT /api/v1/mobile/comment/': { controller: 'mobile/MobileCommentController', action: 'search', csrf: false  },
  'GET /api/v1/mobile/comment/:id/': { controller: 'mobile/MobileCommentController', action: 'get' },
  'POST /api/v1/mobile/comment/': { controller: 'mobile/MobileCommentController', action: 'add', csrf: false  },
  'PUT /api/v1/mobile/comment/:id/': { controller: 'mobile/MobileCommentController', action: 'edit', csrf: false  },
  'PUT /api/v1/mobile/comment/': { controller: 'mobile/MobileCommentController', action: 'trash', csrf: false  },

  // MEDIA
  // 'PUT /api/v1/mobile/media/newMedia': { controller: 'mobile/MobileMediaController', action: 'newMedia' },
  'POST /api/v1/mobile/media/add/': { controller: 'mobile/MobileMediaController', action: 'add', csrf: false  },

  // FEEDBACK
  'GET /api/v1/mobile/feedback': { controller: 'mobile/MobileFeedbackController', action: 'list' },
  'GET /api/v1/mobile/feedback/:id': { controller: 'mobile/MobileFeedbackController', action: 'get' },
  'PUT /api/v1/mobile/feedback/addFeedback/': { controller: 'mobile/MobileFeedbackController', action: 'addFeedback', csrf: false  },
  'PUT /api/v1/mobile/feedback/editFeedback/:id': { controller: 'mobile/MobileFeedbackController', action: 'editFeedback', csrf: false  },

  //FOOD
  'GET /api/v1/mobile/food': { controller: 'mobile/MobileFoodController', action: 'list' },
  'PUT /api/v1/mobile/food': { controller: 'mobile/MobileFoodController', action: 'search', csrf: false  },
  'GET /api/v1/mobile/food/:id': { controller: 'mobile/MobileFoodController', action: 'get' },
  'POST /api/v1/mobile/food': { controller: 'mobile/MobileFoodController', action: 'add', csrf: false  },
  'PUT /api/v1/mobile/food/:id': { controller: 'mobile/MobileFoodController', action: 'edit', csrf: false  },
  'PUT /api/v1/mobile/food': { controller: 'mobile/MobileFoodController', action: 'trash', csrf: false  },

  //MENU
  'GET /api/v1/mobile/menu/:id/': { controller: 'mobile/MobileMenuController', action: 'get' },
  'GET /api/v1/mobile/menu': { controller: 'mobile/MobileMenuController', action: 'search' },

  // SCHEDULE
  'GET /api/v1/mobile/schedule': { controller: 'mobile/MobileScheduleController', action: 'search' },

  //NOTIFICATION
  'GET /api/v1/mobile/notification': { controller: 'mobile/MobileNotificationController', action: 'list' },
  'GET /api/v1/mobile/notification/:id': { controller: 'mobile/MobileNotificationController', action: 'get' },
  'PUT /api/v1/mobile/notification/read': { controller: 'mobile/MobileNotificationController', action: 'read', csrf: false  },
  'GET /api/v1/mobile/notification/notRead/:id': { controller: 'mobile/MobileNotificationController', action: 'notRead' },

  // ATTEDENT
  'POST /api/v1/mobile/attendent/findOrCreate': { controller: 'mobile/MobileAttendentController', action: 'findOrCreate', csrf: false  },
  'GET /api/v1/mobile/attendent/:id': { controller: 'mobile/MobileAttendentController', action: 'get' },
  'PUT /api/v1/mobile/attendent/:id': { controller: 'mobile/MobileAttendentController', action: 'edit', csrf: false },
  'POST /api/v1/mobile/attendent/checkIn/:id': { controller: 'mobile/MobileAttendentController', action: 'checkIn', csrf: false  },
  'POST /api/v1/mobile/attendent/pushNotification': { controller: 'mobile/MobileAttendentController', action: 'pushNotification', csrf: false  },
  'GET /api/v1/mobile/attendent/tracking': { controller: 'mobile/MobileAttendentController', action: 'studentTracking' },
  'GET /api/v1/mobile/attendent/statistics': { controller: 'mobile/MobileAttendentController', action: 'statistics' },
  'GET /api/v1/mobile/attendent/checkPickUpExisted': { controller: 'mobile/MobileAttendentController', action: 'checkExisted' },

  // GET HISTORY
  'GET /api/v1/mobile/attendent/history': { controller: 'mobile/MobileAttendentController', action: 'history' },
  'GET /api/v1/mobile/attendent/historyGet': { controller: 'mobile/MobileAttendentController', action: 'historyGet' },

  // DAYOFF
  'POST /api/v1/mobile/dayOff': { controller: 'mobile/MobileDayoffController', action: 'add', csrf: false  },
  'GET /api/v1/mobile/dayOff/history': { controller: 'mobile/MobileDayoffController', action: 'history' },
  'GET /api/v1/mobile/dayOff/historyGet': { controller: 'mobile/MobileDayoffController', action: 'historyGet' },

  // PICKUP API
  'GET  /api/v1/mobile/pickup/checkExisted': { controller: 'mobile/MobilePickUpController', action: 'checkExisted' },
  'GET  /api/v1/mobile/pickup/:id': { controller: 'mobile/MobilePickUpController', action: 'get' },
  'PUT /api/v1/mobile/pickup/:id': { controller: 'mobile/MobilePickUpController', action: 'edit', csrf: false  },

  //DRIVER API
  'PUT /api/v1/mobile/driver/pickUp/:attendentId': { controller: 'mobile/MobileDriverController', action: 'pickUp', csrf: false  },
  'PUT /api/v1/mobile/driver/dropOff/:attendentId': { controller: 'mobile/MobileDriverController', action: 'dropOff', csrf: false },

  // FEE INVOICE
  'GET /api/v1/mobile/feeInvoice/list/:studentId': { controller: 'mobile/MobileFeeInvoiceController', action: 'listByStudent' },
  'GET /api/v1/mobile/feeInvoice/:id': { controller: 'mobile/MobileFeeInvoiceController', action: 'get' },

  // PAYMENT
  'POST /api/v1/mobile/payment/add': { controller: 'mobile/MobilePaymentController', action: 'add', csrf: false  }

}
