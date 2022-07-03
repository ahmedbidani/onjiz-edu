/**
 * medical/detail.js
 *
 * @description :: Server-side controller action for handling incoming requests.
 * @help        :: See https://sailsjs.com/documentation/concepts/controllers
 */

module.exports = {

	friendlyName: 'Edit Management',
	description: 'Edit Management',
	inputs: {},
	exits: {
		success: {
			viewTemplatePath: 'backend/pages/medical/editStudentMedical',
		},
		redirect: {
			responseType: 'redirect'
		}
	},

	fn: async function (inputs, exits) {
		if (!this.req.me) {
			throw { redirect: '/backend' };
		}
		if (!this.req.me.isMainSchoolAdmin && (!this.req.me.role || !this.req.me.role.permissions || !this.req.me.role.permissions.event || !this.req.me.role.permissions.event.view)) {
			throw { redirect: '/backend/dashboard' };
		}
		//init
		let webSettings = this.res.locals.webSettings;
    let _default = await sails.helpers.getDefaultData(this.req);
    let idStudentMedical = this.req.params.id;
    if (idStudentMedical) {
      //let student = await StudentService.get({ id: this.req.param('id') });
      let medical = await StudentMedicalService.get({ id: idStudentMedical });
			if (medical) {
				let fullName = await sails.helpers.formatFullname(medical.student.firstName, medical.student.lastName, webSettings.value.displayName);
				medical.student.fullName = fullName;
				let moment = require('moment');
				medical.medical.date = moment(medical.medical.date, "YYYY-MM-DD").format(webSettings.value.dateFormat);
				_default.medical = medical;
			}
    }
	return exits.success(_default);
	}

};
