

/**
 * New/view-New-add.js
 *
 * @description :: Server-side controller action for handling incoming requests.
 * @help        :: See https://sailsjs.com/documentation/concepts/controllers
 */

const moment = require('moment');
const PostService = require('../../../services/PostService');
const TaxonomyService = require('../../../services/TaxonomyService');
module.exports = {
  friendlyName: 'View Edit Post',
  description: 'Display "Edit Post" page.',
  exits: {
    success: {
      viewTemplatePath: 'backend/pages/post/form',
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
			throw { redirect: '/backend/post/list' };
		}
    
    let posts = {};
    let _default = await sails.helpers.getDefaultData(this.req);
    _default.manner = (this.req.param('id') == undefined ? 'add' : 'edit');
    if (_default.manner == 'edit') {
      posts = await PostService.get({ id: this.req.param('id') });
    }
    // PREPARE DATA LIST CATEGORY
    let listCategory = await TaxonomyService.find({ status: 1, type: 'category', school: this.req.me.school });
    _default.listCategory = listCategory;
    // PREPARE DATA LIST TAGS
    let listTag = await TaxonomyService.find({ status: 1, type: 'tag', school: this.req.me.school });
    _default.listTag = listTag;

    _default.postsData = posts;
    return exits.success(_default);
  }
};