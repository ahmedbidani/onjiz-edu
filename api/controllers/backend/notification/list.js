

/**
 * Post/list.js
 *
 * @description :: Server-side controller action for handling incoming requests.
 * @help        :: See https://sailsjs.com/documentation/concepts/controllers
 */

module.exports = {

	friendlyName: 'Notification Management',
	description: 'Notification Management',
	inputs: {},
	exits: {
		success: {
			viewTemplatePath: 'backend/pages/notification/index',
		},
		redirect: {
			responseType: 'redirect'
		}
	},

	fn: async function (inputs, exits) { 
		if (!this.req.me) {
			throw { redirect: '/backend' };
		}
		if (!this.req.me.isMainSchoolAdmin && (!this.req.me.role || !this.req.me.role.permissions || !this.req.me.role.permissions.notification || !this.req.me.role.permissions.notification.view)) {
			throw { redirect: '/backend/dashboard' };
		}
		let _default = await sails.helpers.getDefaultData(this.req);
		let params = this.req.allParams();
		let status = (params.status) ? (params.status) : 1;
		let type = (params.type) ? (params.type) : -1;

		let totalAll = await NotificationService.count({school: this.req.me.school});
		let totalDone = await NotificationService.count({ status: _default.STATUS.DONE, school: this.req.me.school });
		let totalActive = await NotificationService.count({ status: _default.STATUS.ACTIVE, school: this.req.me.school });
		let totalDraft = await NotificationService.count({ status: _default.STATUS.DRAFT, school: this.req.me.school });
		let totalTrash = await NotificationService.count({ status: _default.STATUS.TRASH, school: this.req.me.school });

		_default.type = type;
		_default.status = status;
		_default.totalAll = totalAll;
		_default.totalDone = totalDone;
		_default.totalActive = totalActive;
		_default.totalDraft = totalDraft;
		_default.totalTrash = totalTrash;
		
		return exits.success(_default);
	}
};
