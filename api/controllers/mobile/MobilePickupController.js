/**
 * Pickup Controller
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
*/
const ErrorMessages = require('../../../config/errors');
const PickUpService = require('../../services/PickUpService');
const NotificationService = require('../../services/NotificationService');
const moment = require('moment');
const _ = require('lodash');

module.exports = {
  
  checkExisted: async (req, res) => {
    sails.log.info("================================ MobilePickUpController.checkExisted => START ================================");
    let params = req.allParams();

    // CHECK PARAM CLASS ID & DATE
    if (!params.classId) return res.badRequest(ErrorMessages.CLASS_ID_REQUIRED);
    if (!params.date) return res.badRequest(ErrorMessages.PICKUP_DATE_REQUIRED);
    if (!params.school) return res.badRequest(ErrorMessages.SCHOOL_ID_REQUIRED);
    
    // VALIDATE DATE
    let datePickUp = '';
    let date = moment(params.date).format("YYYY-MM-DD");
    if (date == 'Invalid date') {
      return res.badRequest(ErrorMessages.PICKUP_DATE_INVALID)
    } else {
      datePickUp = date;
    }

    //check is today attendent is existed? if not existed => return error
    let todayAttendents = await Attendent.find({ date: datePickUp, classObj: params.classId });
    if (todayAttendents.length == 0) return res.badRequest(ErrorMessages.PICKUP_NOT_ALLOWED);

    //get studentIds
    let studentIds = todayAttendents.filter((item) => item.status == 1).map((item) => item.student);

    //check pickup is existed?
    let todayPickups = await PickUp.find({ date: datePickUp, classObj: params.classId }).populate('student');

    //create pickup data for attendant students
    if (studentIds && studentIds.length > 0) {
      for (let studentId of studentIds) {
        let pickUpRecord = {
          student: studentId,
          date: datePickUp,
          classObj: params.classId,
          school: params.school
        };
        let obj = await PickUpService.get(pickUpRecord);
        if (!obj) {
          obj = await PickUpService.add(pickUpRecord);
          let studentObj = await Student.findOne({ id: studentId });
          obj.student = studentObj;
          
          todayPickups.push(obj);
        }
      }
    }

    // RETURN DATA PICKUP EXIST
    return res.json(todayPickups);
  },

  get: async (req, res) => {
    sails.log.info("================================ MobilePickUpController.get => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();
    // CHECK PARAM ID
    if (!params.id) return res.badRequest(ErrorMessages.PICKUP_ID_REQUIRED);

    // QUERY & CHECK DATA PICK UP
    let pickUp = await PickUpService.get({ id: params.id});
    if (!pickUp) return res.badRequest(ErrorMessages.PICKUP_NOT_FOUND);
    
    let relationStudentParent = await Student_Parent.find({ student: pickUp.student.id }).populate('parent');
    let arrParent = [];
    _.each(relationStudentParent, (relationItem) => {
      let objParent = {};
      objParent.id = relationItem.parent.id;
      objParent.firstName = relationItem.parent.firstName;
      objParent.lastName = relationItem.parent.lastName;
      objParent.avatar = relationItem.parent.avatar;
      objParent.type = relationItem.type;
      arrParent.push(objParent);
    })
    pickUp.arrParent = arrParent;
    // RETURN DATA PICK UP
    return res.json(pickUp);
  },

  edit: async (req, res) => {
    sails.log.info("================================ MobilePickUpController.edit => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();
    // CHECK PARAMS
    if (!params.id) return res.badRequest(ErrorMessages.PICKUP_ID_REQUIRED);
    if (!params.time) return res.badRequest(ErrorMessages.PICKUP_TIME_REQUIRED);
    if (!params.userId) return res.badRequest(ErrorMessages.USER_ID_REQUIRED);
    if (!params.school) return res.badRequest(ErrorMessages.SCHOOL_ID_REQUIRED);

    // CHECK ID PICK UP EXIST
    const pickUp = await PickUpService.get({ id: params.id });
    if (!pickUp) return res.badRequest(ErrorMessages.PICKUP_NOT_FOUND);
    //CHECK ATTENDANCE IS EXISTED? GET ATTENDANCE OBJ TO UPDATE MOVING PROCESS STEP
    let attendanceObj = await Attendent.findOne({ student: pickUp.student.id, classObj: pickUp.classObj, date: pickUp.date });
    if (!attendanceObj) return res.badRequest(ErrorMessages.ATTENDENT_NOT_FOUND);
    if (!attendanceObj.tracking || !attendanceObj.tracking.length) return res.badRequest(ErrorMessages.PICKUP_NOT_ALLOWED);

    //CHECK DATA USER
    let userObj = await User.findOne({ id: params.userId });
    if (!userObj) return res.badRequest(ErrorMessages.USER_NOT_FOUND);
    
    //GET SETTING
    let setting = await Setting.findOne({ key: 'web', school: params.school });
    let allowShuttleBus = false;
    if (setting && setting.value && setting.value.allowShuttleBus) allowShuttleBus = setting.value.allowShuttleBus;

    if (!allowShuttleBus && !params.parentId) return res.badRequest(ErrorMessages.PARENT_ID_REQUIRED);

    let parentObj = {};
    if (params.parentId) { 
      //get obj parent who pickup student
      parentObj = await Parent.findOne({ id: params.parentId });
      if (!parentObj) return res.badRequest(ErrorMessages.PARENT_NOT_FOUND);
    }
    // CREATE DATA FOR UPDATE
    let pickUpRecord = {
      time: params.time,
      parent: params.parentId
    };
    if (!params.parentId) {
      pickUpRecord.parent = null;
      pickUpRecord.note = params.note ? params.note : 'School bus';
    }

    // UPDATE DATA PICK UP
    const editedObj = await PickUpService.edit({ id: params.id }, pickUpRecord);

    //UPDATE DATA OF ATTENDANCE
    let editData = { movingProcessStep: 3};
    let tracking = attendanceObj.tracking;
    tracking[2] = { step: 3, time: params.time, user: params.userId };
    editData.tracking = tracking;
    await Attendent.updateOne({ id: attendanceObj.id }).set(editData);

    //get list parent of student
    let allStudent_Parent = await Student_Parent.find({ student: editedObj[0].student });
    let allParentId = allStudent_Parent.map(item => item.parent);

    if (allParentId.length) {
      //SEND NOTI
      let dataNotification = {
        title: sails.__('Your child has been picked up by school bus'),
        message: sails.__('Your child has been picked up by school bus'),
        status: sails.config.custom.STATUS.ACTIVE,
        type: sails.config.custom.TYPE.PICK_UP,
        classList: [],
        school: params.school
      };

      if (params.parentId) {
        dataNotification.title = sails.__('Your child has been picked up by %s %s', parentObj.firstName, parentObj.lastName);
        dataNotification.message = sails.__('Your child has been picked up by %s %s', parentObj.firstName, parentObj.lastName);
      }
      //create notification and send push noti
      let notification = await NotificationService.add(dataNotification);
      await NotificationService.pushFirebase(notification, allParentId, []);
    }


    // RETURN DATA EDITED 
    return res.json(editedObj[0]);
  },
}