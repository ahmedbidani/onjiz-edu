

/**
 * album/list.js
 *
 * @description :: Server-side controller action for handling incoming requests.
 * @help        :: See https://sailsjs.com/documentation/concepts/controllers
 */

const moment = require('moment');

module.exports = {

	friendlyName: 'Album Management',
	description: 'Album Management',
	inputs: {},
	exits: {
		success: {
			viewTemplatePath: 'backend/pages/album/index',
		},
		redirect: {
			responseType: 'redirect'
		}
	},

	fn: async function (inputs, exits) {
		if (!this.req.me) {
			throw { redirect: '/backend' };
		}
		if (!this.req.me.isMainSchoolAdmin && (!this.req.me.role || !this.req.me.role.permissions || !this.req.me.role.permissions.album || !this.req.me.role.permissions.album.view)) {
			throw { redirect: '/backend/dashboard' };
		}
		//init
		let _default = await sails.helpers.getDefaultData(this.req);
		let params = this.req.allParams();
		let status = (params.status) ? (params.status) : 1;
		let type = (params.type) ? (params.type) : -1;

		// let totalAll = await AlbumService.count({});
		// let totalActive = await AlbumService.count({ status: _default.STATUS.ACTIVE });
		// let totalDraft = await AlbumService.count({ status: _default.STATUS.DRAFT });
		// let totalTrash = await AlbumService.count({ status: _default.STATUS.TRASH });

		_default.type = type;
		_default.status = status;
		// _default.totalAll = totalAll;
		// _default.totalActive = totalActive;
		// _default.totalDraft = totalDraft;
		// _default.totalTrash = totalTrash;
		return exits.success(_default);
	}

};
