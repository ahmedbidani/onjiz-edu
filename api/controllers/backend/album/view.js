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
      viewTemplatePath: 'backend/pages/album/view'
    },
    error: {
      description: 'Error.',
      responseType: 'badRequest'
    }
  },

  fn: async function(inputs, exits) {
    if (!this.req.me) {
      throw { redirect: '/backend' };
    }
		if (!this.req.me.isMainSchoolAdmin && (!this.req.me.role || !this.req.me.role.permissions || !this.req.me.role.permissions.album || !this.req.me.role.permissions.album.view)) {
			throw { redirect: '/backend/dashboard' };
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
    let _photos = await MediaService.find({
      id: _default.albumData.photos
    });
    let photos = [];
    let thumbLink = '/images/no-thumb.png';
    if (_photos.length > 0) {
      for (let item of _photos) {
        photos.push(item.thumbnail.path.replace('assets', ''));
      }
    } else {
      photos.push(thumbLink);
    }
    _default.photos = photos;
    return exits.success(_default);
  }
};
