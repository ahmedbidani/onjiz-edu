
/**
 * backend/pages/report/tuition.js
 *
 * @description :: Server-side controller action for handling incoming requests.
 * @help        :: See https://sailsjs.com/documentation/concepts/controllers
 */

const ReportTuitionService = require('../../../services/ReportTuitionService');
const TuitionService = require('../../../services/TuitionService');
const ClassService = require('../../../services/ClassService');
module.exports = {
  inputs: {},
  exits: {
    success: {
      viewTemplatePath: 'backend/pages/report/tuition',
    },
    redirect: {
      responseType: 'redirect'
    }
  },

  fn: async function (inputs, exits) {
    if (!this.req.me) {
      throw { redirect: '/backend/login' };
    }

    let _default = await sails.helpers.getDefaultData(this.req);
    let params = this.req.allParams();
    let paid = (params.paid) ? (params.paid) : -1;

    sails.log.info("================================ controllers/backend/list => TYPE ================================");


    // let totalAll = await ReportTuitionService.count();
    // let totalPaided = await ReportTuitionService.count({ paid: sails.config.custom.PAID.PAIDED });
    // let totalUnpaid = await ReportTuitionService.count({ paid: sails.config.custom.PAID.UNPAID });

    _default.paid = paid;
    // _default.totalAll = totalAll;
    // _default.totalPaided = totalPaided;
    // _default.totalUnpaid = totalUnpaid;

    let listTuitionCheck = await ReportTuitionService.find();
    // let listTuition = await TuitionService.find();
    let listClass = await ClassService.find();

    // _default.listTuition = listTuition;
    _default.listTuitionCheck = listTuitionCheck;
    _default.listClass = listClass;
    return exits.success(_default);
  }

};