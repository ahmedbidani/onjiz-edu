

/**
 * event/form.js
 *
 * @description :: Server-side controller action for handling incoming requests.
 * @help        :: See https://sailsjs.com/documentation/concepts/controllers
 */

const EventService = require('../../../services/EventService');
module.exports = {
  friendlyName: 'View Edit Event',
  description: 'Display "Edit Event" page.',
  exits: {
    success: {
      viewTemplatePath: 'backend/pages/event/form',
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
			throw { redirect: '/backend/event/list' };
		}
    
    let event = {};
    let _default = await sails.helpers.getDefaultData(this.req);
    _default.manner = (this.req.param('id') == undefined ? 'add' : 'edit');
    if (_default.manner == 'edit') {
      event = await EventService.get({ id: this.req.param('id') });
    }

    _default.eventData = event;
    return exits.success(_default);
  }
};