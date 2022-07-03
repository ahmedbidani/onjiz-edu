/**
 * branch/activites.js
 *
 * @description :: Server-side controller action for handling incoming requests.
 * @help        :: See https://sailsjs.com/documentation/concepts/controllers
 */

module.exports = {

	friendlyName: 'Branch Activities Management',
	description: 'Branch Activities Management',
	inputs: {},
	exits: {
		success: {
			viewTemplatePath: 'backend/pages/branch/activities',
		},
		redirect: {
			responseType: 'redirect'
		}
	},

	fn: async function (inputs, exits) {
		if (!this.req.me) {
			throw { redirect: '/backend' };
		}
		if (!this.req.me.isMainSchoolAdmin && !this.req.me.role && !this.req.me.role.permissions && !this.req.me.role.permissions.branch && !this.req.me.role.permissions.branch.view) {
			throw { redirect: '/backend/dashboard' };
		}
		//init
		let _default = await sails.helpers.getDefaultData(this.req);
		
		let params = this.req.allParams();

		let listSessions = await CourseSession.find({ status: sails.config.custom.STATUS.ACTIVE, branchOfSession: params.branchId });
		_default.listSessions = listSessions;
		

		let sessionActive = params.sessionId ? params.sessionId : listSessions.length ? listSessions[0].id : '';
		_default.sessionActive = sessionActive;

		let listClassOfSession = [];
		if(listSessions.length) listClassOfSession = await Class.find({ courseSession: sessionActive }).populate('teachers').populate('formations');
		  _default.listClassOfSession = listClassOfSession;
		
		return exits.success(_default);
	}
};
