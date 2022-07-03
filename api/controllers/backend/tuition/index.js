
/**
 * tuition/view-tuition.js
 *
 * @description :: Server-side controller action for handling incoming requests.
 * @help        :: See https://sailsjs.com/documentation/concepts/controllers
 */

const TuitionService = require('../../../services/TuitionService');
const moment = require('moment');
module.exports = {

	inputs: {},

	exits: {
		success: {
			viewTemplatePath: 'backend/pages/tuition/index',
		},
		redirect: {
			responseType: 'redirect'
		}
	},

	fn: async function (inputs, exits) {
		if (!this.req.me) {
			throw { redirect: '/backend/login' };
		}
		sails.log.info("================================ controllers/backend/tuition ================================");

		let _default = await sails.helpers.getDefaultData(this.req);
		let params = this.req.allParams();
		let status = (params.status) ? (params.status) : 1;
		let classId = params.classId ? params.classId : 'all';

		let listClass = await ClassService.find({ courseSession: this.req.session.courseSessionActive });
		let currentDay = moment().format('YYYY-MM-DD');
		
		_default.listClass = listClass;
		_default.status = status;
		_default.classId = classId;
		// _default.totalAll = totalAll;
		// _default.totalActive = totalActive;
		// _default.totalDraft = totalDraft;
		// _default.totalTrash = totalTrash;
		_default.currentDay = currentDay

		let listTuition = await TuitionService.find({ courseSession: this.req.session.courseSessionActive });
		_default.listTuition = listTuition;
		return exits.success(_default);
	}

};