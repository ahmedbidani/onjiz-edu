
const UserService = require('../../../services/UserService');

/**
 * taxonomy/list-taxonomy.js
 *
 * @description :: Server-side controller action for handling incoming requests.
 * @help        :: See https://sailsjs.com/documentation/concepts/controllers
 */
module.exports = {
    exits: {
        success: {
            viewTemplatePath: 'backend/pages/user/index',
        },
        redirect: {
            responseType: 'redirect'
        }
    },
    fn: async function (inputs, exits) {
        if (!this.req.me) {
            throw { redirect: '/backend/login' };
        }
		if (!this.req.me.isMainSchoolAdmin && (!this.req.me.role || !this.req.me.role.permissions || !this.req.me.role.permissions.user || !this.req.me.role.permissions.user.view)) {
			throw { redirect: '/backend/dashboard' };
		}
        let _default = await sails.helpers.getDefaultData(this.req);
        let params = this.req.allParams();
        let status = (params.status) ? (params.status) : sails.config.custom.STATUS.ACTIVE;
        let type = (params.userType) ? (params.userType) : 1;

        let schoolAdmin = await UserService.count({ userType: sails.config.custom.TYPE.SCHOOLADMIN, school: this.req.me.school });
        _default.schoolAdmin = schoolAdmin;
        _default.type = type;
        _default.status = status;

        return exits.success(_default);
    }

};