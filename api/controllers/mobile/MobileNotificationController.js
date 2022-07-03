/**
 * @copyright 2017 @ ZiniMedia Team
 * @author thanhvo
 * @create 2017/10/25 10:52
 * @update 2017/10/25 10:52
 * @file api/controllers/NotificationController.js
 */

const ErrorMessage = require('../../../config/errors');
const NotificationService = require('../../services/NotificationService');

const moment = require('moment');

const BackendNotificationController = {

  get: async (req, res) => {
    // GET ALL PARAMS
    const params = req.allParams();

    // CHECK ID PARAM
    if (!params.id) {
      return res.badRequest(ErrorMessage.NOTIFICATION_ERR_ID_REQUIRED);
    }

    // QUERY & CHECK DATA NOTIFICATION
    const notification = await NotificationService.get({
      id: params.id
    });
    if (!notification) {
      return res.badRequest(ErrorMessage.NOTIFICATION_ERR_NOT_FOUND);
    }

    // RETURN DATA NOTIFICATION
    return res.ok(notification);
  },

  list: async (req, res) => {
    // GET ALL PARAMS
    const params = req.allParams();

    // QUERY DATA NOTIFICATION
    let notifications = [];
    notifications = await Notification_Parent.find({
      where: { parent: params.id },
      skip: (params.page - 1) * params.limit,
      limit: params.limit,
      sort: 'createdAt DESC'
    }).populate('notification');

    if (!notifications.length) {
      notifications = await Notification_User.find({
        where: { user: params.id },
        skip: (params.page - 1) * params.limit,
        limit: params.limit,
        sort: 'createdAt DESC'
      }).populate('notification');
    }

    // RETURN DATA NOTIFICATION
    return res.ok(notifications);
  },

  read: async (req, res) => {
    // GET ALL PARAMS
    const params = req.allParams();
    let count = 0;

    if (params.id === null || params.id === undefined || params.id === '') {
      return res.badRequest(ErrorMessage.NOTIFICATION_ERR_ID_REQUIRED)
    }
    if (params.user) {
      await Notification_User.update({ notification: params.id, user: params.user }).set({ isRead: true });
      count = await Notification_User.find({
        where: { user: params.user, isRead: false },
        skip: 0
      });
    } else if (params.parent) {
      await Notification_Parent.update({ notification: params.id, parent: params.parent }).set({ isRead: true });
      count = await Notification_Parent.find({
        where: { parent: params.parent, isRead: false },
        skip: 0
      });
    }

    return res.ok(count.length);
  },
  
  notRead: async (req, res) => {
    // GET ALL PARAMS
    const params = req.allParams();

    // QUERY DATA NOTIFICATION
    let notifications = [];
    notifications = await Notification_Parent.find({
      where: { parent: params.id, isRead: false },
      skip: 0
    }).populate('notification');

    if (!notifications.length) {
      notifications = await Notification_User.find({
        where: { user: params.id, isRead: false },
        skip: 0
      }).populate('notification');
    }

    // RETURN DATA NOTIFICATION
    return res.ok(notifications.length);
  }
};

module.exports = BackendNotificationController;
