/**
 * cloud.setup.js
 *
 * Configuration for this Sails app's generated browser SDK ("Cloud").
 *
 * Above all, the purpose of this file is to provide endpoint definitions,
 * each of which corresponds with one particular route+action on the server.
 *
 * > This file was automatically generated.
 * > (To regenerate, run `sails run rebuild-cloud-sdk`)
 */

Cloud.setup({

  /* eslint-disable */
  methods: {
    //CONTACT
    "sendMessage": {
      "verb": "POST",
      "url": "/api/v1/frontend/contact/sendMessage",
      "args": ["name","email","phone","subject","message",]
    },

    //LOGIN
    "login": {
      "verb": "POST",
      "url": "/api/v1/frontend/entrance/login",
      "args": ["emailAddress", "password"]
    },
    //FORGOT PASSWORD
    "sendPasswordRecoveryEmail": {
      "verb": "POST",
      "url": "/api/v1/frontend/entrance/send-password-recovery-email",
      "args": ["emailAddress"]
    },
    //UPDATE PROFILE
    "editProfile": {
      "verb": "PATCH",
      "url": "/api/v1/frontend/account/edit/:id",
      "args": ["emailAddress", "phone", "firstName", "lastName", "password", "birthday", "status", "type", "thumbnail"]
    },

    //HEALTH
    "getStudent": {
      "verb": "GET",
      "url": "/api/v1/frontend/health/:studentId/",
      "args": ["id"]
    },
    "searchStudentByClass": {
      "verb": "GET",
      "url": "/api/v1/backend/student/searchStudent",
      "args": ["classId"]
    },
    "editStudent": {
      "verb": "POST",
      "url": "/api/v1/frontend/health/editStudent/:studentId"
    },
    //NOTIFICATION
    "readNotification": {
      "verb": "PUT",
      "url": "/api/v1/frontend/notification/read/:id"
    },
  }
  /* eslint-enable */

});
