const i18n = require('../../../config/i18n');
module.exports = {
  friendlyName: 'View add setting',
  description: 'Display "SA Setting" page.',
  exits: {
    success: {
      viewTemplatePath: 'installation/setting',
    },
    redirect: {
      description: '',
      responseType: 'redirect'
    }
  },

  fn: async function (inputs, exits) {
    if (!this.req.me) {
      throw { redirect: '/backend/login' };
    }
    let school = await School.find({});
    let adminSchool = await User.find({ userType: 3 });
    let setting = await Setting.find({});
    if (school.length > 0) {
      if (adminSchool.length > 0) {
        if (setting.length == 2) {
          throw { redirect: '/installation/courseSession' };
        } else {
          let languages = [{ code: 'en', name: 'English' }, { code: 'vi', name: 'Vietnamese' }];
          if (sails.config.custom.LANGUAGES && sails.config.custom.LANGUAGES.length > 0) languages = sails.config.custom.LANGUAGES;
          return exits.success({
            lang: this.req.getLocale(),
            languages: languages,
            action: 'installation/setting'
          });
        }
      } else {
        throw { redirect: '/installation/account' };
      }
    } else {
      throw { redirect: '/installation/school' };
    }
  
  }
};