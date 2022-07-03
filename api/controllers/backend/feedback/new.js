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
      viewTemplatePath: 'backend/pages/feedback/new'
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
    let setting = await Setting.findOne({ key: 'web', school: this.req.me.school });
    let displayName = setting.value.displayName ? setting.value.displayName : 'firstlast';
    let _default = await sails.helpers.getDefaultData(this.req);
    let user = await User.find({ school: this.req.me.school });
    let listUser = [];
    if (user.length) {
      for (let userObj of user) {
        if (userObj.emailAddress) {
          if (userObj.firstName && userObj.lastName) {
            userObj.fullName = await sails.helpers.formatFullname(userObj.firstName, userObj.lastName, displayName);
            listUser.push(userObj);
          }
        }
      }
    }
    let listParents = [];
    let parents = await Parent.find({ school: this.req.me.school });
    if (parents.length) {
      for (let parent of parents) {
        if (parent.emailAddress) {
          if (parent.firstName && parent.lastName) {
            parent.fullName = await sails.helpers.formatFullname(parent.firstName, parent.lastName, displayName);
            listParents.push(parent);
          }
        }
      }
    }
    if (listUser.length) _default.user = listUser;
    if (listParents.length) _default.parents = listParents;
    //_default.manner = this.req.param('id') == undefined ? 'add' : 'edit';
    //if (_default.manner == 'edit') {

    return exits.success(_default);
  }
};