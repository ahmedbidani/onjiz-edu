/**
 * @copyright 2019 @ ZiniMedia Ltd. Co
 * @author dungha
 * @create 2019/06/20
 * @file api/models/PickUp.js
 */

const ErrorMessages = require('../../../../config/errors');
const AttendentService = require('../../../services/AttendentService');
const NotificationService = require('../../../services/NotificationService');
const moment = require('moment');
const _ = require('lodash');

const renderDataTable = async (pickupArray, params) => {

  let datePickUp = moment(params.date, "DD-MM-YYYY").format("YYYY-MM-DD");

  let resPickUps = [];
  for (let pickUpItem of pickupArray) {
    let tmpData = {};
    // CODE STUDENT
    tmpData.code = pickUpItem.student.code;
    // AVATAR & FULLNAME
    let studentPath = "";
    if (pickUpItem.student.avatar && pickUpItem.student.avatar != "") {
      studentPath = pickUpItem.student.avatar;
    } else if (pickUpItem.student.gender == 0) {
      studentPath = "/images/female-kid.png";
    } else {
      studentPath = "/images/male-kid.png";
    }
    tmpData.student =
      `<div class="d-flex align-items-center">
        <img src="${studentPath}" alt="profile" class="img-sm rounded-circle">
        <h6>${pickUpItem.student.firstName + ' ' + pickUpItem.student.lastName}</h6>
      </div>`;
    // if (pickUpItem.student.avatar && pickUpItem.student.avatar != "") { 
    //   tmpData.fullName =
    //     `<div class="d-flex align-items-center">
    //         <img src="${pickUpItem.student.avatar}" alt="profile" class="img-sm rounded-circle">
    //         <h6>${pickUpItem.student.firstName + ' ' + pickUpItem.student.lastName}</h6>
    //       </div>`;
    // }
    tmpData.time = `<p class="text-center">${pickUpItem.time == '' ? '-' : pickUpItem.time}</p>`;

    let parentPath = '/images/male.png';
    if (pickUpItem.parent && pickUpItem.parent.gender == 0) parentPath = '/images/female.png';
    tmpData.parent = !pickUpItem.parent ? `<p class="text-center">-</p>` :
      `<div class="media">
        <div class="pr-10">
          <img class="mr-3 img-sm rounded-circle" src="${parentPath}" alt="${pickUpItem.parent.firstName + ' ' + pickUpItem.parent.lastName}">
        </div>
        <div class="media-body">
          <h5>${pickUpItem.parent.firstName + ' ' + pickUpItem.parent.lastName}</h5>
          <i class="mdi mdi-cellphone-iphone"></i>
          <span>${pickUpItem.parent.phone}</span>
        </div>
      </div>`;
    if (pickUpItem.parent && pickUpItem.parent.avatar && pickUpItem.parent.avatar != '') {
      tmpData.parent = !pickUpItem.parent ? `<p class="text-center">-</p>` :
        `<div class="media">
          <div class="pr-10">
            <img class="mr-3 img-sm rounded-circle" src="${pickUpItem.parent.avatar}" alt="${pickUpItem.parent.firstName + ' ' + pickUpItem.parent.lastName}">
          </div>
          <div class="media-body">
            <h5>${pickUpItem.parent.firstName + ' ' + pickUpItem.parent.lastName}</h5>
            <i class="mdi mdi-cellphone-iphone"></i>
            <span>${pickUpItem.parent.phone}</span>
          </div>
        </div>`;
    }

    tmpData.arrParent = pickUpItem.arrParent;
    tmpData.tool = '';
    if (params.isMainSchoolAdmin || params.isHavePermissionEdit) {
      tmpData.tool = `<button type="button" class="btn btn-primary" data-toggle="modal" data-target="#updatePickUp" data-backdrop="static" data-keyboard="false" data-pickUpId=${pickUpItem.id}>`+ sails.__("Update") +`</button>`;
    }
    resPickUps.push(tmpData);
  }
  let totalPickUp = await PickUpService.count({ classObj: params.classId, date: datePickUp });
  // RETURN DATA PICKUP EXIST
  let respData = { recordsTotal: totalPickUp, recordsFiltered: totalPickUp, data: resPickUps, dataOrigin: pickupArray }
  return respData;
}

