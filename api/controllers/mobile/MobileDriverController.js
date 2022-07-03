/**
 * Mobile Driver Controller
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
*/
const ErrorMessages = require('../../../config/errors');
const AttendentService = require('../../services/AttendentService');
const moment = require('moment');

module.exports = {
  pickUp: async (req, res) => {
    sails.log.info("================================ MobileDriverController.pickUp=> START ================================");

    //GET ALL PARAMS
    let params = req.allParams();

    // REQUIRED FIELDS
    if (!params.school) return res.badRequest(ErrorMessages.SCHOOL_ID_REQUIRED);
    if (!params.attendentId) return res.badRequest(ErrorMessages.ATTENDENT_ID_REQUIRED);
    if (!params.userId) return res.badRequest(ErrorMessages.USER_ID_REQUIRED);
    if (!params.time) return res.badRequest(ErrorMessages.ATTENDENT_TIME_REQUIRED);

    //GET SETTING OF STUDENT'S MOVING PROCESS
    let setting = await Setting.findOne({ key: 'web', school: params.school });
    if (!setting || !setting.value || !setting.value.allowShuttleBus) return res.badRequest(ErrorMessages.SETTINGS_STUDENT_MOVING_PROCESS_NOT_ACTIVE);
    
    //CHECK DATA ATTENDENT EXIST IN DATABASE
    let attendentObj = await AttendentService.get({ id: params.attendentId });
    if (!attendentObj) return res.badRequest(ErrorMessages.ATTENDENT_NOT_FOUND);
    if (!attendentObj.student) return res.badRequest(ErrorMessages.STUDENT_NOT_FOUND);

    let userObj = await User.findOne({ id: params.userId });
    if (!userObj) return res.badRequest(ErrorMessages.USER_NOT_FOUND);

    //SEND NOTIFICATION TO PARENT OF STUDENT
    let allStudent_Parent = await Student_Parent.find({ student: attendentObj.student.id });
    let allParentId = allStudent_Parent.map((item) => item.parent);

    if (allParentId.length) {
      let _tmpFullname = await sails.helpers.formatFullname(attendentObj.student.firstName, attendentObj.student.lastName, setting.value.displayName);
      
      let dateAttentdent = moment(attendentObj.date).format(setting.value.dateFormat);

      let _tmpFullnameDriver = await sails.helpers.formatFullname(userObj.firstName, userObj.lastName, setting.value.displayName);
      
      let dataNotification = {
        title: sails.__('Attendent child %s on bus by %s', _tmpFullname, _tmpFullnameDriver),
        message: sails.__('Time attendent %s %s by driver %s',params.time, dateAttentdent, _tmpFullnameDriver),
        status: sails.config.custom.STATUS.ACTIVE,
        type: sails.config.custom.TYPE.ATTENDENT,
        classList: [],
        school: params.school
      }
      //create notification and send push noti
      let notification = await NotificationService.add(dataNotification);
      await NotificationService.pushFirebase(notification, allParentId, []);
    }

    let editData = { movingProcessStep: 1 };
    let tracking = attendentObj.tracking ? attendentObj.tracking : [];
    if (tracking.length) {
      tracking[0] = { step: 1, time: params.time, userIn: '' , userOut: params.userId };
    } else {
      tracking = [{ step: 1, time: params.time, userIn: '' , userOut: params.userId },{ step: 2, time: '', userIn: '', userOut: '' },{ step: 3, time: '', userIn: '', userOut: '' },{ step: 4, time: '', userIn: '', userOut: '' }];
    }
    editData.tracking = tracking;
    editData.status = 1;

    //UPDATE STATUS
    let editedObj = await AttendentService.edit({ id: params.attendentId }, editData);
    return res.json(editedObj);
    
  },

  dropOff: async (req, res) => {
    sails.log.info("================================ MobileDriverController.pickUp=> START ================================");

    //GET ALL PARAMS
    let params = req.allParams();

    // REQUIRED FIELDS
    if (!params.school) return res.badRequest(ErrorMessages.SCHOOL_ID_REQUIRED);
    if (!params.attendentId) return res.badRequest(ErrorMessages.ATTENDENT_ID_REQUIRED);
    if (!params.userId) return res.badRequest(ErrorMessages.USER_ID_REQUIRED);
    if (!params.time) return res.badRequest(ErrorMessages.ATTENDENT_TIME_REQUIRED);

    //GET SETTING OF STUDENT'S MOVING PROCESS
    let setting = await Setting.findOne({ key: 'web', school: params.school });
    if (!setting || !setting.value || !setting.value.allowShuttleBus) return res.badRequest(ErrorMessages.SETTINGS_STUDENT_MOVING_PROCESS_NOT_ACTIVE);
    
    //CHECK DATA ATTENDENT EXIST IN DATABASE
    let attendentObj = await AttendentService.get({ id: params.attendentId });
    if (!attendentObj) return res.badRequest(ErrorMessages.ATTENDENT_NOT_FOUND);
    if (!attendentObj.student) return res.badRequest(ErrorMessages.STUDENT_NOT_FOUND);
    if (!attendentObj.tracking || !attendentObj.tracking.length) return res.badRequest(ErrorMessages.PICKUP_NOT_ALLOWED);

    let userObj = await User.findOne({ id: params.userId });
    if (!userObj) return res.badRequest(ErrorMessages.USER_NOT_FOUND);

    //SEND NOTIFICATION TO PARENT OF STUDENT
    let allStudent_Parent = await Student_Parent.find({ student: attendentObj.student.id });
    let allParentId = allStudent_Parent.map((item) => item.parent);

    if (allParentId.length) {      
      let _tmpFullname = await sails.helpers.formatFullname(attendentObj.student.firstName, attendentObj.student.lastName, setting.value.displayName);
      
      let dateAttentdent = moment(attendentObj.date).format(setting.value.dateFormat);

      let _tmpFullnameDriver = await sails.helpers.formatFullname(userObj.firstName, userObj.lastName, setting.value.displayName);

      let dataNotification = {
        title: sails.__('Attendent child %s has been picked up by %s', _tmpFullname, _tmpFullnameDriver),
        message: sails.__('Time attendent %s %s by driver %s', params.time, dateAttentdent , _tmpFullnameDriver),
        status: sails.config.custom.STATUS.ACTIVE,
        type: sails.config.custom.TYPE.PICK_UP,
        classList: [],
        school: params.school
      }
      //create notification and send push noti
      let notification = await NotificationService.add(dataNotification);
      await NotificationService.pushFirebase(notification, allParentId, []);
    }

    let editData = { movingProcessStep: 4};
    let tracking = attendentObj.tracking;
    tracking[3] = { step: 4, time: params.time, userIn: '' , userOut: params.userId };
    editData.tracking = tracking;

    //UPDATE STATUS
    let editedObj = await AttendentService.edit({ id: params.attendentId }, editData);
    return res.json(editedObj);
    
  }
}