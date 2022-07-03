let moment = require('moment');

module.exports = {
  exits: {
    success: {
      viewTemplatePath: 'frontend/pages/home/index',
      description: 'Display the dashboard for authenticated users.'
    },
    redirect: {
      responseType: 'redirect'
    }
  },
  fn: async function (inputs, exits) {
    //redirect for installation
    let adminSchool = await User.find({ userType: 3 });
    if (adminSchool.length == 0) {
      throw { redirect: '/sa/register' };
    }

    //redirect to backend login
    if (!this.req.me || !this.req.me.school) {
      throw { redirect: '/login' };
    } else {
      let school = await School.findOne({ id: this.req.me.school });
      throw { redirect: '/school/' + school.code };
    }

  }
};
