/**
 * Schedule Controller
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
*/
const ErrorMessage = require('../../../config/errors');
const ScheduleService = require('../../services/ScheduleService');

module.exports = {
  search: async (req, res) => {
    let params = req.allParams();

    if (!params.classId) {
      return res.badRequest(ErrorMessage.SCHEDULE_ERR_CLASSID_REQUIRED);
    } else if (!params.dateUse) {
      return res.badRequest(ErrorMessage.SCHEDULE_ERR_DATE_REQUIRED);
    }

    const tmpData = {
      class: params.classId,
      dateUse: params.dateUse
    };

    let listSchedules = await Schedule.find(tmpData);
    // Prepare Schedule
    let arrSchedule = [];
    for (let schedule of listSchedules) {
      if(schedule.slotSubjects.length) {
        for (let sbj of schedule.slotSubjects) {
          let itemSubject = {};
          let _sbjObj = sbj.subject;
          itemSubject.title = _sbjObj.title;
          itemSubject.topic = sbj.topic;
          itemSubject.timeStart = sbj.timeStart;
          itemSubject.timeEnd = sbj.timeEnd; 
          arrSchedule.push (itemSubject);
        }
      }
    }

    return res.ok({
      data: arrSchedule
    });
  }

}