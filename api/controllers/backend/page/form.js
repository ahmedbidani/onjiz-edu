

/**
 * New/view-New-add.js
 *
 * @description :: Server-side controller action for handling incoming requests.
 * @help        :: See https://sailsjs.com/documentation/concepts/controllers
 */

const PostService = require('../../../services/PostService');

module.exports = {
  friendlyName: 'View Edit Page',
  description: 'Display "Edit Page" page.',
  exits: {
    success: {
      viewTemplatePath: 'backend/pages/page/form',
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
		if (!this.req.me.isMainSchoolAdmin && (!this.req.me.role || !this.req.me.role.permissions || !this.req.me.role.permissions.post || (!this.req.me.role.permissions.post.add && !this.req.param('id')) || (!this.req.me.role.permissions.post.edit && this.req.param('id')))) {
			throw { redirect: '/backend/page/list' };
		}
    
    let page = {};
    let _default = await sails.helpers.getDefaultData(this.req);
    _default.manner = (this.req.param('id') == undefined ? 'add' : 'edit');
    if (_default.manner == 'edit') {
      page = await PostService.get({ id: this.req.param('id') });
    }

    _default.pageData = page;
    return exits.success(_default);
  }
};