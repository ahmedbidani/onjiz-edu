/**
 * @copyright 2017 @ ZiniMedia Team
 * @author thanhvo
 * @create 2017/10/25 09:52
 * @update 2017/10/25 09:52
 * @file api/services/NotificationService.js
 */
'use strict';
const FCM = require('fcm-node');
const SERVER_KEY = sails.config.custom.SERVER_KEY;

const NotificationService = {
    get: async (options) => {
        sails.log.info("================================ NotificationService.get -> options: ================================");
        sails.log.info(options);

        let records = await Notifications.findOne(options);
        return records;

    },

    add: async (options) => {
        sails.log.info("================================ NotificationService.add -> options: ================================");
        sails.log.info(options);

        let newObj = await Notifications.create(options)
            // Some metaFields kind of usage / validation error
            .intercept('UsageError', (err) => {
                return 'invalid';
            })
            .fetch();
        sails.log.info("================================ NotificationService.add -> new object: ================================");
        sails.log.info(newObj);
        return newObj;
    },

    edit: async (query, params) => {
        sails.log.info("================================ NotificationService.edit -> query, params: ================================");
        sails.log.info(query);
        sails.log.info(params);

        let options = {};

        for (let key in Notifications.attributes) {
            if (key === "id" || key === "createdAt" || key === "toJSON") continue;

            if (params && typeof (params[key]) !== "undefined") {
                options[key] = params[key];
            }
        }

        options.updatedAt = new Date().getTime();

        let editObj = await Notifications.update(query, options).fetch();
        sails.log.info("================================ NotificationService.edit -> edit object: ================================");
        sails.log.info(editObj);
        return editObj[0];
    },

    del: (options, cb) => {
        sails.log.info("================================ NotificationService.del -> options: ================================");
        sails.log.info(options);

        Notifications.destroy(options).exec((error, deletedRecords) => {
            if (error) {
                sails.log.error(error);
                return cb(error, null);
            }

            return cb(null, deletedRecords);
        });
    },

    find: async (where, limit, skip, sort) => {
        sails.log.info("================================ NotificationService.find -> where: ================================");
        sails.log.info(JSON.stringify(where));
        sails.log.info(limit);
        sails.log.info(skip);
        sails.log.info(sort);
        where = (typeof where === 'object') ? where : {};
        limit = (limit !== 'null') ? limit : 10;
        skip = (skip !== null && typeof skip === 'number') ? skip : 0;
        sort = (sort !== null && typeof sort === 'object') ? sort : [{ createdAt: 'DESC' }];

        let notification = await Notifications.find({ where: where, limit: limit, skip: skip, sort: sort });
        return notification;
    },

    count: async (where) => {
        where = (typeof where === 'object') ? where : {};
        let totalNotification = await Notifications.count(where);
        return totalNotification;
    },

    pushFirebase: async (notification, parentIds, teacherIds) => {
      sails.log.info("================================ NotificationService.pushFirebase -> options: ================================");
      sails.log.info('notification: ' + notification);
      sails.log.info('parentIds: ' + parentIds);
      sails.log.info('teacherIds: ' + teacherIds);

      //define array obj parent & teacher
      let allParent = [];
      let allTeacher = [];
      
      /**create notification for parent */
      if (parentIds.length > 0) {
        for (let parentId of parentIds) {
          //get parent object to get fcmToken
          let parentObj = await Parent.findOne({ id: parentId });
          allParent.push(parentObj);

          //add notification_parent into db to check is parent read notification
          let newData = {
            parent: parentId,
            notification: notification.id
          }
          
          //if relation is not exist => add to database
          let isExist = await Notification_Parent.findOne(newData);
          if (!isExist) {
            newData.isRead = false;
            await Notification_Parent.create(newData);
          }
        }
      }

      /**create notification for teacher */
      if (teacherIds.length > 0) {
        for (let teacherId of teacherIds) {
          //get teacher object to get fcmToken
          let teacherObj = await User.findOne({ id: teacherId });
          allTeacher.push(teacherObj);

          //add notification_user into db to check is teacher read notification
          let newData = {
            user: teacherId,
            notification: notification.id
          }
          
          //if relation is not exist => add to database
          let isExist = await Notification_User.findOne(newData);
          if (!isExist) {
            newData.isRead = false;
            await Notification_User.create(newData);
          }
        }
      }

      let idsToken = [];
  
      //get all token of all parent
      if (allParent.length > 0) {
        for (let i = 0; i < allParent.length; i++) {
          if (allParent[i] && allParent[i].allowNotification) {
            if (allParent[i].hasOwnProperty('fcmTokeniOS')) {
              if (allParent[i].fcmTokeniOS && allParent[i].fcmTokeniOS.length > 0) {
                for (let j = 0; j < allParent[i].fcmTokeniOS.length; j++) {
                  idsToken.push(allParent[i].fcmTokeniOS[j]);
                }
              }
            }
    
            if (allParent[i].hasOwnProperty('fcmTokenAndroid')) {
              if (allParent[i].fcmTokenAndroid && allParent[i].fcmTokenAndroid.length > 0) {
                for (let j = 0; j < allParent[i].fcmTokenAndroid.length; j++) {
                  idsToken.push(allParent[i].fcmTokenAndroid[j]);
                }
              }
            }
          }
        }
      }
  
      //get all token of all teacher
      if (allTeacher.length > 0) {
        for (let i = 0; i < allTeacher.length; i++) {
          if (allTeacher[i] && allTeacher[i].allowNotification) {
            if (allTeacher[i].hasOwnProperty('fcmTokeniOS')) {
              if (allTeacher[i].fcmTokeniOS && allTeacher[i].fcmTokeniOS.length > 0) {
                for (let j = 0; j < allTeacher[i].fcmTokeniOS.length; j++) {
                  idsToken.push(allTeacher[i].fcmTokeniOS[j]);
                }
              }
            }
    
            if (allTeacher[i].hasOwnProperty('fcmTokenAndroid')) {
              if (allTeacher[i].fcmTokenAndroid && allTeacher[i].fcmTokenAndroid.length > 0) {
                for (let j = 0; j < allTeacher[i].fcmTokenAndroid.length; j++) {
                  idsToken.push(allTeacher[i].fcmTokenAndroid[j]);
                }
              }
            }
          }
        }
      }
  
      //send notification for parent and techer
      if (idsToken.length > 0) {
        let fcm = new FCM(SERVER_KEY);
  
        let message = {
          registration_ids: idsToken,
  
          notification: {
            title: notification.title,
            body: notification.message
          },
          
          data : notification
        };
  
        fcm.send(message, function (err, response) {
          if (err) {
            console.log("Something has gone wrong!");
          } else {
            console.log('Successfully');
          }
        });
      }
      sails.log.info("================================ NotificationService.pushFirebase => idsToken ================================");
      console.log("================================ NotificationService.pushFirebase => idsToken ================================");
      console.log(idsToken);
    },

    pushMessageNotification: async (messageId, notification, parentIds, teacherIds) => {
      sails.log.info("================================ NotificationService.pushMessageNotification -> options: ================================");
      sails.log.info('messageId: ' + messageId);
      sails.log.info('parentIds: ' + parentIds);
      sails.log.info('teacherIds: ' + teacherIds);

      //define array of token
      let idsToken = [];
      
      /**get all token of all parent */
      if (parentIds.length > 0) {
        for (let parentId of parentIds) {
          //get parent object to get fcmToken
          let parentObj = await Parent.findOne({ id: parentId });

          if (parentObj && parentObj.allowNotification) {
            if (parentObj.fcmTokeniOS && parentObj.fcmTokeniOS.length > 0) {
              idsToken = idsToken.concat(parentObj.fcmTokeniOS);
            }
            if (parentObj.fcmTokenAndroid && parentObj.fcmTokenAndroid.length > 0) {
              idsToken = idsToken.concat(parentObj.fcmTokenAndroid);
            }
          }
        }
      }

      /**get all token of all pteacher */
      if (teacherIds.length > 0) {
        for (let teacherId of teacherIds) {
          //get teacher object to get fcmToken
          let teacherObj = await User.findOne({ id: teacherId });

          if (teacherObj && teacherObj.allowNotification) {
            if (teacherObj.fcmTokeniOS && teacherObj.fcmTokeniOS.length > 0) {
              idsToken = idsToken.concat(teacherObj.fcmTokeniOS);
            }
            if (teacherObj.fcmTokenAndroid && teacherObj.fcmTokenAndroid.length > 0) {
              idsToken = idsToken.concat(teacherObj.fcmTokenAndroid);
            }
          }
        }
      }
  
      //send notification for parent and techer
      if (idsToken.length > 0) {
        let fcm = new FCM(SERVER_KEY);
        let title = notification.title ? notification.title : notification.user ? notification.user.firstName + ' ' + notification.user.lastName : '';
  
        let message = {
          registration_ids: idsToken,
  
          notification: {
            title: title,
            body: notification.txtMessage
          },
          
          // just send message type is data message so that application can control show or hide notification
          data: {
            notification: notification,
            messageId: messageId,
            key: 'message'
          }
        };
  
        fcm.send(message, function (err, response) {
          if (err) {
            console.log("Something has gone wrong!");
          } else {
            console.log('Successfully');
          }
        });
      }
      sails.log.info("================================ NotificationService.pushMessageNotification => idsToken ================================");
      console.log("================================ NotificationService.pushMessageNotification => idsToken ================================");
      console.log(idsToken);
    }
};

module.exports = NotificationService;