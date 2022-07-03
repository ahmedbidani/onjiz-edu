
/**
 * feeInvoice/statistic.js
 *
 * @description :: Server-side controller action for handling incoming requests.
 * @help        :: See https://sailsjs.com/documentation/concepts/controllers
 */
const moment = require('moment');

module.exports = {
  inputs: {},
  exits: {
    success: {
      viewTemplatePath: 'backend/pages/feeInvoice/statistic',
    },
    redirect: {
      responseType: 'redirect'
    }
  },

  fn: async function (inputs, exits) {
    sails.log.info("================================ controllers/backend/feeInvoice/statistic ================================");
    if (!this.req.me) {
      throw { redirect: '/backend/login' };
    }
    
    let _default = await sails.helpers.getDefaultData(this.req);
    
		_default.dateFormat = _default.webSettings && _default.webSettings.value && _default.webSettings.value.dateFormat ? _default.webSettings.value.dateFormat : 'DD/MM/YYYY' ;
		let currentDay = moment().format(_default.dateFormat);
    _default.currentDay = currentDay;
 
    return exits.success(_default);
  }
};