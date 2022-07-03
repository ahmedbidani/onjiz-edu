/**
 * schedule/list.js
 *
 * @description :: Server-side controller action for handling incoming requests.
 * @help        :: See https://sailsjs.com/documentation/concepts/controllers
 */

const moment = require('moment');

module.exports = {

	friendlyName: 'Schedule Management',
	description: 'Schedule Management',
	inputs: {},
	exits: {
		success: {
			viewTemplatePath: 'backend/pages/schedule/index',
		},
		redirect: {
			responseType: 'redirect'
		}
	},

	fn: async function (inputs, exits) {
		if (!this.req.me) {
			throw { redirect: '/backend' };
		}
		if (!this.req.me.isMainSchoolAdmin && (!this.req.me.role || !this.req.me.role.permissions || !this.req.me.role.permissions.schedule || !this.req.me.role.permissions.schedule.view)) {
			throw { redirect: '/backend/dashboard' };
		}
		//init
		let _default = await sails.helpers.getDefaultData(this.req);
		let listSubject = await Formation.find({ where: { school: this.req.me.school, status: 1 }, sort: [{ name: 'asc' }] });
		let listTeacher = await User.find({ where: { school: this.req.me.school, status: 1, userType: sails.config.custom.TYPE.TEACHER }, sort: [{ firstName: 'asc' }] });

		let classActiveObj = await Class.findOne({ id: _default.classActive }).populate('courseSession');
		_default.currCourseSession = classActiveObj.courseSession; 

		//const startOfMonth = moment().startOf('month').format('YYYY-MM-DD hh:mm'); 

		_default.startOfMonth = moment().startOf('month').format('YYYY-MM-DD');
		_default.endOfMonth = moment().endOf('month').format('YYYY-MM-DD');
		_default.listSubject = listSubject;
		_default.classSelect = _default.classActive;
		_default.listTeacher = listTeacher;

		//get weekend of school
		let setting = await Setting.findOne({ key: 'web', school: this.req.me.school });
		let weekend = setting.value && setting.value.weekend ? setting.value.weekend : []; //6,7 is saturday and sunday
		_default.weekend = weekend;
	
		return exits.success(_default);
	}

};
