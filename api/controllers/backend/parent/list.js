
const ParentService = require('../../../services/ParentService');

/**
 * taxonomy/list-taxonomy.js
 *
 * @description :: Server-side controller action for handling incoming requests.
 * @help        :: See https://sailsjs.com/documentation/concepts/controllers
 */

const moment = require('moment');

module.exports = {
  friendlyName: 'Parent Management',
  description: 'Parent Management',
  inputs: {},
  exits: {
    success: {
      viewTemplatePath: 'backend/pages/parent/list',
    },
    redirect: {
      responseType: 'redirect'
    }
  },
  fn: async function (inputs, exits) {
    if (!this.req.me) {
      throw { redirect: '/backend/login' };
    }
    if (!this.req.me.isMainSchoolAdmin && (!this.req.me.role || !this.req.me.role.permissions || !this.req.me.role.permissions.parent || !this.req.me.role.permissions.parent.view)) {
      throw { redirect: '/backend/dashboard' };
    }
    //init
    let _default = await sails.helpers.getDefaultData(this.req);
    let titleClass = "";
    let total = 0;
    let params = this.req.allParams();
    let mongo = require('mongodb');
    let studentIds = [];
    //get Breadcrumb for parent (filter all class)
    if (_default.classActive == '-1') {
      titleClass = sails.__('All Class');

      let classes = await Class.find({ school: this.req.me.school }).populate('students');
      for (let classObj of classes) {
        let ids = classObj.students.map((std) => {
          return std.id;
        })
        studentIds = [...studentIds, ...ids];
      }
    };
    //get Breadcrumb for parent (filter all student)
    if (_default.classActive == '3') {
      titleClass = sails.__('All Student')

      let studentIDs1 = await Student.find({ school: this.req.me.school });
      let ids = studentIDs1.map((std) => {
        return std.id;
      })
      studentIds = [...studentIds, ...ids];
    };
    let where = {};

    //get parents from students
    let std_par = await Student_Parent.find({ student: studentIds });
    let parIds = std_par.map((item) => {
      return item.parent;
    })

    parIds = _.union(parIds);
    parIds = parIds.map((item) => {
      return new mongo.ObjectID(item);
    })

    where.$and = [
      { _id: { $in: parIds } },
      { school: new mongo.ObjectID(this.req.me.school) }
    ];

    const collection = Parent.getDatastore().manager.collection(Parent.tableName);
    total = await collection.count(where);

    let status = (params.status) ? (params.status) : 1;

    _default.status = status;

    _default.titleClass = titleClass;
    _default.total = total;

    return exits.success(_default);
  }

};
