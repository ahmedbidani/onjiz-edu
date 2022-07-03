/**
 * student/form.js
 *
 * @description :: Server-side controller action for handling incoming requests.
 * @help        :: See https://sailsjs.com/documentation/concepts/controllers
 */
const moment = require('moment');
module.exports = {
  friendlyName: 'View Edit Menu',
  description: 'Display "Edit Menu" page.',
  exits: {
    success: {
      viewTemplatePath: 'backend/pages/menu/form',
    },
    error: {
      description: 'Error.',
      responseType: 'badRequest'
    }
  },
  fn: async function (inputs, exits) {
    let params = this.req.allParams();
    let _default = await sails.helpers.getDefaultData(this.req);
    _default.listFoods = await Food.find({ status: sails.config.custom.STATUS.ACTIVE, school: this.req.me.school });
    _default.manner = (!this.req.param('id') ? 'add' : 'edit');
    _default.classesApply = [];
    if (_default.manner == 'edit') {
      let menuObj = await Menu.findOne({ id: params.id });
      // dateUse
      _default.dateUse = moment(menuObj.dateUse, "YYYY-MM-DD").format("DD/MM/YYYY");
      // classes
      _default.classesApply = menuObj.classes;
      _default.menuId = params.id;
    }
    return exits.success(_default);
  }
};