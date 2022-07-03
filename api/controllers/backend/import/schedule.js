
/**
 * import/index.js
 *
 * @description :: Server-side controller action for handling incoming requests.
 * @help        :: See https://sailsjs.com/documentation/concepts/controllers
 */
module.exports = {
  exits: {
    success: {
      viewTemplatePath: 'backend/pages/import/schedule',
    },
    redirect: {
      responseType: 'redirect'
    }
  },
  fn: async function (inputs, exits) {
    if (!this.req.me) {
      throw { redirect: '/backend/login' };
    }
		if (!this.req.me.isMainSchoolAdmin && (!this.req.me.role || !this.req.me.role.permissions || !this.req.me.role.permissions.schedule || !this.req.me.role.permissions.schedule.add)) {
			throw { redirect: '/backend/dashboard' };
		}
    let params = this.req.allParams();
    let _default = await sails.helpers.getDefaultData(this.req);
    console.log('_default', _default);
    let schoolObj = await School.findOne({ id: _default.branchActiveObj.school });
    _default.schoolObj = schoolObj;
    return exits.success(_default);
  }

};