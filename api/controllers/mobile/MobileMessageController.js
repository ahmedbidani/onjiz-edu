/**
 * MobileMessageController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const ErrorMessage = require("../../../config/errors");
const MessageService = require("../../services/MessageService");
const MessageDataService = require("../../services/MessageDataService");
const NotificationService = require("../../services/NotificationService");
//Library
const moment = require("moment");

module.exports = {
  listGroup: async (req, res) => {
    console.log(
      "---------------------------------listGroup-------------------------------------"
    );
    //api socket
    if (!req.isSocket) {
      return res.badRequest(ErrorMessage.MESSAGE_ERR_IS_NOT_SOCKET);
    }

    let params = req.allParams();
    var d = new Date();
    var t1 = d.getTime();
    var t2;
    var t3;
    if (!params.school) return res.badRequest(ErrorMessage.SCHOOL_ID_REQUIRED);

    let arrParam = params.arrParam;
    if (arrParam && arrParam.length > 0) {
      let arrData = [];
      for (let i = 0; i < arrParam.length; i++) {
        let classID = arrParam[i].hasOwnProperty("classId")
          ? arrParam[i].classId
          : undefined;
        let parentID = arrParam[i].hasOwnProperty("parentId")
          ? arrParam[i].parentId
          : undefined;
        let teacherID = arrParam[i].hasOwnProperty("teacherId")
          ? arrParam[i].teacherId
          : undefined;
        let userID = arrParam[i].hasOwnProperty("userId")
          ? arrParam[i].userId
          : undefined;
        let dateUse = arrParam[i].hasOwnProperty("dateUse")
          ? arrParam[i].dateUse
          : moment().format("YYYY-MM-DD");
        let getMessages = async (group) => {
          //get messageData of message obj
          //get array messageData to get number of unread message sort by dateUse to get message sort by time desc
          let rs = await MessageData.find({
            where: {
              message: group.id,
              dateUse: {
                ">=": moment(group.updatedAt).format("YYYY-MM-DD"),
              },
            },
            sort: "dateUse DESC",
          });

          let numberOfUnreadMsg = 0;
          if (rs.length > 0) {
            for (let msgData of rs) {
              for (let i = msgData.dataLogs.length; i > 0; i--) {
                //loop from end to start of array to get message by time desc
                if (msgData.dataLogs.length > 0) {
                  if (group.lastSeen.length > 0) {
                    let find = group.lastSeen.find((f) => f.user === userID);
                    if (find) {
                      if (
                        moment(msgData.dataLogs[i - 1].createdAt).isAfter(
                          moment(find.lastSeen)
                        )
                      ) {
                        numberOfUnreadMsg += 1;
                      } else break;
                    } else {
                      numberOfUnreadMsg = msgData.dataLogs.length;
                    }
                  } else {
                    numberOfUnreadMsg = msgData.dataLogs.length;
                  }
                }
              }
            }
          }

          //get last messageData to get last message and time of last message
          let rsLast = await MessageData.find({
            where: { message: group.id },
            sort: "dateUse DESC",
          });

          let lastTxtMsg = "";
          let timeLastTxtMsg = 0;

          if (rsLast.length > 0 && rsLast[0].dataLogs.length > 0) {
            let lastDataLog = rsLast[0].dataLogs.pop();
            lastTxtMsg = lastDataLog.txtMessage;
            timeLastTxtMsg = lastDataLog.createdAt;
          }
          return {
            id: group.id,
            unreadMessages: numberOfUnreadMsg,
            lastMessage: lastTxtMsg,
            timeLastMessage: timeLastTxtMsg,
          };
        };
        t2 = d.getTime() - t1;

        //console.log("----------------t2-------------------" + t2 + "---------------------");
        //check params exists
        let group;
        let groupMessage;
        if (classID != undefined) {
          group = await MessageService.get({ classObj: classID });
          if (group == null) {
            group = await MessageService.add({
              classObj: classID,
              type: sails.config.custom.TYPE.PUBLIC,
              school: params.school,
            });
            await MessageDataService.add({
              message: group.id,
              dateUse: dateUse,
              school: params.school,
            });
            groupMessage = {
              id: group.id,
              unreadMessages: 0,
              lastMessage: "",
              timeLastMessage: 0,
            };
          } else {
            groupMessage = await getMessages(group);
          }
          //open room
          sails.sockets.join(req, "GROUP_" + groupMessage.id);
          arrData.push(groupMessage);
        } else if (teacherID != undefined && parentID != undefined) {
          group = await MessageService.get({
            teacher: teacherID,
            parent: parentID,
          });
          if (group == null) {
            group = await MessageService.add({
              teacher: teacherID,
              parent: parentID,
              type: sails.config.custom.TYPE.PRIVATE,
              school: params.school,
            });
            await MessageDataService.add({
              message: group.id,
              dateUse: dateUse,
              school: params.school,
            });
            groupMessage = {
              id: group.id,
              unreadMessages: 0,
              lastMessage: "",
              timeLastMessage: 0,
            };
          } else {
            groupMessage = await getMessages(group);
          }
          //open room
          sails.sockets.join(req, "TE_PA_" + groupMessage.id);
          arrData.push(groupMessage);
        } else {
          return res.badRequest(
            ErrorMessage.MESSAGE_ERR_TEACHER_PARENT_CLASS_ID_REQUIRED
          );
        }
        t3 = d.getTime() - t2;
        //console.log("----------------t3-------------------" + t3 + "---------------------");
      }
      var t4 = d.getTime() - t3;

      //console.log("----------------t4-------------------" + t4 + "---------------------");
      return res.json({
        data: arrData,
      });
    } else {
      return res.badRequest(
        ErrorMessage.MESSAGE_ERR_TEACHER_PARENT_CLASS_ID_REQUIRED
      );
    }
  },

  uploadFile: async (req, res) => {
    console.log(req.allParams());
    req.file('file').upload(
      {
        dirname: require("path").resolve(
          sails.config.appPath,
          "assets/images/uploads"
        ),
      },
      function (err, uploadedFiles) {
        if (err) {
          return res.serverError(err);
        }
        if (uploadedFiles.length === 0) {
          return res.badRequest("No file was uploaded");
        }

        return res.json({
          message: uploadedFiles.length + " file(s) uploaded successfully!",
          file: uploadedFiles
        });
      }
    );
  },

  //add obj {user:'',txtMessage:''} into dataLogs of messageData
  storeMessageData: async (req, res) => {
    //api socket
    if (!req.isSocket) {
      return res.badRequest(ErrorMessage.MESSAGE_ERR_IS_NOT_SOCKET);
    }
    let params = req.allParams();
    if (!params.school) return res.badRequest(ErrorMessage.SCHOOL_ID_REQUIRED);

    let userId = params.userId ? params.userId : "";
    let txtMessage = params.txtMessage ? params.txtMessage : "";
    let messageId = params.messageId ? params.messageId : "";
    let file = params.file ? params.file : null;
    let dateUse = params.dateUse
      ? params.dateUse
      : moment().format("YYYY-MM-DD");
    let groupType = params.groupType;

    //get messageData Obj
    let msgData = await MessageDataService.get({
      message: messageId,
      dateUse: dateUse,
    });

    if (msgData) {
      let dataLogs = msgData.dataLogs;
      //update dataLogs
      dataLogs.push({
        user: userId,
        txtMessage: txtMessage,
        file: params.file,
        createdAt: Date.now(),
      });
      console.log(dataLogs);

      //update obj
      await MessageDataService.edit({ id: msgData.id }, { dataLogs: dataLogs });
    } else {
      let data = {
        message: messageId,
        dateUse: moment().format("YYYY-MM-DD"),
        dataLogs: [
          {
            user: userId,
            txtMessage: txtMessage,
            createdAt: Date.now(),
            file,
          },
        ],
        school: params.school,
      };

      await MessageDataService.add(data);
    }

    //broadcast message
    let tmpUser = await User.findOne({ id: userId });
    if (!tmpUser) {
      tmpUser = await Parent.findOne({ id: userId });
    }

    let roomName = "";
    if (groupType.indexOf("GROUP_") != -1) {
      roomName = "GROUP_" + messageId;
    } else {
      roomName = "TE_PA_" + messageId;
    }

    let getMessages = async (group) => {
      //get messageData of message obj
      //get array messageData to get number of unread message sort by dateUse to get message sort by time desc
      let rs = await MessageData.find({
        where: {
          message: group.id,
          dateUse: {
            ">=": moment(group.updatedAt).format("YYYY-MM-DD"),
          },
        },
        sort: "dateUse DESC",
      });

      let numberOfUnreadMsg = 0;
      if (rs.length > 0) {
        for (let msgData of rs) {
          for (let i = msgData.dataLogs.length; i > 0; i--) {
            //loop from end to start of array to get message by time desc
            if (msgData.dataLogs.length > 0) {
              if (group.lastSeen.length > 0) {
                let find = group.lastSeen.find((f) => f.user === userId);
                if (find) {
                  if (
                    moment(msgData.dataLogs[i - 1].createdAt).isAfter(
                      moment(find.lastSeen)
                    )
                  ) {
                    numberOfUnreadMsg += 1;
                  } else break;
                } else {
                  numberOfUnreadMsg = msgData.dataLogs.length;
                }
              } else {
                numberOfUnreadMsg = msgData.dataLogs.length;
              }
            }
          }
        }
      }

      //get last messageData to get last message and time of last message
      let rsLast = await MessageData.find({
        where: { message: group.id },
        sort: "dateUse DESC",
      });

      let lastTxtMsg = "";
      let timeLastTxtMsg = 0;

      if (rsLast.length > 0 && rsLast[0].dataLogs.length > 0) {
        let lastDataLog = rsLast[0].dataLogs.pop();
        lastTxtMsg = lastDataLog.txtMessage;
        timeLastTxtMsg = lastDataLog.createdAt;
      }
      return {
        id: group.id,
        unreadMessages: numberOfUnreadMsg,
        lastMessage: lastTxtMsg,
        timeLastMessage: timeLastTxtMsg,
      };
    };
    let messageObj = await MessageService.get({ id: messageId });
    let groupMessage = await getMessages(messageObj);

    let data = {
      user: tmpUser,
      txtMessage: txtMessage,
      createdAt: Date.now(),
      file,
    };
    sails.sockets.broadcast(roomName, "CHAT_" + messageId, { data });
    sails.sockets.broadcast(roomName, "CHAT_" + messageId, {
      dataSeen: groupMessage,
    });

    /***        Send notification messenger       ***/
    // get id of teacher and parent (do not get id of person who send message)
    let teacherIds = [];
    let parentIds = [];
    if (messageObj.classObj) {
      data.title = messageObj.classObj.title;

      let teacher_class = await Teacher_Class.find({
        classObj: messageObj.classObj.id,
      });
      teacherIds = teacher_class.map((item) => item.teacher);

      /** get all parentId of classList */
      let student_class = await Student_Class.find({
        classObj: messageObj.classObj.id,
      });

      let studentIds = student_class.map((item) => item.student);

      for (let studentId of studentIds) {
        let allStudent_Parent = await Student_Parent.find({
          student: studentId,
        });

        for (let student_parent of allStudent_Parent) {
          //just push parentId which is not in arr
          if (
            !parentIds.includes(student_parent.parent) &&
            student_parent.parent != userId
          )
            parentIds.push(student_parent.parent);
        }
      }
    } else {
      if (messageObj.parent && messageObj.parent.id != userId)
        parentIds = [messageObj.parent.id];
      if (messageObj.teacher && messageObj.teacher.id != userId)
        teacherIds = [messageObj.teacher.id];
    }

    //push notification
    NotificationService.pushMessageNotification(
      messageObj.id,
      data,
      parentIds,
      teacherIds
    );

    //update last seen for message obj
    // let messageObj = await MessageService.get({ id: messageId });
    let lastSeen = messageObj.lastSeen;
    if (lastSeen.length > 0) {
      let find = lastSeen.findIndex((f) => f.user === userId);
      if (find != -1) {
        lastSeen[find].lastSeen = Date.now();
      } else {
        lastSeen.push({
          user: userId,
          lastSeen: Date.now(),
        });
      }
    } else {
      lastSeen.push({
        user: userId,
        lastSeen: Date.now(),
      });
    }
    await MessageService.edit({ id: messageId }, { lastSeen });

    return res.ok();
  },

  //get messageData by messageId and dateUse
  getListMessages: async (req, res) => {
    let params = req.allParams();
    //if (!params.dateUse) return res.badRequest(ErrorMessage.MESSAGE_ERR_DATEUSE_REQUIRED);
    if (!params.messageId)
      return res.badRequest(ErrorMessage.MESSAGE_ERR_GROUP_ID_REQUIRED);

    const bodyParams = {
      limit: 1,
      skip: params.page ? (Number(params.page) - 1) * 1 : null,
      sort:
        params.sort && params.sort.trim().length
          ? JSON.parse(params.sort)
          : null,
    };

    let listMessage = await MessageData.find({
      where: { message: params.messageId },
      limit: 1,
      skip: (Number(params.page) - 1) * 1,
      sort: [{ createdAt: "DESC" }],
    });
    console.log("listMessage", listMessage);
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
    console.log("data", listMessage);
    //let listMessage = await MessageData.findOne({ message: params.messageId, dateUse: params.dateUse });
    return res.ok({
      data: listMessage[0],
    });
  },

  //update lastSeen of message obj
  getSeenMessage: async (req, res) => {
    let params = req.allParams();
    let msgId = params.messageId;
    let userId = params.userId ? params.userId : "";

    let messageObj = await MessageService.get({ id: msgId });
    let lastSeen = messageObj.lastSeen;
    if (lastSeen.length > 0) {
      let find = lastSeen.findIndex((f) => f.user === userId);
      if (find != -1) {
        lastSeen[find].lastSeen = Date.now();
      } else {
        lastSeen.push({
          user: userId,
          lastSeen: Date.now(),
        });
      }
    } else {
      lastSeen.push({
        user: userId,
        lastSeen: Date.now(),
      });
    }
    let editObj = await MessageService.edit(
      { id: msgId },
      {
        lastSeen,
      }
    );

    if (editObj) {
      return res.json({
        data: editObj,
      });
    } else {
      return res.badRequest(ErrorMessage.MESSAGE_ERR_EDIT_FAIL);
    }
  },
};
