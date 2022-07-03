/**
 * taxonomy/view-taxonomy.js
 *
 * @description :: Server-side controller action for handling incoming requests.
 * @help        :: See https://sailsjs.com/documentation/concepts/controllers
 */

const TaxonomyService = require('../../../services/TaxonomyService');
module.exports = {
  inputs: {},
  exits: {
    success: {
      viewTemplatePath: 'backend/pages/category/index',
    },
    redirect: {
      responseType: 'redirect'
    }
  },

  fn: async function (inputs, exits) {
    if (!this.req.me) {
      throw { redirect: '/backend/login' };
    }
		if (!this.req.me.isMainSchoolAdmin && (!this.req.me.role || !this.req.me.role.permissions || !this.req.me.role.permissions.taxonomy || !this.req.me.role.permissions.taxonomy.view)) {
			throw { redirect: '/backend/dashboard' };
		}

    let _default = await sails.helpers.getDefaultData(this.req);
    let params = this.req.allParams();
    let status = (params.status) ? (params.status) : 1;

    sails.log.info("================================ controllers/backend/list => TYPE ================================");

    let totalActive = await TaxonomyService.count({ status: sails.config.custom.STATUS.ACTIVE, type: sails.config.custom.TYPE.CATEGORY, school: this.req.me.school });
    let totalDraft = await TaxonomyService.count({ status: sails.config.custom.STATUS.DRAFT, type: sails.config.custom.TYPE.CATEGORY, school: this.req.me.school }); 

    _default.status = status;
    _default.totalActive = totalActive;
    _default.totalDraft = totalDraft; 

    let listCategory = await TaxonomyService.find({ type: sails.config.custom.TYPE.CATEGORY, school: this.req.me.school });
    _default.listCategory = listCategory;
    return exits.success(_default);
  }

};