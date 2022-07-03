const i18n = require('../../../config/i18n');
const moment = require('moment');

module.exports = {
  friendlyName: 'View register course session',
  description: 'Display course session page.',
  exits: {
    success: {
      viewTemplatePath: 'installation/course-session',
    },
    redirect: {
      description: '',
      responseType: 'redirect'
    }
  },

  fn: async function (inputs, exits) {
    let school = await School.find({});
    let adminSchool = await User.find({ userType: 3 });
    let currentCourseSession = await CourseSession.find({ isCurrent: true, school: this.req.me.school });
    let setting = await Setting.find({ school: this.req.me.school });
    if (school.length > 0) {
      if (adminSchool.length > 0) {
        if (setting.length == 0) {
          throw { redirect: '/installation/setting' };
        } else if (currentCourseSession.length > 0) {
          throw { redirect: '/backend/login' };
        }
      } else {
        throw { redirect: '/installation/account' };
      }
    } else {
      throw { redirect: '/installation/school' };
    }
  
    return exits.success({
      lang: this.req.getLocale(),
      action: 'installation/courseSession',
      startDate: moment().format('YYYY-MM-DD'),
      endDate: moment().add(1, 'y').format('YYYY-MM-DD')
    });
  }
};