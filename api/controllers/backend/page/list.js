

/**
 * Page/list.js
 *
 * @description :: Server-side controller action for handling incoming requests.
 * @help        :: See https://sailsjs.com/documentation/concepts/controllers
 */

module.exports = {

	friendlyName: 'Page Management',
	description: 'Page Management',
	inputs: {},
	exits: {
		success: {
			viewTemplatePath: 'backend/pages/page/index',
		},
		redirect: {
			responseType: 'redirect'
		}
	},

	fn: async function (inputs, exits) {
		if (!this.req.me) {
			throw { redirect: '/backend' };
		}
		if (!this.req.me.isMainSchoolAdmin && (!this.req.me.role || !this.req.me.role.permissions || !this.req.me.role.permissions.post || !this.req.me.role.permissions.post.view)) {
			throw { redirect: '/backend/dashboard' };
		}
		//init
		let _default = await sails.helpers.getDefaultData(this.req);
		let params = this.req.allParams();
		let status = (params.status) ? (params.status) : 1;
		let type = 1;

		_default.type = type;
		_default.status = status;
		return exits.success(_default);
	}

};
