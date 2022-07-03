/**
 * attendent/index.js
 *
 * @description :: Server-side controller action for handling incoming requests.
 * @help        :: See https://sailsjs.com/documentation/concepts/controllers
 */

module.exports = {

	friendlyName: 'Attendent Management',
	description: 'Attendent Management',
	inputs: {},
	exits: {
		success: {
			viewTemplatePath: 'backend/pages/attendent/index',
		},
		redirect: {
			responseType: 'redirect'
		}
	},

	fn: async function (inputs, exits) {
		if (!this.req.me) {
			throw { redirect: '/backend' };
		}
		if (!this.req.me.isMainSchoolAdmin && (!this.req.me.role || !this.req.me.role.permissions || !this.req.me.role.permissions.attendent || !this.req.me.role.permissions.attendent.view)) {
			throw { redirect: '/backend/dashboard' };
		}
		//init
		let _default = await sails.helpers.getDefaultData(this.req);

		let allowShuttlePersonInfo = false;
		let webSettings = await Setting.findOne({ key: 'web', school: this.req.me.school });
    if (webSettings && webSettings.value && webSettings.value.allowShuttlePersonInfo) {
      allowShuttlePersonInfo = true;
		}
		_default.allowShuttlePersonInfo = allowShuttlePersonInfo;
		return exits.success(_default);
	}

};
