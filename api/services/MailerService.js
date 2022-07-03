/**
 * @copyright 2017 @ ZiniMedia Team
 * @author thanhvo
 * @create 2017/07/05 11:51
 * @update 2017/07/05 16:54
 * @file api/services/ErrorMessages.js
 */

'use strict';
// api/services/MailerService.js
const MailerService = {
  sendForgotPasswordMail: async (obj) => {
    console.log('==============================')
    console.log('_userFound', obj);
    console.log('==============================')
    sails.hooks.email.send(
      "forgotPasswordEmail", {
        FullName: obj.firstName + obj.lastName,
        NewPassword: obj.password,
        linkLogin: obj.linkLogin
      }, {
        to: obj.emailAddress,
        subject: "Kindie :: Forgot password"
      },
      function (err) {
        console.log(err || "Mail Sent!");
      }
    )
  },
  sendContactMessage: async (obj) => {
    console.log('==============================')
    console.log('contactObject', obj);
    console.log('==============================')
    sails.hooks.email.send(
      "contactMessage", {
        Name: obj.name,
        Email: obj.email,
        Phone: obj.phone,
        Subject: obj.subject,
        Message: obj.message
      }, {
        to: obj.mailTechnical,
        subject: "Kindie :: New contact message"
      },
      function (err) {
        console.log(err || "Mail Sent!");
      }
    )
  }
}

module.exports = MailerService;
