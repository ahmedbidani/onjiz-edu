
/**
 * formation/index.js
 *
 * @description :: Server-side controller action for handling incoming requests.
 * @help        :: See https://sailsjs.com/documentation/concepts/controllers
 */

module.exports = {
  inputs: {},
  exits: {
    success: {
      viewTemplatePath: 'backend/pages/formation/index',
    },
    redirect: {
      responseType: 'redirect'
    }
  },

  fn: async function (inputs, exits) {
    if (!this.req.me) {
      throw { redirect: '/backend/login' };
    }
		if (!this.req.me.isMainSchoolAdmin && (!this.req.me.role || !this.req.me.role.permissions || !this.req.me.role.permissions.formation || !this.req.me.role.permissions.formation.view)) {
			throw { redirect: '/backend/dashboard' };
		}

    let _default = await sails.helpers.getDefaultData(this.req);
    return exits.success(_default);
  }

};