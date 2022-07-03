

/**
 * class/list.js
 *
 * @description :: Server-side controller action for handling incoming requests.
 * @help        :: See https://sailsjs.com/documentation/concepts/controllers
 */

const moment = require('moment');

module.exports = {

	friendlyName: 'Class Management',
	description: 'Class Management',
	inputs: {},
	exits: {
		success: {
			viewTemplatePath: 'backend/pages/class/index',
		},
		redirect: {
			responseType: 'redirect'
		}
	},

	fn: async function (inputs, exits) {

		//init
		let _default = await sails.helpers.getDefaultData(this.req);
		let params = this.req.allParams();
		let status = (params.status) ? (params.status) : 1;

		let listTeacher = await UserService.find({ userType: _default.TYPE.TEACHER, school: this.req.me.school });
		let listCourseSession = await CourseSession.find({ status: sails.config.custom.STATUS.ACTIVE, school: this.req.me.school });
		let listFormation = await FormationService.find({ status: sails.config.custom.STATUS.ACTIVE, school: this.req.me.school });
		
		_default.listFormation = listFormation;
		_default.listTeacher = listTeacher;
		_default.listCourseSession = listCourseSession;
		_default.status = status;

		return exits.success(_default);
	}

};
