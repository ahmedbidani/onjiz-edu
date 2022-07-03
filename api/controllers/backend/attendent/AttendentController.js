/**
 * Attendent Controller
 *
 * @description :: Server-side logic for managing Posts
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const ErrorMessages = require('../../../../config/errors');
const AttendentService = require('../../../services/AttendentService');
const NotificationService = require('../../../services/NotificationService');
const moment = require('moment');
const _ = require('lodash');

module.exports = {

  checkExisted: async (req, res) => {
    sails.log.info("================================ AttendentController.checkExisted => START ================================");
    // CHECK SESSION
    if (!req.me) return res.badRequest(ErrorMessages.SYSTEM_SESSION_EXPIRED);
    req.i18n.defaultLocale = 'vi';
    req.i18n.prefLocale = 'vi';
    let webSettings = res.locals.webSettings;
    let params = req.allParams();
    let keyword = params.keyword ? params.keyword : null;
    let limit = (params.length) ? parseInt(params.length) : null;
    let skip = (params.start) ? parseInt(params.start) : 0;
    let draw = params.draw ? parseInt(params.draw) : 1;

    // CHECK PARAM CLASS ID & DATE
    if (!params.classId) {
      return res.badRequest(ErrorMessages.CLASS_ID_REQUIRED);
    } else if (!params.date) {
      return res.badRequest(ErrorMessages.ATTENDENT_DATE_REQUIRED);
    }
    // VALIDATE DATE
    let dateAttendent = '';
    let date = moment(params.date, "DD-MM-YYYY").format("YYYY-MM-DD");
    if (date == 'Invalid date') {
      return res.badRequest(ErrorMessage.ATTENDENT_DATE_INVALID)
    } else {
      dateAttendent = date;
    }
    let todayAttendent = [];

    let mongo = require('mongodb');
    let studentIds = [];

    if (params.branchId && params.classId == '-1') { //get student by all class
      let sessionsOfBranch = await CourseSession.find({ branchOfSession: params.branchId }).populate('classes');
      let classIds = [];
      for (let session of sessionsOfBranch) {
        let ids = session.classes.map(item => item.id);
        classIds = [...classIds, ...ids];
      }
      todayAttendent = await Attendent.find({ where: { date: dateAttendent, classObj: { 'in': classIds }, school: req.me.school }, limit: limit, skip: skip });
    }

    else if (params.branchId && params.classId == '3') { //get all students
      let studentIds1 = await Student.find({ school: req.me.school });
      let ids = studentIds1.map((std) => {
        return new mongo.ObjectID(std.id);
      })
      studentIds = [...studentIds, ...ids];
      todayAttendent = await Attendent.find({ where: { date: dateAttendent, school: req.me.school }, limit: limit, skip: skip });
    }
    //get student by 1 class
    else {
      //check attendent is existed?
      todayAttendent = await Attendent.find({ where: { date: dateAttendent, classObj: params.classId, school: req.me.school }, limit: limit, skip: skip });
    }

    //get student of class
    let student_class = await Student_Class.find({ classObj: params.classId });
    studentIds = student_class.map(item => item.student);

    //create attendentdata if not existed
    if (todayAttendent.length == 0) {

      //create attendent data for today
      for (let studentId of studentIds) {
        let attendentRecord = {
          student: studentId,
          date: dateAttendent,
          classObj: params.classId,
          school: req.me.school
        };
        let obj = await AttendentService.add(attendentRecord);
        todayAttendent.push(obj);
      }
    }

    /************************* get all student who name contain search if have search value ************/
    if (typeof keyword === "string" && keyword.length > 0) {
      let where = {};
      where = {
        $or: [
          { firstName: { $regex: keyword, $options: 'i' } },
          { lastName: { $regex: keyword, $options: 'i' } },
        ]
      }

      let mongo = require('mongodb');

      //get students form class
      let studentIDs = studentIds.map((stdId) => {
        return new mongo.ObjectID(stdId);
      })

      where.$and = [
        { status: params.status ? parseInt(params.status) : 1 },
        { _id: { $in: studentIDs } }
      ];

      /**SEARCH CASE_INSENSITIVE */
      const collection = Student.getDatastore().manager.collection(Student.tableName);
      let result = await collection.find(where);
      const dataWithObjectIds = await result.toArray();
      const arrStudent = JSON.parse(JSON.stringify(dataWithObjectIds).replace(/"_id"/g, '"id"'));

      studentIds = arrStudent.map(item => item.id);

      todayAttendent = todayAttendent.filter(item => studentIds.includes(item.student));
    }
    /************************* get all student who name contain search ************/


    let todayAttendentWithRelation = [];
    for (let attendent of todayAttendent) {
      let obj = await Attendent.findOne({ id: attendent.id }).populate('student').populate('classObj');
      todayAttendentWithRelation.push(obj);
    }
    // Check order
    let attendentSorted = [];
    if (params.order) {
      if (params.columns[params.order[0].column].data == 'student') {
        let dir = params.order[0].dir;
        attendentSorted = _.orderBy(todayAttendentWithRelation, [(item) => {
          return item.student.firstName;
        }], [dir]);
      }
    } else {
      attendentSorted = _.orderBy(todayAttendentWithRelation, ['createdAt'], ['desc']);
    }

    let attendentPrepared = [];
    for (let attendentItem of attendentSorted) {
      if (attendentItem.student) {
        // GET LIST PARENT OF STUDENT
        let relationStudentParent = await Student_Parent.find({ student: attendentItem.student.id }).populate('parent');
        let arrParent = [];
        _.each(relationStudentParent, async (relationItem) => {
          let objParent = {};
          objParent.id = relationItem.parent.id;
          firstNameParent = relationItem.parent.firstName ? relationItem.parent.firstName : "-";
          lastNameParent = relationItem.parent.lastName ? relationItem.parent.lastName : "-";
          let _tmpFullname = await sails.helpers.formatFullname(firstNameParent, lastNameParent, webSettings.value.displayName);

          objParent.fullName = _tmpFullname;
          objParent.phone = relationItem.parent.phone;
          objParent.avatar = relationItem.parent.avatar;
          objParent.gender = relationItem.parent.gender;
          arrParent.push(objParent)
        });
        attendentItem.arrParent = arrParent;
        attendentPrepared.push(attendentItem);
      }
    }

    params.school = req.me.school;

    //check role of current logged in user
    let schoolObj = await School.findOne({ id: req.me.school });
    params.isMainSchoolAdmin = 3 == req.me.userType ? true : false;
    params.isHavePermissionEdit = false;
    if (!params.isMainSchoolAdmin && req.me.role && req.me.role.permissions && req.me.role.permissions.attendent) {
      params.isHavePermissionEdit = req.me.role.permissions.attendent.edit ? true : false;
    }
    //attendentPrepared, params, dateAttendent
    //RENDER DATATABLE
    //GET SETTING OF STUDENT MOVING PROCESS
    let setting = await Setting.findOne({ key: 'web', school: params.school });
    let allowShuttleBus = false;
    if (setting && setting.value && setting.value.allowShuttleBus) allowShuttleBus = setting.value.allowShuttleBus;

    let resAttendents = [];
    for (let attendentItem of attendentPrepared) {
      let tmpData = {};
      // CODE STUDENT
      tmpData.code = attendentItem.student.code;
      // AVATAR & FULLNAME
      let studentPath = "";
      if (attendentItem.student.avatar && attendentItem.student.avatar != "") {
        studentPath = attendentItem.student.avatar;
      } else if (attendentItem.student.gender == 0) {
        studentPath = "/images/female-kid.png";
      } else {
        studentPath = "/images/male-kid.png";
      }
      let _tmpFullname = await sails.helpers.formatFullname(attendentItem.student.firstName, attendentItem.student.lastName,
        webSettings.value.displayName);
      tmpData.student =
        `<div class="d-flex align-items-center">
          <img src="${studentPath}" alt="profile" class="img-sm rounded-circle">
          <h6>${_tmpFullname}</h6>
        </div>`;

      tmpData.timeIn = '-';
      tmpData.in = '';
      let fullNameParent = '';
      let fullNameTeacher = '';
      let fullNameUTransport = '';

      if (attendentItem.tracking[0].time != '') {
        tmpData.timeIn = attendentItem.tracking[0].time;
        // get full name parent
        let uTransportObj = await User.findOne({ id: attendentItem.tracking[0].userIn })
        if (uTransportObj) {
          fullNameUTransport = await sails.helpers.formatFullname(uTransportObj.firstName, uTransportObj.lastName,
            webSettings.value.displayName);
          fullNameUTransport = sails.__("Receiver") + ': ' + sails.__("Driver") + ' ' + fullNameUTransport + '';
        }

        tmpData.in += '<h6>' + fullNameUTransport + '</h6>';
      }

      //tmpData.timeIn = attendentItem.tracking[1].time ? attendentItem.tracking[1].time : '-';
      if (attendentItem.tracking[1].time != '') {
        tmpData.timeIn = attendentItem.tracking[1].time;

        let userObj = await User.findOne({ id: attendentItem.tracking[1].userOut })
        fullNameTeacher = sails.__("Receiver") + ': ';
        if (userObj) {
          let getFullNameTeacher = await sails.helpers.formatFullname(userObj.firstName, userObj.lastName,
            webSettings.value.displayName);
          fullNameTeacher += sails.__("Teacher") + ' ' + getFullNameTeacher + '';
        }

        fullNameParent = sails.__("Handover") + ': '
        let parentObj = await Parent.findOne({ id: attendentItem.tracking[1].userIn })
        if (parentObj) {
          let getFullNameParent = await sails.helpers.formatFullname(parentObj.firstName, parentObj.lastName,
            webSettings.value.displayName);

          let gender = sails.__("MR");
          if (parentObj.gender == '0') gender = sails.__("MISS");

          fullNameParent += gender + ' ' + getFullNameParent + '';

        }

        let uTransportObj = await User.findOne({ id: attendentItem.tracking[1].userIn })
        if (uTransportObj) {
          fullNameUTransport = await sails.helpers.formatFullname(uTransportObj.firstName, uTransportObj.lastName,
            webSettings.value.displayName);
          fullNameParent += sails.__("Driver") + ' ' + fullNameUTransport + '';

        }
        if (!parentObj && !uTransportObj) fullNameParent += "-";

        tmpData.in += fullNameParent + '<br/>' + fullNameTeacher;
        if (attendentItem.tracking[1].note && attendentItem.tracking[1].note != '') {
          tmpData.in += '<br/>' + 'Note: ' + attendentItem.tracking[1].note;
        }
        // }
      }

      tmpData.timeOut = '';
      //tmpData.timeOut = attendentItem.tracking[2].time ? attendentItem.tracking[2].time : '-';

      tmpData.out = '';
      if (attendentItem.tracking[2].time != '') {
        tmpData.timeOut = attendentItem.tracking[2].time;

        fullNameTeacher = sails.__("Return") + ': ';
        let userObj = await User.findOne({ id: attendentItem.tracking[2].userOut })
        if (userObj) {
          let getFullNameTeacher = await sails.helpers.formatFullname(userObj.firstName, userObj.lastName,
            webSettings.value.displayName);
          fullNameTeacher += sails.__("Teacher") + ' ' + getFullNameTeacher + '';
        }
        // if (attendentItem.tracking[2].note != '') {
        //   let receiver = sails.__("Receiver") + ': ' + attendentItem.tracking[2].note;
        //   tmpData.out += receiver + '<br/>' + fullNameTeacher;
        // } else {
        // get full name parent
        fullNameParent = sails.__("Receiver") + ': ';
        let parentObj = await Parent.findOne({ id: attendentItem.tracking[2].userIn })
        if (parentObj) {
          let getFullNameParent = await sails.helpers.formatFullname(parentObj.firstName, parentObj.lastName,
            webSettings.value.displayName);
          let Gender = sails.__("MR");
          if (parentObj.gender == '0') Gender = sails.__("MISS");
          fullNameParent += Gender + ' ' + getFullNameParent + '';
        }

        let uTransportObj = await User.findOne({ id: attendentItem.tracking[2].userIn })
        if (uTransportObj) {
          fullNameUTransport = await sails.helpers.formatFullname(uTransportObj.firstName, uTransportObj.lastName,
            webSettings.value.displayName);
          fullNameParent += sails.__("Driver") + ' ' + fullNameParent + '';

        }
        if (!parentObj && !uTransportObj) fullNameParent += "-";
        tmpData.out += fullNameTeacher + '<br/>' + fullNameParent;
        if (attendentItem.tracking[2].note && attendentItem.tracking[2].note != '') {
          tmpData.out += '<br/>' + 'Note: ' + attendentItem.tracking[2].note;
        }
        // }
      }

      if (tmpData.timeOut == '') tmpData.timeOut = '-'
      if (tmpData.out == '') tmpData.out = '-'
      if (tmpData.timeIn == '') tmpData.timeIn = '-'
      if (tmpData.in == '') tmpData.in = '-'
      // tmpData.time = `<p class="text-center">${attendentItem.tracking[1].time == '' ? '-' : attendentItem.tracking[1].time}</p>`;

      // if (!attendentItem.tracking[1].userIn) {
      //   if (!attendentItem.tracking[1].note)
      //   {
      //     tmpData.parent = '-';
      //   } else tmpData.parent = `<p class="text-center">${attendentItem.tracking[1].note}</p>`
      // } else {
      //   let parentPath = '';
      //   let parentObj = await Parent.findOne({ id: attendentItem.tracking[1].userIn });
      //   if (parentObj.avatar && parentObj.avatar != '') {
      //     parentPath = parentObj.avatar;
      //   } else if (parentObj.gender == 0) {
      //     parentPath = '/images/female.png';
      //   } else {
      //     parentPath = '/images/male.png';
      //   }
      //   firstNameParent = parentObj.firstName ? parentObj.firstName : "-";
      //   lastNameParent = parentObj.lastName ? parentObj.lastName : "-";
      //   let _tmpFullnameParent = await sails.helpers.formatFullname(firstNameParent, lastNameParent, webSettings.value.displayName);

      //   tmpData.parent = !parentObj ? `<p class="text-center">-</p>` :
      //     `<div class="media">
      //       <div class="pr-10">
      //         <img class="mr-3 img-sm rounded-circle" src="${parentPath}" alt="${ _tmpFullnameParent }">
      //       </div>
      //       <div class="media-body">
      //         <h5>${_tmpFullnameParent}</h5>
      //         <i class="mdi mdi-cellphone-iphone"></i>
      //         <span>${parentObj.phone}</span>
      //       </div>
      //     </div>`;
      // }
      //tmpData.parent = '-';
      tmpData.arrParent = attendentItem.arrParent;
      tmpData.tool = '';
      tmpData.status = '';
      if (params.isMainSchoolAdmin || params.isHavePermissionEdit) {
        tmpData.tool = `<button `;
        if ((attendentItem.movingProcessStep >= 4) && allowShuttleBus)
          tmpData.tool += `disabled`;
        else if (attendentItem.movingProcessStep >= 3 && !allowShuttleBus)
          tmpData.tool += `disabled`;
        tmpData.tool += ` type="button" class="btn btn-primary btn-attendent" data-toggle="modal" data-target="#updateAttendent" data-backdrop="static" data-keyboard="false" data-displayName=${webSettings.value.displayName} data-attendentId=${attendentItem.id}>` + sails.__("Update") + `</button>`;
        if (attendentItem.status == 1) {
          tmpData.status =
            `<label class="switch">
            <input class="checkIn" type="checkbox" checked value="${attendentItem.id}">
            <span class="slider"></span>
          </label>`;
        } else {
          tmpData.status =
            `<label class="switch">
            <input class="checkIn" type="checkbox" value="${attendentItem.id}">
            <span class="slider"></span>
          </label>`;
        }
      }

      switch (attendentItem.movingProcessStep) {
        case 0: tmpData.currPlace = sails.__('At home'); break;
        case 1: tmpData.currPlace = sails.__('On bus'); break;
        case 2: tmpData.currPlace = sails.__('At class'); break;
        case 3: tmpData.currPlace = allowShuttleBus ? sails.__('On bus') : sails.__('Picked up'); break;
        case 4: tmpData.currPlace = sails.__('Dropped off'); break;
        default: tmpData.currPlace = '-';
      }

      resAttendents.push(tmpData);
    }
    let totalAttendent;
    if (params.classId == '-1' || params.classId == '3') {  //total student all class, all student
      totalAttendent = await AttendentService.count({ date: dateAttendent });
    }
    else {  //total student by 1 class
      totalAttendent = await AttendentService.count({ classObj: params.classId, date: dateAttendent });
    }
    // RETURN DATA ATTENDENT EXIST
    let respData = { recordsTotal: totalAttendent, recordsFiltered: totalAttendent, data: resAttendents, dataOrigin: attendentPrepared }
    //END RENDER DATATABLE

    respData.draw = draw;
    // RETURN DATA ATTENDENT EXIST
    return res.ok(respData);
  },

  get: async (req, res) => {
    sails.log.info("================================ AttendentController.get => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();
    if (!params.id) {
      return res.badRequest(ErrorMessages.ATTENDENT_ID_REQUIRED);
    }
    // QUERY & CHECK DATA COURSE SESSION
    let attendentObj = await AttendentService.get({ id: params.id });
    if (!attendentObj) {
      return res.notFound(ErrorMessages.ATTENDENT_NOT_FOUND);
    }
    let relationStudentParent = await Student_Parent.find({ student: attendentObj.student.id }).populate('parent')
    let arrParent = [];
    _.each(relationStudentParent, async (relationItem) => {
      let objParent = {};
      objParent.id = relationItem.parent.id;

      let _tmpFullnameParent2 = await sails.helpers.formatFullname(relationItem.parent.firstName, relationItem.parent.lastName, webSettings.value.displayName);
      objParent.fullName = _tmpFullnameParent2;
      objParent.phone = relationItem.parent.phone;
      arrParent.push(objParent)
    })
    attendentObj.arrParent = arrParent;
    // RETURN DATA COURSE SESSION
    return res.json(attendentObj);
  },

  checkIn: async (req, res) => { //USE IN CASE SHUTTLE PERSON INFO IS OFF
    sails.log.info("================================ AttendentController.checkIn => START ================================");
    // // GET ALL PARAMS
    const params = req.allParams();
    if (!params.id) return res.badRequest(ErrorMessages.ATTENDENT_ID_REQUIRED);

    // GET OBJ
    let attendentObj = await AttendentService.get({ id: params.id });
    if (!attendentObj) return res.badRequest(ErrorMessages.ATTENDENT_NOT_FOUND);

    //GET SETTING
    let setting = await Setting.findOne({ key: 'web', school: req.me.school });
    let allowShuttleBus = setting && setting.value ? setting.value.allowShuttleBus : false;

    let editData = {};
    if (attendentObj.status == sails.config.custom.STATUS.ATTENDANT) {
      editData.status = sails.config.custom.STATUS.ABSENT;
      //remove pickup obj if existed
      await PickUpService.del({ student: attendentObj.student.id, date: attendentObj.date, classObj: attendentObj.classObj });

      //update movingProcessStep of student is 1 if student is picked up by school bus
      editData.movingProcessStep = allowShuttleBus ? 1 : 0;
    } else {
      editData.status = sails.config.custom.STATUS.ATTENDANT;
      editData.movingProcessStep = 2;
    }

    //UPDATE STATUS
    let editedObj = await AttendentService.edit({ id: params.id }, editData);
    return res.json(editedObj);
    // END UPDATE
  },

  edit: async (req, res) => { //USE IN CASE SHUTTLE PERSON INFO IS ON
    sails.log.info("================================ AttendentController.edit => START ================================");
    // GET ALL PARAMS
    // if (!req.me) {
    //   return res.badRequest(ErrorMessages.SYSTEM_SESSION_EXPIRED);
    // }
    const params = req.allParams();
    // CHECK PARAMS
    if (!params.id) {
      return res.badRequest(ErrorMessages.ATTENDENT_ID_REQUIRED);
    } else if (!params.time) {
      return res.badRequest(ErrorMessages.ATTENDENT_TIME_REQUIRED);
    } else if (params.parent == '' && (!params.note || !params.note.trim().length)) {
      return res.badRequest(ErrorMessages.ATTENDENT_NOTE_REQUIRED);
    }

    let setting = await Setting.findOne({ key: 'web', school: req.me.school });
    let allowShuttleBus = setting && setting.value ? setting.value.allowShuttleBus : false;

    // CHECK ID PICK UP EXIST
    const attendentObj = await AttendentService.get({ id: params.id });
    let elementTracking = parseInt(attendentObj.movingProcessStep);
    let movingProcessStep = parseInt(attendentObj.movingProcessStep) + 1;
    if (elementTracking == 0 && !allowShuttleBus) {
      elementTracking = 1;
      movingProcessStep = 2;
    }

    if (!attendentObj) {
      return res.notFound(ErrorMessages.ATTENDENT_NOT_FOUND);
    }

    let parentId = params.parent ? params.parent : '';

    let teacherObj = await Teacher_Class.find({ classObj: attendentObj.classObj });
    let teacherId = '';
    if (teacherObj.length != 0)
      teacherId = teacherObj[0].teacher;

    let tracking = attendentObj.tracking;

    tracking[elementTracking] = { step: movingProcessStep, time: params.time, userIn: parentId, userOut: teacherId, note: params.note };
    let attendentRecord = {
      status: sails.config.custom.STATUS.ATTENDANT,
      tracking: tracking,
      movingProcessStep: movingProcessStep
    }

    // UPDATE DATA PICK UP
    const editedObj = await AttendentService.edit({ id: params.id }, attendentRecord);

    //SEND NOTI
    let dataNotification = {
      title: '',
      message: '',
      status: sails.config.custom.STATUS.ACTIVE,
      type: sails.config.custom.TYPE.PICK_UP,
      classList: [],
      school: req.me.school
    };

    // //get obj student
    let studentObj = await Student.findOne({ id: params.studenId });
    //get obj parent who pickup student
    let parentObj = await Parent.findOne({ id: params.parent });
    //get teacher who pickup student
    let teacherPickup = await User.findOne({ id: teacherId });
    let _tmpFullname = await sails.helpers.formatFullname(studentObj.firstName, studentObj.lastName, setting.value.displayName);
    let _tmpFullnameTeacher = await sails.helpers.formatFullname(teacherPickup.firstName, teacherPickup.lastName, setting.value.displayName);
    let _tmpFullnameParent = '';
    let dateAttentdent = moment(attendentObj.date).format(setting.value.dateFormat);

    if (movingProcessStep == 4 && allowShuttleBus) {
      dataNotification.title = sails.__('Attendent child %s has been picked up by school bus', _tmpFullname);
      dataNotification.message = sails.__('Time attendent %s %s ', params.time, dateAttentdent);
    }
    else if (movingProcessStep == 3 && !allowShuttleBus) {
      if (parentObj) {
        _tmpFullnameParent = await sails.helpers.formatFullname(parentObj.firstName, parentObj.lastName, setting.value.displayName);
      }
      dataNotification.title = sails.__('Child %s has been picked up  up from teacher %s ', _tmpFullname, _tmpFullnameTeacher);
      dataNotification.message = sails.__('Time attendent %s %s receiver %s teacher %s ', params.time, dateAttentdent, _tmpFullnameParent, _tmpFullnameTeacher);
    }

    if (movingProcessStep == 1 && allowShuttleBus) {
      dataNotification.title = sails.__('Child %s  on bus', _tmpFullname);
      dataNotification.message = sails.__('Time attendent %s %s ', params.time, dateAttentdent);
    }
    else if (movingProcessStep == 2 && !allowShuttleBus) {
      if (parentObj) {
        _tmpFullnameParent = await sails.helpers.formatFullname(parentObj.firstName, parentObj.lastName, setting.value.displayName);
      }
      dataNotification.title = sails.__('Attendent of child %s at class from teacher %s', _tmpFullname, _tmpFullnameTeacher);
      dataNotification.message = sails.__('Time attendent %s %s from handover %s teacher %s', params.time, dateAttentdent, _tmpFullnameParent, _tmpFullnameTeacher);
    }

    if ((allowShuttleBus && movingProcessStep == 4 || movingProcessStep == 1)
      || (!allowShuttleBus && movingProcessStep == 3 || movingProcessStep == 2)) {
      //get list parent of student
      let allStudent_Parent = await Student_Parent.find({ student: params.studenId });
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

}
