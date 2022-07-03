/**
 * AlbumController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
*/
const ErrorMessage = require('../../../config/errors');
const DayoffService = require('../../services/DayoffService');
const moment = require('moment');

module.exports = {

  add: async (req, res) => {
    sails.log.info('================================ DayoffController.dayOff => START ================================');
    let params = req.allParams();

    let classId = params.classId;
    let studentId = params.studentId;
    let dateOff = [...params.dates];

    if (!classId) {
      return res.badRequest(ErrorMessage.DAYOFF_ERR_CLASS_REQUIRED);
    } else if (!studentId) {
      return res.badRequest(ErrorMessage.DAYOFF_ERR_STUDENT_REQUIRED);
    } else if (!dateOff) {
      return res.badRequest(ErrorMessage.DAYOFF_ERR_DATEOFF_REQUIRED);
    }
    if (!params.school) return res.badRequest(ErrorMessage.SCHOOL_ID_REQUIRED);

    for (let date of params.dates) {
      let duplicates = await Dayoff.find({ class: classId, student: studentId, dateOff: { contains: date } });
      // if (duplicates.length > 0) return res.badRequest(ErrorMessage.DAYOFF_ERR_DATE_DUPLICATED);
      if (duplicates.length > 0) {
        dateOff = dateOff.filter(item => item !== date)
      }
    }

    //new
    const newData = {
      student: studentId,
      class: classId,
      dateOff: dateOff,
      content: params.content ? params.content : '',
      note: params.note ? params.note : '',
      type: params.type > 0 ? params.type : 1,
      status: sails.config.custom.STATUS.ACTIVE,
      school: params.school
    };
    // ADD NEW DATA ATTENDENT
    let added = await DayoffService.add(newData);

    
    //create notification for this dayOff and push notification if setting for notificationDayOff == true
    let settingForApp = await Setting.findOne({ key: 'app', school: params.school });
    if (settingForApp && settingForApp.value && settingForApp.value.notificationDayOff == true) {
      //define teacherIds && parentIds
      let allTeacherId = [];

      let newDataNotification = {
        title: added.content,
        message: added.content,
        status: sails.config.custom.STATUS.ACTIVE,
        type: sails.config.custom.TYPE.DAY_OFF,
        classList: [],
        school: params.school
      }
      let notification = await Notifications.create(newDataNotification).fetch();
      //get all teacher of this class to send notification
      let allTeacher_Class = await Teacher_Class.find({ classObj: classId });
      allTeacherId = allTeacher_Class.map(item => item.teacher);

      //send notification
      await NotificationService.pushFirebase(notification, [], allTeacherId);
    }

    results = await Dayoff.findOne({
      id: added.id
    }).populate('student').populate('class');

    sails.log.info(
      '================================ DayoffController.dayOff => END ================================'
    );
    return res.json(results);
  },

  history: async (req, res) => {
    sails.log.info('================================ DayoffController.history => START ================================');
    let params = req.allParams();

    if (!params.class) return res.badRequest(ErrorMessage.CLASS_ID_REQUIRED);
    if (!params.date) return res.badRequest(ErrorMessage.DAYOFF_ERR_DATEOFF_REQUIRED);

    // VALIDATE DATE
    let date = moment(params.date).format("YYYY-MM-DD");
    if (date == 'Invalid date') {
      return res.badRequest(ErrorMessage.INVALID_DATE);
    }

    let student_class = await Student_Class.find({ classObj: params.class }).populate('student');
    let students = student_class.map((item) => item.student);

    let history = [];
    for (let student of students) {
      let obj = {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        gender: student.gender,
        avatar: student.avatar
      };

      let dayOff = await Dayoff.find({ student: student.id, class: params.class, dateOff: { contains: params.date } });
      if (dayOff.length > 0) {
        obj.typeOff = dayOff[0].type;
      }
      history.push(obj);
    }

    return res.json(history);
  },

  historyGet: async (req, res) => {
    sails.log.info('================================ DayoffController.historyGet => START ================================');
    let params = req.allParams();
    if (!params.student) return res.badRequest(ErrorMessage.STUDENT_ID_REQUIRED);
    if (!params.class) return res.badRequest(ErrorMessage.CLASS_ID_REQUIRED);
    let page = params.page ? parseInt(params.page) : 1;
    let limit = params.limit ? parseInt(params.limit) : 10;

    let student = await Student.findOne({ id: params.student });
    if (!student) return res.badRequest(ErrorMessage.STUDENT_NOT_FOUND);

    let dayOffs = await Dayoff.find({ student: params.student, class: params.class }).skip((page - 1) * limit).limit(limit).sort('createdAt DESC');
    student.arrDayOff = dayOffs;

    return res.json(student);
  }

};
