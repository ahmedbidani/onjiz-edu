/**
 * Message/MessageController
 *
 * @description :: Server-side logic for managing notification/taxonomies
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const ErrorMessage = require('../../../../config/errors');
const MessageService = require('../../../services/MessageService');
const MessageDataService = require('../../../services/MessageDataService');
const NotificationService = require('../../../services/NotificationService');
//Library
const moment = require('moment');

module.exports = {
  joinRoom: async (req, res) => {
    //api socket
    if (!req.isSocket) {
      return res.badRequest(ErrorMessage.MESSAGE_ERR_IS_NOT_SOCKET);
    }

    let params = req.allParams();
    let classID = params.classId;
    if (!classID) return res.badRequest(ErrorMessage.MESSAGE_ERR_CLASS_ID_REQUIRED);

    let group = await MessageService.get({ classObj: classID });
    //open room
    sails.sockets.join(req, 'GROUP_' + group.id);

    return res.json({
      data: group
    });
  },

  // listGroup: async (req, res) => {
  //   //api socket
  //   if (!req.isSocket) {
  //     return res.badRequest(ErrorMessage.MESSAGE_ERR_IS_NOT_SOCKET);
  //   }

  //   let params = req.allParams();
  //   let classID = params.classId;
  //   let userActiveId = params.userActiveId;
  //   let dateUse = params.dateUse ? params.dateUse : moment().format('YYYY-MM-DD');

  //   let getMessages = async (group) => { //get messageData of message obj

  //     //get array messageData to get number of unread message sort by dateUse to get message sort by time desc
  //     let rs = await MessageData.find({
  //       where: {
  //         message: group.id,
  //         dateUse: {
  //           '>=': moment(group.updatedAt).format('YYYY-MM-DD')
  //         }
  //       },
  //       sort: 'dateUse DESC'
  //     });
      
  //     let numberOfUnreadMsg = 0;
  //     if (rs.length > 0) {
  //       for (let msgData of rs) {
  //         for (let i = msgData.dataLogs.length; i > 0; i--){ //loop from end to start of array to get message by time desc
  //           if ( msgData.dataLogs.length > 0) {
  //             if (moment( msgData.dataLogs[i-1].createdAt).isAfter(moment(group.updatedAt)) && msgData.dataLogs[i-1].user != userActiveId) {
  //               numberOfUnreadMsg += 1;
  //             } else break;
              
  //           } 
  //         }
  //       }
  //     }

  //     //get last messageData to get last message and time of last message
  //     let rsLast = await MessageData.find({
  //       where: { message: group.id },
  //       sort: 'dateUse DESC'
  //     })

  //     let lastTxtMsg = '';
  //     let timeLastTxtMsg = '';

  //     if (rsLast.length > 0 && rsLast[0].dataLogs.length > 0) {
  //       let lastDataLog = rsLast[0].dataLogs.pop();
  //       lastTxtMsg = lastDataLog.txtMessage;
  //       timeLastTxtMsg = lastDataLog.createdAt;
  //     }
  //     return {
  //       id: group.id,
  //       unreadMessages: numberOfUnreadMsg,
  //       lastMessage: lastTxtMsg,
  //       timeLastMessage: timeLastTxtMsg
  //     }
  //   }
  //   //check params exists
  //   let group; let groupMessage;
  //   if (classID != undefined) {
  //     group = await MessageService.get({ classObj: classID });
  //     if (group == null) {
  //       group = await MessageService.add({
  //         classObj: classID,
  //         type: sails.config.custom.TYPE.PUBLIC
  //       })
  //       await MessageDataService.add({ message: group.id, dateUse: dateUse });
  //       groupMessage = {
  //         id: group.id,
  //         unreadMessages: 0,
  //         lastMessage: '',
  //         timeLastMessage: ''
  //       }
  //     } else {
  //       groupMessage = await getMessages(group);
        
  //       //create messageData of currentDay if not exist
  //       let msgDataObj = await MessageDataService.get({ message:group.id, dateUse: dateUse });
  //       if (!msgDataObj) await MessageDataService.add({ message: group.id, dateUse: dateUse });
  //     }
  //     //open room
  //     sails.sockets.join(req, 'GROUP_' + groupMessage.id);
  //     //response
  //     return res.json({
  //       data: groupMessage
  //     });
  //   } else {
  //     return res.badRequest(ErrorMessage.MESSAGE_ERR_TEACHER_PARENT_CLASS_ID_REQUIRED);
  //   }
  // },

  //add obj {user:'',txtMessage:''} into dataLogs of messageData
  storeMessageData: async (req, res) => {
    //api socket
    if (!req.isSocket) {
      return res.badRequest(ErrorMessage.MESSAGE_ERR_IS_NOT_SOCKET);
    }
    let params = req.allParams();
    let userId = params.userId ? params.userId : '';
    let txtMessage = params.txtMessage ? params.txtMessage : '';
    let messageId = params.messageId ? params.messageId : '';
    let dateUse = params.dateUse ? params.dateUse : moment().format('YYYY-MM-DD');

    //get messageData Obj
    let msgData = await MessageDataService.get({ message: messageId, dateUse: dateUse });

    if (msgData) {
      let dataLogs = msgData.dataLogs;
      //update dataLogs
      let data = {
        user: userId,
        txtMessage: txtMessage,
        createdAt: Date.now()
      }
      dataLogs.push(data);
  
      //update obj
      await MessageDataService.edit({ id: msgData.id }, { dataLogs: dataLogs });
    } else {
      let data = {
        message: messageId,
        dateUse: moment().format('YYYY-MM-DD'),
        dataLogs: [{
          user: userId,
          txtMessage: txtMessage,
          createdAt: Date.now()
        }],
        school: req.me.school
      }

      await MessageDataService.add(data);
    }


    //get user obj
    let userObj = await UserService.get({ id: userId });
    if (!userObj) userObj = await ParentService.get({ id: userId });

    let messageObj = await MessageService.get({ id: messageId });

    let data = {
      user: userObj,
      txtMessage: txtMessage,
      createdAt: Date.now()
    }
    /***        Send notification mes senger       ***/
    // get id of teacher and parent (do not get id of person who send message)
    let teacherIds = [];
    let parentIds = [];
    if (messageObj.classObj) {
      data.title = messageObj.classObj.title;

      let teacher_class = await Teacher_Class.find({ classObj: messageObj.classObj.id });
      teacherIds = teacher_class.map((item) => item.teacher);

      /** get all parentId of classList */
      let student_class = await Student_Class.find({ classObj: messageObj.classObj.id });

      let studentIds = student_class.map((item) => item.student);

      for (let studentId of studentIds) {
        let allStudent_Parent = await Student_Parent.find({ student: studentId });

        for (let student_parent of allStudent_Parent) {
          //just push parentId which is not in arr
          if (!parentIds.includes(student_parent.parent) && student_parent.parent != userId)
            parentIds.push(student_parent.parent);
        }
      }
    } else {
      if (messageObj.parent && messageObj.parent.id != userId) parentIds = [messageObj.parent.id];
      if (messageObj.teacher && messageObj.teacher.id != userId) teacherIds = [messageObj.teacher.id];
    }

    //push notification
    NotificationService.pushMessageNotification(messageObj.id, data, parentIds, teacherIds);

    //update last seen for message obj
    let lastSeen = messageObj.lastSeen;
    if (lastSeen.length > 0) {
      let find = lastSeen.findIndex(f => f.user === userId);
      if (find != -1) {
        lastSeen[find].lastSeen = Date.now();
      } else {
        lastSeen.push({
          user: userId,
          lastSeen: Date.now()
        })
      }
    } else {
      lastSeen.push({
        user: userId,
        lastSeen: Date.now()
      })
    }
    await MessageService.edit({ id: messageId, }, { lastSeen });

    let roomName = 'GROUP_' + messageId;
    sails.sockets.broadcast(roomName, 'CHAT_' + messageId, { user: userObj, txtMessage: txtMessage, createdAt: Date.now() });

    return res.ok();
  },

  //get messageData by messageId and dateUse
  getListMessages: async (req, res) => { 
    let params = req.allParams();

    //if (!params.dateUse) return res.badRequest(ErrorMessage.MESSAGE_ERR_DATEUSE_REQUIRED);
    if (!params.messageId && !params.classId) return res.badRequest(ErrorMessage.MESSAGE_ERR_GROUP_ID_REQUIRED);

    // const bodyParams = {
    //   limit: params.limit ? Number(params.limit) : null,
    //   offset: params.offset ? Number(params.offset) : null,
    //   sort: (params.sort && params.sort.trim().length) ? JSON.parse(params.sort) : null
    // };

    // let listMessage = await MessageDataService.find({ message: messageId }, bodyParams.limit, bodyParams.offset, bodyParams.sort);

    //let listMessage = await MessageData.findOne({ message: params.messageId, dateUse: params.dateUse });
    let messageId = '';
    if (params.messageId) {
      messageId = params.messageId;
    } else {
      let msgObj = await Message.findOne({ classObj: params.classId });
      messageId = msgObj.id;
    }

    let listMessage = await MessageData.find({ where: { message: messageId }, limit: 1, skip: (Number(params.page) - 1) * 1, sort: [{ createdAt: 'DESC' }] })
    if (listMessage && listMessage.length > 0) {
      let dataLogs = listMessage[0].dataLogs;
      if (dataLogs.length > 0) {
        for (let i = 0; i < dataLogs.length; i++) {
          let tmpUser = await User.findOne({ id: dataLogs[i].user });
          if (!tmpUser) {
            tmpUser = await Parent.findOne({ id: dataLogs[i].user });
            if (tmpUser) {
              dataLogs[i].user = tmpUser;
            }
          } else {
            dataLogs[i].user = tmpUser;
          }
        }
      }
    }

    console.log(listMessage[0]);
    return res.json({
      data: listMessage[0],
      messageId: messageId,

    });
  },

  //update lastSeen of message obj
  getSeenMessage: async (req, res) => {
    let params = req.allParams();
    let msgId = params.messageId;
    let userId = params.userId ? params.userId : '';

    let messageObj = await MessageService.get({ id: msgId });
    let lastSeen = messageObj.lastSeen;
    if (lastSeen.length > 0) {
      let find = lastSeen.findIndex(f => f.user === userId);
      if (find != -1) {
        lastSeen[find].lastSeen = Date.now();
      } else {
        lastSeen.push({
          user: userId,
          lastSeen: Date.now()
        })
      }
    } else {
      lastSeen.push({
        user: userId,
        lastSeen: Date.now()
      })
    }

    let editObj = await MessageService.edit({ id: msgId }, {
      lastSeen
    }
    );

    if (editObj) {
      return res.json({
        data: editObj
      });
    } else {
      return res.badRequest(ErrorMessage.MESSAGE_ERR_EDIT_FAIL);
    }
  }
};
