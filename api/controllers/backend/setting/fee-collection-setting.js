
const SettingService = require('../../../services/SettingService');
/**
 * taxonomy/list-taxonomy.js
 *
 * @description :: Server-side controller action for handling incoming requests.
 * @help        :: See https://sailsjs.com/documentation/concepts/controllers
 */
module.exports = {
  exits: {
    success: {
      viewTemplatePath: 'backend/pages/setting/fee-collection-setting',
    },
    redirect: {
      responseType: 'redirect'
    }
  },
  fn: async function (inputs, exits) {
    if (!this.req.me) {
      throw { redirect: '/backend/login' };
    }
    if (!this.req.me.isMainSchoolAdmin || this.req.me.userType != sails.config.custom.TYPE.SCHOOLADMIN) {
      throw { redirect: '/backend/dashboard' };
    }
    let _default = await sails.helpers.getDefaultData(this.req);

    // PREPARE DATA FOR GENERAL
    let web = await SettingService.get({ key: 'web', school: this.req.me.school });
    _default.web = web;

    let currencies = [{code: 'USA', title: 'USA' }, { code: 'EUR', title: 'EURO' }, {code: 'VND', title: 'Việt Nam Đồng'}];
    if (_default.CURRENCIES && _default.CURRENCIES.length > 0) currencies = _default.CURRENCIES;
    _default.currencies = currencies;
    
    return exits.success(_default);
  }
};