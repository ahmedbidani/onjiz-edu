

/**
 * feedback/list.js
 *
 * @description :: Server-side controller action for handling incoming requests.
 * @help        :: See https://sailsjs.com/documentation/concepts/controllers
 */

module.exports = {

	friendlyName: 'Event Management',
	description: 'Event Management',
	inputs: {},
	exits: {
		success: {
			viewTemplatePath: 'backend/pages/feedback/list',
		},
		redirect: {
			responseType: 'redirect'
		}
	},

	fn: async function (inputs, exits) {
		let _default = await sails.helpers.getDefaultData(this.req);
		let params = this.req.allParams();
		let page = params.page ? parseInt(params.page) : 1;
		let limit = 50;
		let skip = 50 * (page - 1);
		let listFeedback = await FeedbackService.find({},limit,skip,{});
		let setting = await Setting.findOne({ key: 'web', school: this.req.me.school });
    let displayName = setting.value.displayName ? setting.value.displayName : 'firstlast';
		for (let i = 0; i < listFeedback.length; i++){
			if (listFeedback[i].createdBy) {
				listFeedback[i].me = false;
				let lengthTitle = listFeedback[i].title.length;
				if (lengthTitle > 120) {
					listFeedback[i].title = listFeedback[i].title.substring(0, 120) + '...';
				}
				if (listFeedback[i].createdBy == this.req.me.id) {
					listFeedback[i].me = true;
				} else {
					let userObj = await User.findOne({ id: listFeedback[i].createdBy });
					let parentObj = await Parent.findOne({ id: listFeedback[i].createdBy });
					if (parentObj) {
						let fullName = '-';
						if (parentObj && parentObj.firstName && parentObj.lastName) {
							fullName = await sails.helpers.formatFullname(parentObj.firstName, parentObj.lastName, displayName);
						}
						parentObj.fullName = fullName;
						listFeedback[i].createdBy = parentObj;
					} else if (userObj) {
						let fullName = '-';
						if (userObj && userObj.firstName && userObj.lastName) {
							fullName = await sails.helpers.formatFullname(userObj.firstName, userObj.lastName, displayName);
						}
						userObj.fullName = fullName;
						listFeedback[i].createdBy = userObj;
					}
				}
			}
		}
		_default.listFeedback = listFeedback;
		return exits.success(_default);
	}

};