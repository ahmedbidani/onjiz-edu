
/**
 * import/index.js
 *
 * @description :: Server-side controller action for handling incoming requests.
 * @help        :: See https://sailsjs.com/documentation/concepts/controllers
 */
module.exports = {
  exits: {
    success: {
      viewTemplatePath: 'backend/pages/import/index',
    },
    redirect: {
      responseType: 'redirect'
    }
  },
  fn: async function (inputs, exits) {
    if (!this.req.me) {
      throw { redirect: '/backend/login' };
    }
		if (!this.req.me.isMainSchoolAdmin && (!this.req.me.role || !this.req.me.role.permissions || !this.req.me.role.permissions.student || !this.req.me.role.permissions.student.add)) {
			throw { redirect: '/backend/dashboard' };
		}
    let params = this.req.allParams();
    let classObj = await Class.findOne({ id: params.classActive });
    let _default = await sails.helpers.getDefaultData(this.req);
    _default.classObj = classObj;
    return exits.success(_default);
  }

};