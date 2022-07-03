
/**
 * courseSession/view-courseSession.js
 *
 * @description :: Server-side controller action for handling incoming requests.
 * @help        :: See https://sailsjs.com/documentation/concepts/controllers
 */

const CourseSessionService = require('../../../services/CourseSessionService');
const moment = require('moment');
module.exports = {
  inputs: {},
  exits: {
    success: {
      viewTemplatePath: 'backend/pages/courseSession/index',
    },
    redirect: {
      responseType: 'redirect'
    }
  },

  fn: async function (inputs, exits) {

    let _default = await sails.helpers.getDefaultData(this.req);
    let params = this.req.allParams();
    let status = (params.status) ? (params.status) : 1;

    sails.log.info("================================ controllers/backend/list => TYPE ================================");



    _default.status = status;
    _default.currentDay = moment().format('YYYY-MM-DD');

    sails.log.info("================================ controllers/backend/list => _default ================================");

    let listCourseSession = await CourseSessionService.find({ status: status, school: this.req.me.school });
    let listBranch = await BranchService.find({ status: sails.config.custom.STATUS.ACTIVE, school: this.req.me.school });
    _default.listCourseSession = listCourseSession;
    _default.listBranch = listBranch;
    return exits.success(_default);
  }

};