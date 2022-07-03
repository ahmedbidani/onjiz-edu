
/**
 * feeInvoice/view-feeInvoice.js
 *
 * @description :: Server-side controller action for handling incoming requests.
 * @help        :: See https://sailsjs.com/documentation/concepts/controllers
 */
const moment = require('moment');

module.exports = {
  inputs: {},
  exits: {
    success: {
      viewTemplatePath: 'backend/pages/feeInvoice/form',
    },
    redirect: {
      responseType: 'redirect'
    }
  },

  fn: async function (inputs, exits) {
    sails.log.info("================================ controllers/backend/feeInvoice/add ================================");
    if (!this.req.me) {
      throw { redirect: '/backend/login' };
    }
		if (!this.req.me.isMainSchoolAdmin && (!this.req.me.role || !this.req.me.role.permissions || !this.req.me.role.permissions.feeInvoice || !this.req.me.role.permissions.feeInvoice.add)) {
			throw { redirect: '/backend/feeInvoice' };
		}
    
    let _default = await sails.helpers.getDefaultData(this.req);
 
		_default.dateFormat = _default.webSettings && _default.webSettings.value && _default.webSettings.value.dateFormat ? _default.webSettings.value.dateFormat : 'DD/MM/YYYY' ;
		let currentDay = moment().format(_default.dateFormat);
    _default.currentDay = currentDay;
    _default.selectDate = moment().add(1,'M').format(_default.dateFormat);

    let listFeeItems = await FeeItem.find({ school: this.req.me.school});
    _default.listFeeItems = listFeeItems;
    
    return exits.success(_default);
  }
};