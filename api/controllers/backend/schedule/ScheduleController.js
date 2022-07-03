/**
 * ScheduleController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

//Library
const moment = require("moment");
const ErrorMessages = require("../../../../config/errors");
const ScheduleService = require("../../../services/ScheduleService");

module.exports = {
  add: async (req, res) => {
    // sails.log.info("================================ ScheduleController.add => START ================================");
    // // GET ALL PARAMS
    const params = req.allParams();
    let classID = params.classId;
    let slotSubjects = params.slotSubjects;
    let currDate = moment().format("YYYY-MM-DD");
    let dateStart = params.dateUseStart ? params.dateUseStart : currDate;
    let dateEnd = params.dateUseEnd ? params.dateUseEnd : currDate;
    let repeat = params.repeat ? params.repeat : false;
    let daysOnWeek = params.daysOnWeek ? params.daysOnWeek : [];
    let status = params.status ? parseInt(params.status) : 1;

    let createOrEdit = async (dateUse) => {
      //create or update schedule with specific dateUse
      const schedule = await Schedule.findOne({
        dateUse: dateUse,
        class: classID,
      });
      //If slotSubject return id only -> need to convert it to object
      let arrrSubjects = [];
      if (params.slotSubjects) {
        for (let _sbj of params.slotSubjects) {
          if (typeof _sbj.subject !== "object") {
            let _sbjObj = await Formation.findOne({ id: _sbj.subject });
            if (_sbjObj) {
              let itemSubject = {};
              itemSubject.id = _sbjObj.id;
              itemSubject.code = _sbjObj.code;
              itemSubject.title = _sbjObj.name;
              itemSubject.description = _sbjObj.description;
              _sbj.subject = itemSubject;
              arrrSubjects.push(_sbj);
            }
          }
          if (typeof _sbj.teacher !== "object") {
            let _teacher = await User.findOne({ id: _sbj.teacher });
            if (_teacher) {
              let itemTeacher = {};
              itemTeacher.id = _teacher.id;
              itemTeacher.firstName = _teacher.firstName;
              itemTeacher.tilastNametle = _teacher.lastName;
              _sbj.teacher = itemTeacher;
              arrrSubjects.push(_sbj);
            }
          }
        }
      }
      //End if
      const newData = {
        slotSubjects: arrrSubjects,
        dateUse: dateUse,
        status: status,
        class: classID,
        school: req.me.school,
      };
      let newSchedule = {};
      if (schedule) {
        //return res.ok(ErrorMessages.SCHEDULE_EXISTED)
        newSchedule = await ScheduleService.edit({ id: schedule.id }, newData);
      } else {
        newSchedule = await ScheduleService.add(newData);
      }

      return newSchedule;
    };

    if (repeat) {
      //add schedule for next daysOnWeek from now in range of time
      if (daysOnWeek && daysOnWeek.length > 0) {
        for (let day of daysOnWeek) {
          let tmp = moment(dateStart).clone().day(parseInt(day));
          console.log('daysOnWeek',tmp);
          if (tmp.isSameOrAfter(dateStart, "d")) {
            let dateUse = tmp.format("YYYY-MM-DD");
            await createOrEdit(dateUse);
          }
          //check if date is before dateEnd
          while (tmp.isSameOrBefore(moment(dateEnd))) {
            tmp.add(7, "days");
            let dateUse = tmp.format("YYYY-MM-DD");
            await createOrEdit(dateUse);
          }
        }
      }
    } else {
      //add schedule for next daysOnWeek from now
      if (daysOnWeek && daysOnWeek.length > 0) {
        for (let day of daysOnWeek) {
          const today = moment().isoWeekday();

          // if haven't yet passed the day of the week that I need:
          if (today <= day) {
            // then just give this week's instance of that day
            let dateUse = moment()
              .isoWeekday(parseInt(day))
              .format("YYYY-MM-DD");
            await createOrEdit(dateUse);
          } else {
            // otherwise, give *next week's* instance of that same day
            let dateUse = moment()
              .add(1, "weeks")
              .isoWeekday(parseInt(day))
              .format("YYYY-MM-DD");
            await createOrEdit(dateUse);
          }
        }
      }
    }

    return res.ok();

    // let duration = moment(dateEnd).diff(moment(dateStart), 'days');

    // //Add schedule for one day
    // if ( duration == 0) {
    //   // CHECK DATA SCHEDULE
    //   //Add schedule for one day, if schedule is existed => update schedule
    //   const schedule = await Schedule.findOne({
    //     dateUse: dateStart, class: classID
    //   });
    //   const newData = {
    //     slotSubjects: slotSubjects,
    //     dateUse: dateStart,
    //     status: status,
    //     class: classID
    //   };
    //   let newSchedule = {};
    //   if (schedule) {
    //     //return res.ok(ErrorMessages.SCHEDULE_EXISTED)
    //     newSchedule = await ScheduleService.edit({ id: schedule.id }, newData);
    //   } else {
    //     newSchedule = await ScheduleService.add(newData);
    //   }
    //   return res.ok(newSchedule);
    // } else {
    //   //Add schedule for multiple day, if schedule is existed => update schedule
    //   let arrSchedule = [];
    //   for (let i = 0; i <= duration; i++){
    //     let dateUse = moment(dateStart).add(i, 'days').format('YYYY-MM-DD');

    //     const schedule = await Schedule.findOne({
    //       dateUse: dateUse, class: classID
    //     });

    //     const newData = {
    //       slotSubjects: slotSubjects,
    //       dateUse: dateUse,
    //       status: status,
    //       class: classID
    //     };
    //     let newSchedule = {};
    //     if (schedule) {
    //       //return res.ok(ErrorMessages.SCHEDULE_EXISTED)
    //       newSchedule = await ScheduleService.edit({ id: schedule.id }, newData);
    //     } else {
    //       newSchedule = await ScheduleService.add(newData);
    //     }
    //     arrSchedule.push(newSchedule);
    //   }
    //   return res.ok(arrSchedule);
    // }
  },

  get: async (req, res) => {
    // GET ALL PARAMS
    const params = req.allParams();
    // CHECK PARAM
    if (!params.dateUse) {
      return res.badRequest(ErrorMessages.SCHEDULE_DATEUSE_REQUIRED);
    }
    // QUERY & CHECK DATA POST
    const schedule = await ScheduleService.get({
      dateUse: params.dateUse,
      class: params.classId,
    });
    if (!schedule) {
      return res.badRequest(ErrorMessages.SCHEDULE_NOT_FOUND);
    }
    let listSubject = await Formation.find({
      where: { school: req.me.school },
      sort: [{ name: "asc" }],
    });

    let listTeacher = await User.find({ where: { school: req.me.school, status: 1, userType: sails.config.custom.TYPE.TEACHER }, sort: [{ firstName: 'asc' }] });

    let dataSchedule = {};
    dataSchedule.schedule = schedule;
    dataSchedule.listSubjects = listSubject;
    dataSchedule.listTeacher - listTeacher;

    //check role of current logged in user
    let permissions = {};
    let schoolObj = await School.findOne({ id: req.me.school });
    permissions.isMainSchoolAdmin = 3 == req.me.userType ? true : false;
    permissions.isHavePermissionEdit = false;
    permissions.isHavePermissionDelete = false;
    if (
      !permissions.isMainSchoolAdmin &&
      req.me.role &&
      req.me.role.permissions &&
      req.me.role.permissions.schedule
    ) {
      permissions.isHavePermissionEdit = req.me.role.permissions.schedule.edit
        ? true
        : false;
      permissions.isHavePermissionDelete = req.me.role.permissions.schedule
        .delete
        ? true
        : false;
    }
    dataSchedule.permissions = permissions;

    // RETURN DATA POST
    return res.json(dataSchedule);
  },

  edit: async (req, res) => {
    sails.log.info(
      "================================ ScheduleController.edit => START ================================"
    );
    // GET ALL PARAMS
    const params = req.allParams();

    let status = params.status ? parseInt(params.status) : 1;
    // PREPARE DATA SCHEDULE
    //If slotSubject return id only -> need to convert it to object
    let arrrSubjects = [];
    if (params.slotSubjects) {
      for (let _sbj of params.slotSubjects) {
        if (typeof _sbj.subject !== "object") {
          let _sbjObj = await Formation.findOne({ id: _sbj.subject });
          
          if (_sbjObj) {
            let itemSubject = {};
            itemSubject.id = _sbjObj.id;
            itemSubject.code = _sbjObj.code;
            itemSubject.title = _sbjObj.name;
            itemSubject.description = _sbjObj.description;
            _sbj.subject = itemSubject;
            arrrSubjects.push(_sbj);
          }
        }
      }
    }
    //End if
    const newData = {
      class: params.classId,
      dateUse: params.dateUse,
      slotSubjects: arrrSubjects,
      status: status,
    };
    // CHECK DATA SCHEDULE
    const schedule = await Schedule.findOne({
      dateUse: params.dateUse,
      class: params.classId,
    });
    if (!schedule) {
      return res.notFound(ErrorMessages.SCHEDULE_NOT_FOUND);
    }
    // UPDATE DATA SCHEDULE
    const editObj = await ScheduleService.edit(
      {
        id: schedule.id,
      },
      newData
    );
    // RETURN DATA SCHEDULE
    return res.json(editObj[0]);
  },

  trash: async (req, res) => {
    sails.log.info(
      "================================ ScheduleController.trash => START ================================"
    );
    // GET ALL PARAMS
    const params = req.allParams();

    // CHECK IDS PARAM
    if (!params.ids || !params.ids.length) {
      return res.badRequest(ErrorMessages.SCHEDULE_ID_REQUIRED);
    }
    // CHECK Schedule & UPDATE
    const schedules = await ScheduleService.find({
      id: params.ids,
    });
    if (typeof params.ids === "string") {
      if (!schedules.length) {
        return res.badRequest(ErrorMessages.SCHEDULE_NOT_FOUND);
      } else {
        // nothing to do
      }
    } else {
      if (schedules.length !== params.ids.length) {
        return res.badRequest(ErrorMessages.SCHEDULE_NOT_FOUND);
      } else {
        // nothing to do
      }
    }
    await Schedule.update({
      id: params.ids,
    }).set({
      status: 3,
    });
    // RETURN DATA
    return res.json();
  },

  search: async (req, res) => {
    sails.log.info(
      "================================ ScheduleController.search => START ================================"
    );
    let params = req.allParams();
    let start = moment(params.start).format("YYYY-MM-DD");
    let end = moment(params.end).format("YYYY-MM-DD");
    let listSchedules = await Schedule.find({
      class: params.classId,
      dateUse: { ">=": start, "<=": end },
    });

    console.log(listSchedules[0].slotSubjects[0]);

    
    // Prepare Schedule
    let arrSchedule = [];
    for (let schedule of listSchedules) {
      if (schedule.slotSubjects.length) {
        for (let sbj of schedule.slotSubjects) {
          let itemSubject = {};
          let _sbjObj = sbj.subject;
          let _teacherObj = sbj.teacher || { firstName: '', lastName: '', id: ''};
          if (_sbjObj) {
            itemSubject.title = `${_sbjObj.title} | ${_teacherObj.firstName}`;
            itemSubject.topic = sbj.topic;
            itemSubject.start = schedule.dateUse + "T" + sbj.timeStart + ":00";
            arrSchedule.push(itemSubject);
          }
        }
      }
    }
    return res.ok(arrSchedule);
  },

  delete: async (req, res) => {
    sails.log.info(
      "================================ ScheduleController.delete => START ================================"
    );
    // GET ALL PARAMS
    const params = req.allParams();
    console.log(params);
    return;
    if (!params.id) return res.badRequest(ErrorMessages.SCHEDULE_ID_REQUIRED);

    let scheduleObj = await ScheduleService.get({ id: params.id });
    if (!scheduleObj) return res.badRequest(ErrorMessages.SCHEDULE_NOT_FOUND);
    ScheduleService.del({ id: params.id });

    return res.ok();
  },
};
