const i18n = require('../../../../config/i18n');
module.exports = {
  friendlyName: 'View register account super admin',
  description: 'Display "SA Account" page.',
  exits: {
    success: {
      viewTemplatePath: 'backend/superAdmin/register/index',
    },
    redirect: {
      description: '',
      responseType: 'redirect'
    }
  },

  fn: async function (inputs, exits) { 
    let adminSchool = await User.find({ userType: 3 });
    if (adminSchool.length > 0) {
      throw { redirect: '/backend/login' };
    }
  
    return exits.success({
      lang: this.req.getLocale(),
      action: 'superAdmin/register'
    });
  }
};