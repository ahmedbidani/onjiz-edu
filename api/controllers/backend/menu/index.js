

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
			viewTemplatePath: 'backend/pages/menu/index',
		},
		redirect: {
			responseType: 'redirect'
		}
	},

	fn: async function (inputs, exits) {
		if (!this.req.me) {
			throw { redirect: '/backend' };
		}
		if (!this.req.me.isMainSchoolAdmin && (!this.req.me.role || !this.req.me.role.permissions || !this.req.me.role.permissions.menu || !this.req.me.role.permissions.menu.view)) {
			throw { redirect: '/backend/dashboard' };
		}
		//init
		let _default = await sails.helpers.getDefaultData(this.req);
		
		_default.listFoods = await Food.find({ status: sails.config.custom.STATUS.ACTIVE, school: this.req.me.school });
    _default.manner = (!this.req.param('id') ? 'add' : 'edit');
		_default.classesApply = [];
		
    // get range time format
    let setting = await Setting.findOne({ key : 'web', school: this.req.me.school });
    let rangeTime = [];
    if (setting.value && setting.value.rangeTimeMenu) {
      rangeTime = setting.value.rangeTimeMenu;
    }
    _default.rangeTime = rangeTime;

		let classActiveObj = await Class.findOne({ id: _default.classActive }).populate('courseSession');
		_default.currCourseSession = classActiveObj.courseSession; 
		_default.startOfMonth = moment().startOf('month').format('YYYY-MM-DD');
		_default.endOfMonth = moment().endOf('month').format('YYYY-MM-DD');
		return exits.success(_default);
	}
};
