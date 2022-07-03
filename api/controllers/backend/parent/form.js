
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
      viewTemplatePath: 'backend/pages/parent/form',
    },
    redirect: {
      responseType: 'redirect'
    }
  },
  fn: async function (inputs, exits) {
    if (!this.req.me) {
      throw { redirect: '/backend/login' };
    }
		if (!this.req.me.isMainSchoolAdmin && (!this.req.me.role || !this.req.me.role.permissions || !this.req.me.role.permissions.parent || (!this.req.me.role.permissions.parent.add && !this.req.param('id')) || (!this.req.me.role.permissions.parent.edit && this.req.param('id')))) {
			throw { redirect: '/backend/dashboard' };
		}
    let _default = await sails.helpers.getDefaultData(this.req);
    _default.manner = (this.req.param('id') == undefined ? 'add' : 'edit');
    let params = this.req.allParams();
    let parentId = params.id;
    let parentObj = {};
    if (_default.manner == 'edit') {
      parentObj = await Parent.findOne(params.id).populate('students');
    }
    let status = (params.status) ? (params.status) : -1;
    let type = _default.TYPE.USER;

    sails.log.info("================================ controllers/backend/parent/add => ================================");
    _default.type = type;
    _default.status = status;
    _default.parentObj = parentObj;
    _default.parentId = parentId;
    _default.birthday = moment(parentObj.birthday).format('YYYY-MM-DD');
    let listStudent = await StudentService.find({});
    _default.listStudent = listStudent;
    sails.log.info("_default.birthday", _default.birthday);


    return exits.success(_default);
  }

};