
const SettingService = require('../../../services/SettingService');
//const TaxonomyService = require('../../../services/TaxonomyService');
/**
 * taxonomy/list-taxonomy.js
 *
 * @description :: Server-side controller action for handling incoming requests.
 * @help        :: See https://sailsjs.com/documentation/concepts/controllers
 */
module.exports = {
  exits: {
    success: {
      viewTemplatePath: 'backend/pages/setting/index',
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
    sails.log.info("================================ controllers/backend/list => TYPE ================================");

    // PREPARE DATA FOR GENERAL
    let web = await SettingService.get({ key: 'web', school: this.req.me.school });
    let app = await SettingService.get({ key: 'app', school: this.req.me.school }); 
    _default.web = web;
    _default.app = app;

    let languages = [{code: 'en', name: 'English' }, { code: 'vi', name: 'Vietnamese' }];
    if (_default.LANGUAGES && _default.LANGUAGES.length > 0) languages = _default.LANGUAGES;
    _default.languages = languages;
    
    return exits.success(_default);
  }
};