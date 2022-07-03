

/**
 * student/list.js
 *
 * @description :: Server-side controller action for handling incoming requests.
 * @help        :: See https://sailsjs.com/documentation/concepts/controllers
 */

const moment = require('moment');

module.exports = {

  friendlyName: 'Student Management',
  description: 'Student Management',
  inputs: {},
  exits: {
    success: {
      viewTemplatePath: 'backend/pages/student/index',
    },
    redirect: {
      responseType: 'redirect'
    }
  },

  fn: async function (inputs, exits) {
    if (!this.req.me) {
      throw { redirect: '/backend' };
    }
    if (!this.req.me.isMainSchoolAdmin && (!this.req.me.role || !this.req.me.role.permissions || !this.req.me.role.permissions.student || !this.req.me.role.permissions.student.view)) {
      throw { redirect: '/backend/dashboard' };
    }
    //init
    let _default = await sails.helpers.getDefaultData(this.req);
    let titleClass = "";
    let total = 0;
    //get Breadcrumb for student (filter all class)
    if (_default.classActive == '-1') {
      titleClass = sails.__('All Class');
      let params = this.req.allParams();
      let branchId = params.branchId ? params.branchId : '0';
      let mongo = require('mongodb');
      let studentIds = [];
      let session = await CourseSession.find({ branchOfSession: branchId });
      for (let sessionObj of session) {
        let classes = await Class.find({ courseSession: sessionObj.id }).populate('students');
        for (let classObj of classes) {
          let ids = classObj.students.map((std) => {
            return new mongo.ObjectID(std.id);
          })
          studentIds = [...studentIds, ...ids];
        }
      }
      let where = {};
      where.$and = [
        { _id: { $in: studentIds } },
        { school: new mongo.ObjectID(this.req.me.school) }
      ];
      const collection = Student.getDatastore().manager.collection(Student.tableName);
      total = await collection.count(where);
    };
    //get Breadcrumb for student (filter all student)
    if (_default.classActive == '3') {
      titleClass = sails.__('All Student')
      let studentArr = await StudentService.count({ school: this.req.me.school });
      total = studentArr;
    };
    let params = this.req.allParams();
    let status = (params.status) ? (params.status) : 1;
    _default.status = status;
    _default.titleClass = titleClass;
    _default.total = total;
    return exits.success(_default);
  }
};
