const FeedbackService = require('../../../services/FeedbackService');
const UserService = require('../../../services/UserService');
const ParentService = require('../../../services/ParentService');
const ClassService = require('../../../services/ClassService');
const TaxonomyService = require('../../../services/TaxonomyService');
const moment = require('moment');
module.exports = {
  friendlyName: 'View Feedback',
  description: 'Display "View Feedback" page.',
  exits: {
    success: {
      viewTemplatePath: 'backend/pages/feedback/form'
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
    let feedback = {};
    let _default = await sails.helpers.getDefaultData(this.req);
    //_default.manner = this.req.param('id') == undefined ? 'add' : 'edit';
    //if (_default.manner == 'edit') {
    feedback = await FeedbackService.get({ id: this.req.param('id') });
    //}
    let setting = await Setting.findOne({ key: 'web', school: this.req.me.school });
    let displayName = setting.value.displayName ? setting.value.displayName : 'firstlast';
    let _tmpFullname = '-';
    if (feedback.createdBy && feedback.createdBy.firstName && feedback.createdBy.lastName) {
      _tmpFullname = await sails.helpers.formatFullname(feedback.createdBy.firstName, feedback.createdBy.lastName, displayName);
    }
    if (!feedback.createdBy.emailAddress) feedback.createdBy.emailAddress = '-';
    feedback.me = false;
    if (feedback.createdBy.id == this.req.me.id) feedback.me = true;
    feedback.messageFeedback = feedback.description[feedback.description.length - 1].message;
    feedback._tmpFullname = _tmpFullname;
    feedback.time = moment(feedback.createdAt).format('HH:mm');
    feedback.createdAt = moment(feedback.createdAt).format(setting.value.dateFormat);
    let descriptions = [];
    if (feedback.description.length > 1) {
      for (let i = 0; i < feedback.description.length - 1;i++) {
        if (feedback.description[i] && feedback.description[i].user && feedback.description[i].time && feedback.description[i].message) {
          let des = {};
          des.user = feedback.description[i].user;
          des.me = false;
          if (feedback.description[i].user.id == this.req.me.id) des.me = true;
          des.time = moment(feedback.description[i].createdAt).format('HH:mm');
          des.createdAt = moment(feedback.description[i].createdAt).format(setting.value.dateFormat);
          des.message = feedback.description[i].message;
          let fullName = '-';
          if (feedback.description[i].user && feedback.description[i].user.firstName && feedback.description[i].user.lastName) {
            fullName = await sails.helpers.formatFullname(feedback.description[i].user.firstName, feedback.description[i].user.lastName, displayName);
          }
          des.user.fullName = fullName;
          descriptions.unshift(des);
        }
      }
    }
    feedback.des = descriptions;
    _default.feedbackData = feedback;


    //get user of comments
    // if (_album.comments != undefined && _album.comments.length) {
    //   _cmtUsers = {};
    //   for (let cmt of _album.comments) {
    //     let u = await UserService.get({ id: cmt.idUserPost });
    //     if (!u) {
    //       u = await ParentService.get({ id: cmt.idUserPost });
    //       cmt.type = 'PARENT';
    //     } else {
    //       cmt.type = 'TEACHER';
    //     }
    //     if (u) {
    //       cmt.userCommentObj  = u;
    //     }
    //   }
    // }
    // let _photos = [];
    // if (_default.albumData.photos)
    //   _photos = await MediaService.find({ id: _default.albumData.photos });
    
    // let arrClass = await ClassService.find({ school: this.req.me.school });

    // _default.arrClass = arrClass;
    // _default.photos = _photos;
    return exits.success(_default);
  }
};
