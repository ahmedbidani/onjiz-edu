
/**
 * subject/view-subject.js
 *
 * @description :: Server-side controller action for handling incoming requests.
 * @help        :: See https://sailsjs.com/documentation/concepts/controllers
 */

const SubjectService = require('../../../services/SubjectService');
module.exports = {
  inputs: {},
  exits: {
    success: {
      viewTemplatePath: 'backend/pages/subject/index',
    },
    redirect: {
      responseType: 'redirect'
    }
  },

  fn: async function (inputs, exits) {
    sails.log.info("================================ controllers/backend/list => TYPE ================================");    
    if (!this.req.me) {
      throw { redirect: '/backend/login' };
    }
		if (!this.req.me.isMainSchoolAdmin && (!this.req.me.role || !this.req.me.role.permissions || !this.req.me.role.permissions.subject || !this.req.me.role.permissions.subject.view)) {
			throw { redirect: '/backend/dashboard' };
		}

    let _default = await sails.helpers.getDefaultData(this.req);
    let params = this.req.allParams();
    let status = (params.status) ? (params.status) : -1;
    _default.status = status;
    
    return exits.success(_default);
  }
};