
/**
 * food/view-food.js
 *
 * @description :: Server-side controller action for handling incoming requests.
 * @help        :: See https://sailsjs.com/documentation/concepts/controllers
 */

const FoodService = require('../../../services/FoodService');
module.exports = {
  inputs: {},
  exits: {
    success: {
      viewTemplatePath: 'backend/pages/food/index',
    },
    redirect: {
      responseType: 'redirect'
    }
  },

  fn: async function (inputs, exits) {
    sails.log.info("================================ controllers/backend/food ================================");
    if (!this.req.me) {
      throw { redirect: '/backend/login' };
    }
		if (!this.req.me.isMainSchoolAdmin && (!this.req.me.role || !this.req.me.role.permissions || !this.req.me.role.permissions.food || !this.req.me.role.permissions.food.view)) {
			throw { redirect: '/backend/dashboard' };
		}
    
    let _default = await sails.helpers.getDefaultData(this.req);
    let params = this.req.allParams();
    let status = (params.status) ? (params.status) : 1;

    _default.status = status;
    return exits.success(_default);
  }
};