module.exports = {

  checkExisted: async (req, res) => {
    sails.log.info("================================ PickUpController.checkExisted => START ================================");
    // CHECK SESSION
    if (!req.me) return res.badRequest(ErrorMessages.SYSTEM_SESSION_EXPIRED);
    let params = req.allParams();
    let keyword = params.keyword ? params.keyword : null;
    let limit = (params.length) ? parseInt(params.length) : null;
    let skip = (params.start) ? parseInt(params.start) : null;
    let draw = params.draw ? parseInt(params.draw) : 1;
    // CHECK PARAM CLASS ID & DATE
    if (!params.classId) {
      return res.badRequest(ErrorMessages.CLASS_ID_REQUIRED);
    } else if (!params.date) {
      return res.badRequest(ErrorMessages.PICKUP_DATE_REQUIRED);
    }
    // VALIDATE DATE
    let datePickUp = '';
    let date = moment(params.date, "DD-MM-YYYY").format("YYYY-MM-DD");
    if (date == 'Invalid date') {
      return res.badRequest(ErrorMessage.PICKUP_DATE_INVALID)
    } else {
      datePickUp = date;
    }

    let todayAttendents = [];
    let classIds = [];
    if (params.branchId && params.classId == '0') {
      let sessionsOfBranch = await CourseSession.find({ branchOfSession: params.branchId }).populate('classes');
      for (let session of sessionsOfBranch) {
        let ids = session.classes.map(item => item.id);
        classIds = [...classIds, ...ids];
      }
      todayAttendents = await Attendent.find({ date: datePickUp, classObj: {'in': classIds}, school: req.me.school });
    } else {
      classIds = [params.classId];

      //check is today attendent is existed? if not existed => return error
      todayAttendents = await Attendent.find({ date: datePickUp, classObj: params.classId });
    }
    
    if (todayAttendents.length == 0) return res.badRequest(ErrorMessages.PICKUP_NOT_ALLOWED);

    //get attendantList
    let attendantList = todayAttendents.filter((item) => item.status == 1);
    let attendantStudentIds = attendantList.map((item) => item.student);

    //check pickup is existed?
    let todayPickup = [];
    if (params.branchId && params.classId == '0') {
      todayPickup = await PickUp.find({ where: { date: datePickUp, classObj: { 'in': classIds } }, limit: limit, skip: skip });
      //create pickup data for attendant students
      if (attendantList && attendantList.length > 0) {
        for (let attendant of attendantList) {
          let pickUpRecord = {
            student: attendant.student,
            date: datePickUp,
            classObj: attendant.classObj,
            school: req.me.school
          };
          let obj = await PickUpService.get(pickUpRecord);
          if (!obj) {
            obj = await PickUpService.add(pickUpRecord);
            todayPickup.push(obj);
          }
        }
      }
      
    } else {
      todayPickup = await PickUp.find({ where: { date: datePickUp, classObj: params.classId }, limit: limit, skip: skip });
      //create pickup data for attendant students
      if (attendantStudentIds && attendantStudentIds.length > 0) {
        for (let studentId of attendantStudentIds) {
          let pickUpRecord = {
            student: studentId,
            date: datePickUp,
            classObj: params.classId,
            school: req.me.school
          };
          let obj = await PickUpService.get(pickUpRecord);
          if (!obj) {
            obj = await PickUpService.add(pickUpRecord);
            todayPickup.push(obj);
          }
        }
      }
    }
   
      

    /************************* get all student who name contain search if have search value ************/
    if (typeof keyword === "string" && keyword.length > 0) {
      let where = {};
      where = {
        $or: [
          { firstName: { $regex: keyword, $options: 'i' }},
          { lastName: { $regex: keyword, $options: 'i' }},
        ]
      } 
      
      let mongo = require('mongodb');
      
      //get students form class 
      let studentIDs = attendantStudentIds.map((stdId) => {
        return new mongo.ObjectID(stdId);
      })
      
      where.$and = [
        { status: params.status ? parseInt(params.status) : 1 },
        { _id: { $in: studentIDs } },
        { school: new mongo.ObjectID(req.me.school) }
      ];
      
      /**SEARCH CASE_INSENSITIVE */
      const collection = Student.getDatastore().manager.collection(Student.tableName);
      let result = await collection.find(where);
      const dataWithObjectIds = await result.toArray();
      const arrStudent = JSON.parse(JSON.stringify(dataWithObjectIds).replace(/"_id"/g, '"id"'));

      let attendantStudentIdsWithSearch = arrStudent.map(item => item.id);

      todayPickup = todayPickup.filter(item => attendantStudentIdsWithSearch.includes(item.student));
    }
      /************************* get all student who name contain search ************/


    let todayPickUpWithRelation = [];
    for (let pickup of todayPickup) {
      let obj = await PickUp.findOne({ id: pickup.id }).populate('student').populate('classObj').populate('parent');
      todayPickUpWithRelation.push(obj);
    }
    // Check order
    let pickUpSorted = [];
    if (params.order) {
      if (params.columns[params.order[0].column].data == 'student') {
        let dir = params.order[0].dir;
        pickUpSorted = _.orderBy(todayPickUpWithRelation, [(item) => {
          return item.student.firstName;
        }], [dir]);
      }
    } else {
      pickUpSorted = _.orderBy(todayPickUpWithRelation, ['createdAt'], ['desc']);
    }

    let pickupPrepared = [];
    for (let pickupItem of pickUpSorted) {
      // GET LIST PARENT OF STUDENT
      let relationStudentParent = await Student_Parent.find({ student: pickupItem.student.id }).populate('parent');
      let arrParent = [];
      _.each(relationStudentParent, (relationItem) => {
        let objParent = {};
        objParent.id = relationItem.parent.id;
        objParent.fullName = relationItem.parent.firstName + ' ' + relationItem.parent.lastName;
        objParent.phone = relationItem.parent.phone;
        objParent.avatar = relationItem.parent.avatar;
        objParent.gender = relationItem.parent.gender;
        arrParent.push(objParent)
      });
      pickupItem.arrParent = arrParent;
      pickupPrepared.push(pickupItem);
    }

    //check role of current logged in user
    let schoolObj = await School.findOne({ id: req.me.school });
    params.isMainSchoolAdmin = 3 == req.me.userType ? true : false;
    params.isHavePermissionEdit = false;
    if (!params.isMainSchoolAdmin && req.me.role && req.me.role.permissions && req.me.role.permissions.pickUp) {
      params.isHavePermissionEdit = req.me.role.permissions.pickUp.edit ? true : false;
    }

    let data = await renderDataTable(pickupPrepared, params);
    data.draw = draw;
    // RETURN DATA PICKUP EXIST
    return res.ok(data);
  },

  get: async (req, res) => {
    sails.log.info("================================ PickUpController.get => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();
    if (!params.id) {
      return res.badRequest(ErrorMessages.PICKUP_ID_REQUIRED);
    }
    // QUERY & CHECK DATA COURSE SESSION
    let pickUps = await PickUpService.get({ id: params.id });
    if (!pickUps) {
      return res.notFound(ErrorMessages.PICKUP_NOT_FOUND);
    }
    let relationStudentParent = await Student_Parent.find({ student: pickUps.student.id }).populate('parent')
    let arrParent = [];
    _.each(relationStudentParent, (relationItem) => {
      let objParent = {};
      objParent.id = relationItem.parent.id;
      objParent.fullName = relationItem.parent.firstName + ' ' + relationItem.parent.lastName;
      objParent.phone = relationItem.parent.phone;
      arrParent.push(objParent)
    })
    pickUps.arrParent = arrParent;
    // RETURN DATA COURSE SESSION
    return res.json(pickUps);
  },

  edit: async (req, res) => {
    sails.log.info("================================ PickUpController.edit => START ================================");
    // GET ALL PARAMS
    // if (!req.me) {
    //   return res.badRequest(ErrorMessages.SYSTEM_SESSION_EXPIRED);
    // }
    const params = req.allParams();
    // CHECK PARAMS
    if (!params.id) {
      return res.badRequest(ErrorMessages.PICKUP_ID_REQUIRED);
    } else if (!params.studenId) {
      return res.badRequest(ErrorMessages.STUDENT_ID_REQUIRED);
    } else if (!params.date) {
      return res.badRequest(ErrorMessages.PICKUP_DATE_REQUIRED);
    } else if (!params.time) {
      return res.badRequest(ErrorMessages.PICKUP_TIME_REQUIRED);
    } else if (!params.parent) {
      return res.badRequest(ErrorMessages.PARENT_ID_REQUIRED);
    }
    // VALIDATE DATE
    let datePickUp = '';
    let date = moment(params.date, "DD-MM-YYYY").format("YYYY-MM-DD");
    if (date == 'Invalid date') {
      return res.badRequest(ErrorMessage.PICKUP_DATE_INVALID)
    } else {
      datePickUp = date;
    }
    // CHECK ID PICK UP EXIST
    const pickUp = await PickUpService.get({ id: params.id });
    if (!pickUp) {
      return res.notFound(ErrorMessages.PICKUP_NOT_FOUND);
    }

    //CHECK ATTENDANCE OBJ IS EXISTED?
    let attendanceObj = await Attendent.findOne({ student: pickUp.student.id, classObj: pickUp.classObj, date: pickUp.date });
    if (!attendanceObj) return res.badRequest(ErrorMessage.ATTENDENT_NOT_FOUND);

    let parentId = params.parent ? params.parent : '';

    let teacherObj = await Teacher_Class.find({ classObj: pickUp.classObj });
    let teacherId = '';
    if (teacherObj.length != 0)
      teacherId = teacherObj[0].teacher;

    let tracking = attendanceObj.tracking;
    tracking[2] = { step: 3, time: params.time, userIn: parentId, userOut: teacherId };

    let pickUpRecord = {
      tracking: tracking,
      movingProcessStep: 3
    }

    // UPDATE DATA PICK UP
    const editedObj = await AttendentService.edit({ id: params.id }, pickUpRecord);

    //UPDATE MOVING PROCESS INDEX OF ATTENDANCE
    //await Attendent.updateOne({ id: attendanceObj.id }).set({ movingProcessStep: 3 });

    //SEND NOTI
    let dataNotification = {
      title: '',
      message: '',
      status: sails.config.custom.STATUS.ACTIVE,
      type: sails.config.custom.TYPE.PICK_UP,
      classList: [],
      school: req.me.school
    };


    //get obj parent who pickup student
    let parentObj = await Parent.findOne({ id: params.parent });
    if (parentObj) {
      dataNotification.title = sails.__('Your child has been picked up by %s %s', parentObj.firstName, parentObj.lastName);
      dataNotification.message = sails.__('Your child has been picked up by %s %s', parentObj.firstName, parentObj.lastName);
    } else {
      
      //GET SETTING
      let setting = await Setting.findOne({ key: 'web', school: req.me.school });
      let allowShuttleBus = setting && setting.value ? setting.value.allowShuttleBus : false;

      if (allowShuttleBus) {
        dataNotification.title = sails.__('Your child has been picked up by school bus');
        dataNotification.message = sails.__('Your child has been picked up by school bus');
      }
    }

    //get list parent of student
    let allStudent_Parent = await Student_Parent.find({ student: params.studenId });
    let allParentId = allStudent_Parent.map(item => item.parent);
    
    if (allParentId.length) {
      //create notification and send push noti
      let notification = await NotificationService.add(dataNotification);
      await NotificationService.pushFirebase(notification, allParentId, []);
    }

    // RETURN DATA EDITED 
    return res.json(editedObj);
  }

};
