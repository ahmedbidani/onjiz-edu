/**
 * Attendent Controller
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
*/
const ErrorMessages = require('../../../config/errors');
const AttendentService = require('../../services/AttendentService');
const moment = require('moment');

module.exports = {
  findOrCreate: async (req, res) => {
    sails.log.info("================================ MobileAttendentController.findOrCreate => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();
    
    // REQUIRED FIELDS
    if (!params.school) return res.badRequest(ErrorMessages.SCHOOL_ID_REQUIRED);
    if (!params.classId) return res.badRequest(ErrorMessages.ATTENDENT_ERR_CLASSID_REQUIRED);
    if (!params.date) return res.badRequest(ErrorMessages.ATTENDENT_ERR_DATEUSE_REQUIRED);

    // VALIDATE DATE
    let dateAttendent = '';
    let date = moment(params.date).format("YYYY-MM-DD");
    if (date == 'Invalid date') {
      return res.badRequest(ErrorMessages.ATTENDENT_DATE_INVALID);
    } else {
      dateAttendent = date;
    }
    
    //check attendent is existed?
    let todayAttendent = await Attendent.find({ date: dateAttendent, classObj: params.classId, school: params.school }).populate('student');

    if (todayAttendent.length == 0) {
      //get student of class
      let student_class = await Student_Class.find({ classObj: params.classId });
      let studentIds = student_class.map(item => item.student);

      //create attendent data for today
      for (let studentId of studentIds) {
        let attendentRecord = {
          student: studentId,
          date: dateAttendent,
          classObj: params.classId,
          school: params.school
        };
        let obj = await AttendentService.add(attendentRecord);
        let studentObj = await Student.findOne({ id: studentId });
        obj.student = studentObj;
        if(studentObj) todayAttendent.push(obj);
      }
    } else {
      todayAttendent = todayAttendent.filter(item => item.student != null);
    }
    

    //SORT ATTENDENCE BY FIRSTNAME
    todayAttendent = todayAttendent.sort(function (a, b) {
      return a.student.firstName.localeCompare(b.student.firstName);
    });
    //END SORT ATTENDENCE BY FIRSTNAME
    
    return res.json(todayAttendent);

  },

  get: async (req, res) => { //USE IN CASE SHUTTLE PERSON INFO IS ON
    sails.log.info("================================ MobileAttendentController.get => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();
    if (!params.id) return res.badRequest(ErrorMessages.ATTENDENT_ID_REQUIRED);
    // QUERY & CHECK DATA COURSE SESSION
    let attendentObj = await AttendentService.get({ id: params.id });
    if (!attendentObj) {
      return res.notFound(ErrorMessages.ATTENDENT_NOT_FOUND);
    }
    let relationStudentParent = await Student_Parent.find({ student: attendentObj.student.id }).populate('parent')
    let arrParent = [];
    _.each(relationStudentParent, (relationItem) => {
      let objParent = {};
      objParent.id = relationItem.parent.id;
      objParent.firstName = relationItem.parent.firstName;
      objParent.lastName = relationItem.parent.lastName;
      objParent.avatar = relationItem.parent.avatar;
      objParent.type = relationItem.type;
      arrParent.push(objParent)
    })
    attendentObj.arrParent = arrParent;
    // RETURN DATA COURSE SESSION
    return res.json(attendentObj);
  },

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
    let todayPickups = await Attendent.find({ date: datePickUp, classObj: params.classId }).populate('student');

    //create pickup data for attendant students
    if (studentIds && studentIds.length > 0) {
      for (let studentId of studentIds) {
        let pickUpRecord = {
          student: studentId,
          date: datePickUp,
          classObj: params.classId,
          school: params.school
        };
        let obj = await AttendentService.get(pickUpRecord);
        if (!obj) {
          obj = await AttendentService.add(pickUpRecord);
          let studentObj = await Student.findOne({ id: studentId });
          obj.student = studentObj;
          
          todayPickups.push(obj);
        }
      }
    }

    // RETURN DATA PICKUP EXIST
    return res.json(todayPickups);
  },
  edit: async (req, res) => { //USE IN CASE SHUTTLE PERSON INFO IS ON
    sails.log.info("================================ MobileAttendentController.edit => START ================================");
    const params = req.allParams();
    // CHECK PARAMS
    if (!params.id) return res.badRequest(ErrorMessages.ATTENDENT_ID_REQUIRED);
    if (!params.time) return res.badRequest(ErrorMessages.ATTENDENT_TIME_REQUIRED);
    //if (!params.parentId && (!params.note || !params.note.trim().length)) return res.badRequest(ErrorMessages.ATTENDENT_NOTE_REQUIRED);
    if (!params.userId) return res.badRequest(ErrorMessages.USER_ID_REQUIRED);
    
    let typeAttendent = params.type ? params.type : "";
    let setting = await Setting.findOne({ key: 'web', school: params.school });
    let allowShuttleBus = setting && setting.value ? setting.value.allowShuttleBus : false;

    // CHECK DATA ATTENDANCE
    const attendentObj = await AttendentService.get({ id: params.id });
    if (!attendentObj) return res.notFound(ErrorMessages.ATTENDENT_NOT_FOUND);

    //CHECK USER
    let userObj = await User.findOne({ id: params.userId });
    if (!userObj) return res.badRequest(ErrorMessages.USER_NOT_FOUND);


    let elementTracking = parseInt(attendentObj.movingProcessStep);
    let movingProcessStep = parseInt(attendentObj.movingProcessStep) + 1;
    if (allowShuttleBus && movingProcessStep > 4 || !allowShuttleBus && movingProcessStep > 3
      || movingProcessStep == 3 && typeAttendent == "attendance" || movingProcessStep == 4 && typeAttendent == "pickup") {
      elementTracking--;
      movingProcessStep--;
    }
    if (elementTracking == 0 && !allowShuttleBus) {
      elementTracking = 1;
      movingProcessStep = 2;
    }
    let parentId = params.parentId ? params.parentId : '';
    let teacherId = params.userId ? params.userId : '';   
    let tracking = attendentObj.tracking;

    let checkBusNotAttendent = false;
    if (elementTracking == 0 && allowShuttleBus) {
      checkUserIsTeacher = await User.findOne({ id: params.userId });
      let typeUser = parseInt(checkUserIsTeacher.userType);
      if (typeUser == 1)
        checkBusNotAttendent = true;
        
    }
    if (checkBusNotAttendent) {
      tracking[1] = { step: 2, time: params.time, userIn: '', userOut: params.userId, note: params.note };
      movingProcessStep = 2;
    } else {
      tracking[elementTracking] = { step: movingProcessStep, time: params.time, userIn: parentId, userOut: teacherId, note: params.note };
      //let driverId = '';
      if ((allowShuttleBus && movingProcessStep == 2) || (parentId == '' && movingProcessStep == 3 && allowShuttleBus)) {
        driverId = attendentObj.tracking[0].userOut;
        tracking[elementTracking] = { step: movingProcessStep, time: params.time, userIn: driverId, userOut: teacherId, note: '' };
      }
    }
    let editData = {
      status: sails.config.custom.STATUS.ATTENDANT,
      tracking: tracking,
      movingProcessStep: movingProcessStep
    }

    // // CREATE DATA FOR UPDATE
    // let editData = {
    //   status: sails.config.custom.STATUS.ATTENDANT,
    //   time: params.time,
    //   note: params.note,
    //   movingProcessStep: 2
    // };
    // if (params.parentId) editData.parent = params.parentId;
    // let tracking = attendentObj.tracking ? attendentObj.tracking : [];
    // if (tracking.length) {
    //   tracking[1] = { step: 2, time: params.time, user: params.userId };
    // } else {
    //   tracking = [{ step: 1, time: '', user: '' },{ step: 2, time: params.time, user: params.userId },{ step: 3, time: '', user: '' },{ step: 4, time: '', user: '' }];
    // }
    // editData.tracking = tracking;



    // UPDATE DATA ATTENDANCE
    const editedObj = await AttendentService.edit({ id: params.id }, editData);

    let dataNotification = {};
      dataNotification = {
        title: '',
        message: '',
        status: sails.config.custom.STATUS.ACTIVE,
        type: sails.config.custom.TYPE.ATTENDENT,
        classList: [],
        school: params.school
    };
    
    // //get obj student
    let studentObj = await Student.findOne({ id: attendentObj.student.id });
      
    let _tmpFullname = await sails.helpers.formatFullname(studentObj.firstName, studentObj.lastName, setting.value.displayName);
    
    let dateAttentdent = moment(attendentObj.date).format(setting.value.dateFormat);

    let _tmpFullnameParent = '';
    let _tmpFullnameTeacher = '';
    let _tmpFullnameDriver = '';
    
    if (movingProcessStep == 4 && allowShuttleBus) {
      dataNotification.title = sails.__('Student %s has been arrived home',_tmpFullname);
      dataNotification.message = sails.__('At: %s %s',attendentObj.tracking[3].time, dateAttentdent);
    } else if (movingProcessStep == 3 && !allowShuttleBus) {
      
      //get teacher who pickup student
      let teacherPickup = await User.findOne({ id: attendentObj.tracking[2].userOut });
      if(teacherPickup) _tmpFullnameTeacher = await sails.helpers.formatFullname(teacherPickup.firstName, teacherPickup.lastName, setting.value.displayName);
      //get obj parent who pickup student
      if (attendentObj.tracking[2].note != "") {
        dataNotification.title = sails.__('Attendent child %s has been picked up from teacher %s', _tmpFullname, _tmpFullnameTeacher);
        dataNotification.message = sails.__('Time attendent %s %s receiver %s teacher %s', attendentObj.tracking[2].time, dateAttentdent, attendentObj.tracking[2].note, _tmpFullnameTeacher);
      } else {
        let parentObj = await Parent.findOne({ id: attendentObj.tracking[2].userIn });

        if (parentObj) {
          let Gender = sails.__("MR");
          if (parentObj.gender == '0') Gender = sails.__("MISS");
          _tmpFullnameParent = await sails.helpers.formatFullname(parentObj.firstName, parentObj.lastName, setting.value.displayName);
          _tmpFullnameParent = Gender + ' ' + _tmpFullnameParent;
          dataNotification.title = sails.__('Attendent child %s has been picked up from teacher %s', _tmpFullname, _tmpFullnameTeacher);
          dataNotification.message = sails.__('Time attendent %s %s receiver %s teacher %s', attendentObj.tracking[2].time, dateAttentdent, _tmpFullnameParent, _tmpFullnameTeacher);
        } else {
          dataNotification.title = sails.__('Attendent child %s has been picked up from teacher %s', _tmpFullname, _tmpFullnameTeacher);
          dataNotification.message = sails.__('Time attendent %s %s handover teacher %s', attendentObj.tracking[2].time, dateAttentdent, _tmpFullnameTeacher);
        }
      }
      
    } else if (movingProcessStep == 3 && allowShuttleBus) {
      //get teacher who pickup student
      let teacherPickup = await User.findOne({ id: attendentObj.tracking[2].userOut });
      if (teacherPickup) _tmpFullnameTeacher = await sails.helpers.formatFullname(teacherPickup.firstName, teacherPickup.lastName, setting.value.displayName);
      
      let parentObj = await Parent.findOne({ id: attendentObj.tracking[2].userIn });
      if (parentObj) {
        let Gender = sails.__("MR");
        if(parentObj.gender == '0') Gender = sails.__("MISS");
        _tmpFullnameParent = await sails.helpers.formatFullname(parentObj.firstName, parentObj.lastName, setting.value.displayName);
        _tmpFullnameParent = Gender + ' ' + _tmpFullnameParent;
        dataNotification.title = sails.__('Attendent child %s has been picked up from parent %s', _tmpFullname, _tmpFullnameParent);
        dataNotification.message = sails.__('Time attendent %s %s receiver parent %s teacher %s', attendentObj.tracking[2].time, dateAttentdent, _tmpFullnameParent, _tmpFullnameTeacher);
      } else {
        //get obj parent who pickup student
        let driverObj = await User.findOne({ id: attendentObj.tracking[2].userIn });
        if (driverObj) {
          _tmpFullnameDriver = await sails.helpers.formatFullname(driverObj.firstName, driverObj.lastName, setting.value.displayName);
          dataNotification.title = sails.__('Attendent child %s has been picked by teacher %s', _tmpFullname, _tmpFullnameTeacher);
          dataNotification.message = sails.__('Time attendent %s %s receiver driver %s teacher %s', attendentObj.tracking[2].time, dateAttentdent, _tmpFullnameDriver, _tmpFullnameTeacher);
        } else {
          dataNotification.title = sails.__('Attendent child %s has been picked by teacher %s', _tmpFullname, _tmpFullnameTeacher);
          dataNotification.message = sails.__('Time attendent %s %s teacher %s', attendentObj.tracking[2].time, dateAttentdent, _tmpFullnameTeacher);
        }
      }
    }

    if ((allowShuttleBus && movingProcessStep == 4 || movingProcessStep == 3)
      || (!allowShuttleBus && movingProcessStep == 3)) {
        //get list parent of student
        let allStudent_Parent = await Student_Parent.find({ student: attendentObj.student.id });
        let allParentId = allStudent_Parent.map(item => item.parent);
      
        if (allParentId.length) {
          //create notification and send push noti
          let notification = await NotificationService.add(dataNotification);
          await NotificationService.pushFirebase(notification, allParentId, []);
        }
      }

    // RETURN DATA EDITED 
    return res.json(editedObj);
  },

  checkIn: async (req, res) => { //USE IN CASE SHUTTLE PERSON INFO IS OFF
    sails.log.info("================================ MobileAttendentController.add => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();

    // REQUIRED FIELDS
    if (!params.id) return res.badRequest(ErrorMessages.ATTENDENT_ID_REQUIRED);
    if (!params.time) return res.badRequest(ErrorMessages.ATTENDENT_TIME_REQUIRED);
    if (!params.userId) return res.badRequest(ErrorMessages.USER_ID_REQUIRED);
    
    //CHECK DATA ATTENDENT EXIST IN DATABASE
    let attendentObj = await AttendentService.get({ id: params.id });
    if (!attendentObj) return res.badRequest(ErrorMessages.ATTENDENT_NOT_FOUND);

    //CHECK DATA USER
    let userObj = await User.findOne({ id: params.userId });
    if (!userObj) return res.badRequest(ErrorMessages.USER_NOT_FOUND);

    /** show confirm alert on app => not necessary to switch status of attendance */
    // //GET SETTING
    // let setting = await Setting.findOne({ key: 'web' });
    // let allowShuttleBus = false;
    // if (setting && setting.value && setting.value.allowShuttleBus) allowShuttleBus = setting.value.allowShuttleBus;
    
    // let editData = {};
    // if (attendentObj.status == sails.config.custom.STATUS.ATTENDANT) {
    //   editData.status = sails.config.custom.STATUS.ABSENT;
    //   //remove pickup obj if existed
    //   await PickUpService.del({ student: attendentObj.student.id, date: attendentObj.date, classObj: attendentObj.classObj });

    //   //update movingProcessStep of student is 1 if student is picked up by school bus
    //   editData.movingProcessStep = allowShuttleBus ? 1 : 0;
    // } else {
    //   editData.status = sails.config.custom.STATUS.ATTENDANT;
    //   editData.movingProcessStep = 2;
    // }

    let editData = { status: sails.config.custom.STATUS.ATTENDANT, movingProcessStep: 2 };
    let tracking = attendentObj.tracking && attendentObj.tracking.length ? attendentObj.tracking : [];
    if (tracking.length) {
      tracking[1] = { step: 2, time: params.time, userIn: '', userOut: params.userId };
    } else {
      tracking = [{ step: 1, time: '', userIn: '', userOut: '' }, { step: 2, time: params.time, userIn: '', userOut: params.userId },
      { step: 3, time: '', userIn: '', userOut: '' }, { step: 4, time: '', userIn: '', userOut: '' }];
    }
    editData.tracking = tracking;

    //UPDATE STATUS
    let editedObj = await AttendentService.edit({ id: params.id }, editData);
    return res.json(editedObj);
  },

  pushNotification: async (req, res) => {
    sails.log.info("================================ AttendentController.pushNotification => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();

    if (!params.school) return res.badRequest(ErrorMessage.SCHOOL_ID_REQUIRED);
    if (!params.classId) return res.badRequest(ErrorMessages.CLASS_ID_REQUIRED);
    if (!params.date) return res.badRequest(ErrorMessages.ATTENDENT_DATE_REQUIRED);

    let setting = await Setting.findOne({ key: 'web', school: params.school });
    let allowShuttleBus = setting && setting.value ? setting.value.allowShuttleBus : false;

    let attendents = await Attendent.find({ date: params.date, classObj: params.classId }).populate('student');
    if (attendents.length == 0) return res.badRequest(ErrorMessages.ATTENDENT_NOT_FOUND);

    for (let attendentObj of attendents) {
      if (attendentObj.student && attendentObj.student.id) {
        let parentOfStudent = await Student_Parent.find({ student: attendentObj.student.id });
        let allParentIds = [];

        //get all parent of student
        if (parentOfStudent && parentOfStudent.length > 0) {
          for (let pod of parentOfStudent) {
            allParentIds.push(pod.parent);
          }
        }

        // get moving Process Step 
        let movingProcessStep = parseInt(attendentObj.movingProcessStep);
      
        // if (allParentIds.length) {
        //   //create data notification depend on student absence or not
        //   let dataNotification = {};
        //   if (attendentObj.status == 1) {
        //     dataNotification = {
        //       title: sails.__('Student %s %s is present at class.', attendentObj.student.firstName, attendentObj.student.lastName),
        //       message: sails.__('Student %s %s is present at class.', attendentObj.student.firstName, attendentObj.student.lastName),
        //       status: sails.config.custom.STATUS.ACTIVE,
        //       type: sails.config.custom.TYPE.ATTENDENT,
        //       classList: [],
        //       school: params.school
        //     }
        //   } else {
        //     dataNotification = {
        //       title: sails.__('Student %s %s is absent today.', attendentObj.student.firstName, attendentObj.student.lastName),
        //       message: sails.__('Student %s %s is absent today.', attendentObj.student.firstName, attendentObj.student.lastName),
        //       status: sails.config.custom.STATUS.ACTIVE,
        //       type: sails.config.custom.TYPE.ATTENDENT,
        //       classList: [],
        //       school: params.school
        //     }
        //   }
  
        //   //create notification and send push noti
        //   let notification = await NotificationService.add(dataNotification);
        //   await NotificationService.pushFirebase(notification, allParentIds, []);
        // }

        let dataNotification = {};
        dataNotification = {
          title: '',
          message: '',
          status: sails.config.custom.STATUS.ACTIVE,
          type: sails.config.custom.TYPE.ATTENDENT,
          classList: [],
          school: params.school
        };
      
        // //get obj student
        let studentObj = await Student.findOne({ id: attendentObj.student.id });
      
        let _tmpFullname = await sails.helpers.formatFullname(studentObj.firstName, studentObj.lastName, setting.value.displayName);
      
        let dateAttentdent = moment(attendentObj.date).format(setting.value.dateFormat);

        let _tmpFullnameParent = '';
        let _tmpFullnameTeacher = '';
        let _tmpFullnameDriver = '';
  
        if (movingProcessStep == 4 && allowShuttleBus) {
          dataNotification.title = sails.__('Attendent child %s has been picked up by school bus', _tmpFullname);
          dataNotification.message = sails.__('Time attendent %s %s', attendentObj.tracking[3].time, dateAttentdent);
        } else if (movingProcessStep == 3 && !allowShuttleBus) {
        
          //get teacher who pickup student
          let teacherPickup = await User.findOne({ id: attendentObj.tracking[2].userOut });
          if (teacherPickup) _tmpFullnameTeacher = await sails.helpers.formatFullname(teacherPickup.firstName, teacherPickup.lastName, setting.value.displayName);
          if (attendentObj.tracking[2].note != '') {
            _tmpFullnameParent = attendentObj.tracking[2].note;
          } else {
            //get obj parent who pickup student
            let parentObj = await Parent.findOne({ id: attendentObj.tracking[2].userIn });

            if (parentObj) {
              _tmpFullnameParent = await sails.helpers.formatFullname(parentObj.firstName, parentObj.lastName, setting.value.displayName);
            }
          }
          dataNotification.title = sails.__('Attendent child %s has been picked up from teacher %s', _tmpFullname, _tmpFullnameTeacher);
          dataNotification.message = sails.__('Time attendent %s %s receiver %s teacher %s', attendentObj.tracking[2].time, dateAttentdent, _tmpFullnameParent, _tmpFullnameTeacher);
        } else if (movingProcessStep == 2 && allowShuttleBus) {
          //get teacher who attendance student
          let teacherPickup = await User.findOne({ id: attendentObj.tracking[1].userOut });
          if (teacherPickup) _tmpFullnameTeacher = await sails.helpers.formatFullname(teacherPickup.firstName, teacherPickup.lastName, setting.value.displayName);
          if (attendentObj.tracking[1].note != '') {
            dataNotification.title = sails.__('Attendent child %s has been at class to teacher %s', _tmpFullname, _tmpFullnameTeacher);
            dataNotification.message = sails.__('Time attendent %s %s from driver %s teacher %s', attendentObj.tracking[1].time, dateAttentdent,
              attendentObj.tracking[1].note, _tmpFullnameTeacher);
          } else {
            //get obj who attendance student
            let driverObj = await User.findOne({ id: attendentObj.tracking[1].userIn });
  
            if (driverObj) {
              _tmpFullnameDriver = await sails.helpers.formatFullname(driverObj.firstName, driverObj.lastName, setting.value.displayName);
              dataNotification.title = sails.__('Attendent child %s has been at class to teacher %s', _tmpFullname, _tmpFullnameTeacher);
              dataNotification.message = sails.__('Time attendent %s %s from driver %s teacher %s', attendentObj.tracking[1].time, dateAttentdent, _tmpFullnameDriver, _tmpFullnameTeacher);
            } else {
              dataNotification.title = sails.__('Attendent child %s has been at class to teacher %s', _tmpFullname, _tmpFullnameTeacher);
              dataNotification.message = sails.__('Time attendent %s %s teacher %s', attendentObj.tracking[1].time, dateAttentdent, _tmpFullnameTeacher);
            }
          }
        }
  
        if (movingProcessStep == 1 && allowShuttleBus) {
          dataNotification.title = sails.__('Child %s  on bus', _tmpFullname);
          dataNotification.message = sails.__('Time attendent %s %s', attendentObj.tracking[0].time, dateAttentdent);
        }
        else if (movingProcessStep == 2 && !allowShuttleBus) {

          //get teacher who pickup student
          let teacherPickup = await User.findOne({ id: attendentObj.tracking[1].userOut });
          if (teacherPickup) _tmpFullnameTeacher = await sails.helpers.formatFullname(teacherPickup.firstName, teacherPickup.lastName, setting.value.displayName);
          if (attendentObj.tracking[1].note != '') {
            dataNotification.title = sails.__('Attendent of child %s at class from teacher %s', _tmpFullname, _tmpFullnameTeacher);
            dataNotification.message = sails.__('Time attendent %s %s from handover %s teacher %s', attendentObj.tracking[1].time, dateAttentdent,
              attendentObj.tracking[1].note, _tmpFullnameTeacher);
          } else {
            //get obj parent who pickup student
            let parentObj = await Parent.findOne({ id: attendentObj.tracking[1].userIn });
            if (parentObj) { // Trường hợp phụ huynh đem đến trường
              _tmpFullnameParent = await sails.helpers.formatFullname(parentObj.firstName, parentObj.lastName, setting.value.displayName);
              dataNotification.title = sails.__('Attendent of child %s at class from teacher %s', _tmpFullname, _tmpFullnameTeacher);
              dataNotification.message = sails.__('Time attendent %s %s from handover %s teacher %s', attendentObj.tracking[1].time, dateAttentdent,
                _tmpFullnameParent, _tmpFullnameTeacher);
            } else {
              // TRường hợp không có phụ huynh
              dataNotification.title = sails.__('Attendent of child %s at class from teacher %s', _tmpFullname, _tmpFullnameTeacher);
              dataNotification.message = sails.__('Time attendent %s %s teacher %s', attendentObj.tracking[1].time, dateAttentdent, _tmpFullnameTeacher);
            }
          }
        }
  
        // if ((allowShuttleBus && movingProcessStep == 4 || movingProcessStep == 1)
        //   || (!allowShuttleBus && movingProcessStep == 3 || movingProcessStep == 2)) {
        //get list parent of student
        let allStudent_Parent = await Student_Parent.find({ student: attendentObj.student.id });
        let allParentId = allStudent_Parent.map(item => item.parent);
      
        if (allParentId.length) {
          //create notification and send push noti
          if (dataNotification.title != "" && dataNotification.message != "") {
            let notification = await NotificationService.add(dataNotification);
            await NotificationService.pushFirebase(notification, allParentId, []);
          }
        }
      }

    }

    return res.json({ message: 'ok' });
  },

  history: async (req, res) => {
    sails.log.info("================================ MobileAttendentController.history => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();
    
    // REQUIRED FIELDS
    if (!params.classId) return res.badRequest(ErrorMessages.ATTENDENT_ERR_CLASSID_REQUIRED);
    if (!params.date) return res.badRequest(ErrorMessages.ATTENDENT_DATE_REQUIRED);

    let setting = await Setting.findOne({ key: 'web', school: params.school });
    let allowShuttleBus = setting && setting.value ? setting.value.allowShuttleBus : false;

    // VALIDATE DATE
    let date = moment(params.date).format("YYYY-MM-DD");
    if (date == 'Invalid date') {
      return res.badRequest(ErrorMessages.ATTENDENT_DATE_INVALID);
    }

    let history = await Attendent.find({ date: date, classObj: params.classId }).populate('student');
    if (history.length == 0) return res.badRequest(ErrorMessages.NO_DATA_ATTENDENT);

    for (let i = 0; i < history.length; i++){
      let isAttendent = false;
      let isPickUp = false;

      if (history[i].status == 1) {
        isAttendent = true;

        let pickUpObj = await Attendent.findOne({ student: history[i].student.id, date: date, classObj: params.classId });
        if (pickUpObj && pickUpObj.movingProcessStep == 3 && !allowShuttleBus) {
          isPickUp = true;
        }
        else if (pickUpObj && pickUpObj.movingProcessStep == 4 && allowShuttleBus) {
          isPickUp = true;
        }
      }

      history[i].isAttendent = isAttendent;
      history[i].isPickUp = isPickUp;

      delete history[i].id;
      delete history[i].createAt;
      delete history[i].updateAt;
      delete history[i].status;
      delete history[i].tracking;
      //delete history[i].parent;
      //delete history[i].note;
    }

    return res.json(history);
    
  },

  historyGet: async (req, res) => {
    sails.log.info("================================ MobileAttendentController.history => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();
    
    // REQUIRED FIELDS
    if (!params.classId) return res.badRequest(ErrorMessages.ATTENDENT_ERR_CLASSID_REQUIRED);
    if (!params.studentId) return res.badRequest(ErrorMessages.ATTENDENT_ERR_STUDENTID_REQUIRED);
    if (!params.date) return res.badRequest(ErrorMessages.ATTENDENT_DATE_REQUIRED);

    // VALIDATE DATE
    let date = moment(params.date).format("YYYY-MM-DD");
    if (date == 'Invalid date') {
      return res.badRequest(ErrorMessages.ATTENDENT_DATE_INVALID);
    }

    let attendentObj = await Attendent.findOne({ student: params.studentId, date: date, classObj: params.classId }).populate('student');
    if (!attendentObj) return res.badRequest(ErrorMessages.NO_DATA_ATTENDENT);
    let parentHandover = null;
    let parentReceiver = null;
    let teacherReceiver = null;
    let teachertHandover = null;
    let driverReceiver = null;
    let driverHandover = null;
    if (attendentObj.tracking[0].userOut != '')
      driverReceiver = await User.findOne({ id: attendentObj.tracking[0].userOut })
    if (attendentObj.tracking[1].userIn != '')
      parentHandover = await Parent.findOne({ id: attendentObj.tracking[1].userIn });
    if(!parentHandover) parentHandover = await User.findOne({ id: attendentObj.tracking[1].userIn });
    if (attendentObj.tracking[2].userIn != '')
      parentReceiver = await Parent.findOne({ id: attendentObj.tracking[2].userIn });
      if(!parentReceiver) parentReceiver = await User.findOne({ id: attendentObj.tracking[2].userIn });
    if (attendentObj.tracking[1].userOut != '')
      teacherReceiver = await User.findOne({ id: attendentObj.tracking[1].userOut });
    if (attendentObj.tracking[2].userOut != '')
      teachertHandover = await User.findOne({ id: attendentObj.tracking[2].userOut });
    if (attendentObj.tracking[3].userOut != '')
      driverHandover = await User.findOne({ id: attendentObj.tracking[3].userOut })
    attendentObj.tracking[1].userIn = parentHandover;
    attendentObj.tracking[1].userOut = teacherReceiver;
    attendentObj.tracking[2].userIn = parentReceiver;
    attendentObj.tracking[2].userOut = teachertHandover;
    attendentObj.tracking[0].userOut = driverReceiver;
    attendentObj.tracking[3].userOut = driverHandover;


    
    //let pickUpObj = await PickUp.findOne({ student: params.studentId, date: date, classObj: params.classId }).populate('parent');

    return res.json({ attendent: attendentObj , });
  },

  studentTracking: async (req, res) => {
    sails.log.info("================================ MobileAttendentController.studentTracking => START ================================");

    //GET ALL PARAMS
    let params = req.allParams();
    
    // REQUIRED FIELDS
    if (!params.classId) return res.badRequest(ErrorMessages.ATTENDENT_ERR_CLASSID_REQUIRED);
    if (!params.studentId) return res.badRequest(ErrorMessages.STUDENT_ID_REQUIRED);
    if (!params.date) return res.badRequest(ErrorMessages.ATTENDENT_ERR_DATEUSE_REQUIRED);

    // VALIDATE DATE
    let date = moment(params.date).format("YYYY-MM-DD");
    if (date == 'Invalid date') return res.badRequest(ErrorMessages.ATTENDENT_DATE_INVALID);

    //CHECK DATA ATTENDENT EXIST IN DATABASE
    let attendentObj = await AttendentService.get({ student: params.studentId, date: date, classObj: params.classId });
    if (!attendentObj) return res.badRequest(ErrorMessages.ATTENDENT_NOT_FOUND);

    let tracking = [];
    if (attendentObj.tracking && attendentObj.tracking.length) {
      tracking = attendentObj.tracking;
      for (let i = 0; i < tracking.length; i++){
        let userObj = await User.findOne({ id: tracking[i].user });
        tracking[i].user = userObj;
        let parentObj = await Parent.findOne({ id: tracking[i].parent });
        tracking[i].parent = parentObj;
      }
    }
    
    attendentObj.tracking = tracking;
    // RETURN DATA COURSE SESSION
    return res.json(attendentObj);

  },

  statistics: async (req, res) => {
    sails.log.info("================================ MobileAttendentController.monthlyAtendanceStatistic => START ================================");

    //GET ALL PARAMS
    let params = req.allParams();
    
    // REQUIRED FIELDS
    if (!params.classId && !params.studentId) return res.badRequest(ErrorMessages.ATTENDENT_CLASSID_OR_STUDENTID_REQUIRED);
    if (!params.month && !params.date) return res.badRequest(ErrorMessages.ATTENDENT_MONTH_OR_DATE_REQUIRED);
    
    // VALIDATE DATE
    let time = params.date ? moment(params.date).format("YYYY-MM-DD") : moment(params.month).format("YYYY-MM");
    if (time == 'Invalid date') {
      return res.badRequest(ErrorMessages.ATTENDENT_DATE_INVALID);
    }

    let where = params.studentId ? { student: params.studentId } : { classObj: params.classId };

    let month = params.date ? moment(params.date).format("YYYY-MM") : moment(params.month).format("YYYY-MM");
    where.date = { 'startsWith': month };

    let attendents = await Attendent.find(where).sort('date ASC');
    let monthlyData = [];

    if (params.studentId) {
      monthlyData = attendents.map(item => {
        let obj = {
          date: item.date,
          status: item.status
        };
        return obj;
      })
    } else {
      let dates = attendents.map(item => item.date);
      dates = [... new Set(dates)];
      for (let i = 0; i < dates.length; i++){
        let absences = attendents.filter(item => item.date == dates[i] && item.status == sails.config.custom.STATUS.ABSENT);
        let obj = {
          date: dates[i],
          status: sails.config.custom.STATUS.ATTENDANT
        };
        if (absences.length) obj.status = sails.config.custom.STATUS.ABSENT;

        monthlyData.push(obj);
      }
    }

    //update date condition
    where.date = params.date ? time : { 'startsWith': time };
    //update status to count present
    where.status = sails.config.custom.STATUS.ATTENDANT;
    let countPresent = await Attendent.count(where);
    
    //update status to count absent
    where.status = sails.config.custom.STATUS.ABSENT;
    let countAbsent = await Attendent.count(where);

    return res.json({ countPresent, countAbsent, monthlyData });
  }


};
