/**
 * album/view-album-add.js
 *
 * @description :: Server-side controller action for handling incoming requests.
 * @help        :: See https://sailsjs.com/documentation/concepts/controllers
 */

const AlbumService = require('../../../services/AlbumService');
const UserService = require('../../../services/UserService');
const ParentService = require('../../../services/ParentService');
const ClassService = require('../../../services/ClassService');
const TaxonomyService = require('../../../services/TaxonomyService');
module.exports = {
  friendlyName: 'View Edit Album',
  description: 'Display "Edit Album" page.',
  exits: {
    success: {
      viewTemplatePath: 'backend/pages/album/form'
    },
    error: {
      description: 'Error.',
      responseType: 'badRequest'
    },
		redirect: {
			responseType: 'redirect'
		}
  },

  fn: async function(inputs, exits) {
    if (!this.req.me) {
      throw { redirect: '/backend' };
    }
		if (!this.req.me.isMainSchoolAdmin && (!this.req.me.role || !this.req.me.role.permissions || !this.req.me.role.permissions.album || (!this.req.me.role.permissions.album.add && !this.req.param('id')) || (!this.req.me.role.permissions.album.edit && this.req.param('id')))) {
			throw { redirect: '/backend/album/list' };
		}

    let _album = {};
    let _default = await sails.helpers.getDefaultData(this.req);
    _default.manner = this.req.param('id') == undefined ? 'add' : 'edit';
    if (_default.manner == 'edit') {
      _album = await AlbumService.get({ id: this.req.param('id') });
    }

    _default.albumData = _album;
    //get user of comments
    if (_album.comments != undefined && _album.comments.length) {
      _cmtUsers = {};
      for (let cmt of _album.comments) {
        let u = await UserService.get({ id: cmt.idUserPost });
        if (!u) {
          u = await ParentService.get({ id: cmt.idUserPost });
          cmt.type = 'PARENT';
        } else {
          cmt.type = 'TEACHER';
        }
        if (u) {
          cmt.userCommentObj  = u;
        }
      }
    }
    let _photos = [];
    if (_default.albumData.photos)
      _photos = await MediaService.find({ id: _default.albumData.photos });
    
    let arrClass = await ClassService.find({ school: this.req.me.school });

    _default.arrClass = arrClass;
    _default.photos = _photos;
    return exits.success(_default);
  }
};
