const i18n = require('../../../../config/i18n');
const custom = sails.config.custom

module.exports = {
  friendlyName: 'View login',
  description: 'Display "Login" page.',
  exits: {
    success: {
      viewTemplatePath: 'backend/pages/entrance/login',
    },
    redirect: {
      description: 'The requesting user is already logged in.',
      responseType: 'redirect'
    }
  },

  fn: async function (inputs, exits) {
    let school = await School.find({});
    if (school.length == 0) {
      throw {
        redirect: '/installation/school'
      }
    }
    let adminSchool = await User.find({
      userType: 3
    });
    if (adminSchool.length == 0) {
      throw {
        redirect: '/installation/account'
      };
    }
    if (this.req.me) {
      if (this.req.me.isSuperAdmin) throw {
        redirect: '/installation/school'
      };
      if (this.req.me.isAgency) throw {
        redirect: '/agency/index'
      }
      throw {
        redirect: '/backend/dashboard'
      };
    }

    return exits.success({
      lang: this.req.getLocale(),
      GOOGLE_PUBLIC_KEY: custom.GOOGLE_PUBLIC_KEY
    });
  }
};
