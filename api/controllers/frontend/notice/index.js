

/**
 * notice/index.js
 *
 * @description :: Server-side controller action for handling incoming requests.
 * @help        :: See https://sailsjs.com/documentation/concepts/controllers
 */
module.exports = {

	friendlyName: 'Notification Management',
	description: 'Notification Management',
	inputs: {},
	exits: {
		success: {
			viewTemplatePath: 'frontend/pages/notice/index',
		},
		redirect: {
			responseType: 'redirect'
		}
	},

	fn: async function (inputs, exits) { 
		if (!this.req.me) {
			throw { redirect: '/login' };
		}
	
		let _default = await sails.helpers.getFeDefaultData(this.req)
			.tolerate('noSchoolFound', () => {
				throw { redirect: '/login' };
			});
		
		let limit = _default.PAGING.LIMIT;
		let count = 0;
		let numberOfPages = 0;
		let listNotification = [];

		//check current logged in user is parent or teacher
		if (this.req.me.userType) {
			count = await Notification_User.count({ user: this.req.me.id });
			numberOfPages = Math.ceil(count / limit);
			//redirect if user type wrong params page
			if (_default.pageActive != 1 && _default.pageActive > numberOfPages) {
				throw {redirect: '/notice'};
			}

			let noti_user = await Notification_User.find({ user: this.req.me.id }).limit(limit).skip(limit * (_default.pageActive - 1)).sort([{createdAt: 'DESC'}]).populate('notification');
			for(let i = 0; i < noti_user.length; i++) {
				if(noti_user[i].notification) {
					noti_user[i].notification.isRead = noti_user[i].isRead;
					listNotification.push(noti_user[i].notification);
				}
			}
		} else {
			count = await Notification_Parent.count({ parent: this.req.me.id });
			numberOfPages = Math.ceil(count / limit);
			//redirect if user type wrong params page
			if (_default.pageActive != 1 && _default.pageActive > numberOfPages) {
				throw {redirect: '/notice'};
			}

			let noti_parent = await Notification_Parent.find({ parent: this.req.me.id }).limit(limit).skip(limit * (_default.pageActive - 1)).sort([{createdAt: 'DESC'}]).populate('notification');
			for(let i = 0; i < noti_parent.length; i++) {
				if(noti_parent[i].notification) {
					noti_parent[i].notification.isRead = noti_parent[i].isRead;
					listNotification.push(noti_parent[i].notification);
				}
			}
		}
		
		_default.listNotification = listNotification;
    	_default.numberOfPages = numberOfPages;
		
		return exits.success(_default);
	}
};
