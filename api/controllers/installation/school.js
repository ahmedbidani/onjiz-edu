const i18n = require('../../../config/i18n');
module.exports = {
  friendlyName: 'View register school',
  description: 'Display "school" page.',
  exits: {
    success: {
      viewTemplatePath: 'installation/school',
    },
    redirect: {
      description: '',
      responseType: 'redirect'
    }
  },

  fn: async function (inputs, exits) {
    this.req.setLocale(i18n.i18n.defaultLocale);
    let school = await School.find({});
    let adminSchool = await User.find({ userType: 3 });
    let setting = await Setting.find({});
    if (school.length > 0) {
      if (adminSchool.length) {
        if (setting.length == 0) {
          throw { redirect: '/installation/setting' };
        } else {
          throw { redirect: '/backend/login' };
        }
      } else {
        throw { redirect: '/installation/account'}
      }
    }
    let mySchool = {};
    let _default = await sails.helpers.getSaDefaultData(this.req);
    _default.manner = (this.req.param('id') == undefined ? 'add' : 'edit');
    if (_default.manner == 'edit') {
      mySchool = await School.findOne({ id: this.req.param('id') });
    }
    if (mySchool.id) {
      userObj = await UserService.get({id: mySchool.admin})
    }
    _default.schoolData = mySchool;
    return exits.success({
      _default,
      lang: i18n.i18n.defaultLocale,
      action: 'installation/school'
    });
  }
};