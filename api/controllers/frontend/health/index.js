

/**
 * health/index.js
 *
 * @description :: Server-side controller action for handling incoming requests.
 * @help        :: See https://sailsjs.com/documentation/concepts/controllers
 */
module.exports = {

  friendlyName: 'Health Management',
  description: 'Health Management',
  inputs: {},
  exits: {
    success: {
      viewTemplatePath: 'frontend/pages/health/index',
    },
    redirect: {
      responseType: 'redirect'
    }
  },

  fn: async function (inputs, exits) {
    if (!this.req.me) {
      throw { redirect: '/login' };
    }

    let _default = await sails.helpers.getFeDefaultData(this.req)
      .tolerate('noSchoolFound', () => {
        throw { redirect: '/login' };
      });

    let listClass = [];
    if (this.req.me.userType == 3) { //SCHOOL ADMIN
      listClass = _default.listClasses;
    } else if (this.req.me.userType == 1) {//TEACHER
      listClass = await Teacher_Class.find({ teacher: this.req.me.id }).populate('classObj');
      listClass = listClass.map((item) => item.classObj).filter((item) => item.status == 1);
    }
    _default.listClass = listClass;

    let childrens = await Student_Parent.find({ parent: this.req.me.id }).populate('student');
    _default.childrens = childrens.map((item) => item.student);

    let studentMedicals = await Student_Medical.find({ student: childrens.map((item) => item.student.id) }).populate('medical');
    _default.studentMedicals = studentMedicals;

    return exits.success(_default);
  }
};
