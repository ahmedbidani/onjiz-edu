const i18n = require('../../../../config/i18n');

module.exports = {


  friendlyName: 'View forgot password',


  description: 'Display "Forgot password" page.',


  exits: {

    success: {
      viewTemplatePath: 'frontend/pages/entrance/forgot-password',
    },

    redirect: {
      description: 'The requesting user is already logged in.',
      extendedDescription: 'Logged-in users should change their password in "Account settings."',
      responseType: 'redirect',
    }

  },


  fn: async function (inputs, exits) {
    let _default = await sails.helpers.getFeDefaultData(this.req)
    .tolerate('noSchoolFound', () => {
      throw { redirect: '/login' };
    });
    
    if (this.req.me) {
      throw { redirect: '/school/' + _default.school.code };
    }

    return exits.success(_default);

  }


};
