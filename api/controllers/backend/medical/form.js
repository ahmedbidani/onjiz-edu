

/**
 * medical/form.js
 *
 * @description :: Server-side controller action for handling incoming requests.
 * @help        :: See https://sailsjs.com/documentation/concepts/controllers
 */
let moment = require('moment');
const EventService = require('../../../services/EventService');
module.exports = {
  friendlyName: 'View Edit Event',
  description: 'Display "Edit Event" page.',
  exits: {
    success: {
      viewTemplatePath: 'backend/pages/medical/form',
    },
    error: {
      description: 'Error.',
      responseType: 'badRequest'
    },
		redirect: {
			responseType: 'redirect'
		}
  },

  fn: async function (inputs, exits) {
		if (!this.req.me) {
			throw { redirect: '/backend' };
    }
		if (!this.req.me.isMainSchoolAdmin && (!this.req.me.role || !this.req.me.role.permissions || !this.req.me.role.permissions.event || (!this.req.me.role.permissions.event.add && !this.req.param('id')) || (!this.req.me.role.permissions.event.edit && this.req.param('id')))) {
			throw { redirect: '/backend/medical/list' };
		}
    
    let event = {};
    let _default = await sails.helpers.getDefaultData(this.req);
    _default.manner = 'add';
    let medical = {};
    if (this.req.params.id) {
      
      medical = await Medical.findOne({ id: this.req.params.id });

      _default.manner = 'edit';
    }
    _default.medical = medical;
    if(!medical.date) _default.medical.date = moment().format('YYYY-MM-DD');
    return exits.success(_default);
  }
};