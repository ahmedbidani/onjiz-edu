
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
      viewTemplatePath: 'backend/pages/tag/index',
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
    _default.status = status;
    let listTaxonomy = await TaxonomyService.find({ type: sails.config.custom.TYPE.TAG, school: this.req.me.school });
    _default.listTaxonomy = listTaxonomy;
    
    return exits.success(_default);
  }

};