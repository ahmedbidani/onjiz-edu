
const UserService = require('../../../services/UserService');

/**
 * taxonomy/list-taxonomy.js
 *
 * @description :: Server-side controller action for handling incoming requests.
 * @help        :: See https://sailsjs.com/documentation/concepts/controllers
 */
const moment = require('moment');
module.exports = {
  exits: {
    success: {
      viewTemplatePath: 'backend/pages/user/form',
    },
    redirect: {
      responseType: 'redirect'
    }
  },
  fn: async function (inputs, exits) {
    sails.log.info("================================ controllers/backend/user/form => ================================");
    if (!this.req.me) {
      throw { redirect: '/backend/login' };
    }
		if (!this.req.me.isMainSchoolAdmin && (!this.req.me.role || !this.req.me.role.permissions || !this.req.me.role.permissions.user || (!this.req.me.role.permissions.user.add && !this.req.param('id')) || (!this.req.me.role.permissions.user.edit && this.req.param('id')))) {
			throw { redirect: '/backend/user' };
		}
    let params = this.req.allParams();
    let userId = params.id;
    let _default = await sails.helpers.getDefaultData(this.req);
    _default.manner = (this.req.param('id') == undefined ? 'add' : 'edit');
    let currentDay = moment().format('YYYY-MM-DD');
    let userObj = {};
    if(_default.manner == 'edit') {
      userObj = await UserService.get(userId);
    }
    let listRoleUser = await User_Role.find({ user: userId });
    if (listRoleUser && listRoleUser.length > 0) userObj.listRoleUser = listRoleUser.map(item => item.role);
    else userObj.listRoleUser = [];
    let Lclass = await Class.find({ school: this.req.me.school });
    let LSubjects = await Formation.find({ school: this.req.me.school});

    let status = (params.status) ? (params.status) : -1;
    let type = _default.TYPE.USER; 
    _default.Lclass = Lclass;
    _default.Lsubjects = LSubjects;
    _default.type = type;
    _default.status = status;
    _default.userObj = userObj;
    _default.currentDay = currentDay;

    
    //_default.ListRoleUser = ListRoleUser;
    let listRole = await Role.find({});
    _default.listRole = listRole;
    
    let listBranch = await Branch.find({ status: sails.config.custom.STATUS.ACTIVE, school: this.req.me.school });
    _default.listBranch = listBranch;
    
    return exits.success(_default);
  }
};