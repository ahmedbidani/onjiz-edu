const i18n = require('../../../../config/i18n');

module.exports = {


  friendlyName: 'View forgot password',


  description: 'Display "Forgot password" page.',


  exits: {

    success: {
      viewTemplatePath: 'backend/pages/entrance/forgot-password',
    },

    redirect: {
      description: 'The requesting user is already logged in.',
      extendedDescription: 'Logged-in users should change their password in "Account settings."',
      responseType: 'redirect',
    }

  },


  fn: async function (inputs, exits) {

    if (this.req.me) {
      throw {redirect: '/backend'};
    }

    return exits.success({
      CURRENT_PAGE: sails.config.custom.BACKEND.FORGOT_PASSWORD,
      lang: this.req.getLocale()
    });

  }


};
