

/**
 * branch/list.js
 *
 * @description :: Server-side controller action for handling incoming requests.
 * @help        :: See https://sailsjs.com/documentation/concepts/controllers
 */

const moment = require('moment');

module.exports = {

	friendlyName: 'Branch Management',
	description: 'Branch Management',
	inputs: {},
	exits: {
		success: {
			viewTemplatePath: 'backend/pages/branch/index',
		},
		redirect: {
			responseType: 'redirect'
		}
	},

	fn: async function (inputs, exits) {
		if (!this.req.me) {
			throw { redirect: '/backend' };
		}
		//init
		let _default = await sails.helpers.getDefaultData(this.req);
		let params = this.req.allParams();
		let status = (params.status) ? (params.status) : 1;

		let listTeacher = await UserService.find({userType: {'in' : [_default.TYPE.TEACHER, _default.TYPE.SCHOOLADMIN] }});
		
		_default.listTeacher = listTeacher;
		_default.status = status;

		return exits.success(_default);
	}

};
