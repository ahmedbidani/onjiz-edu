/**
 * SubjectController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */


//Library
const moment = require('moment'); 

module.exports = {

  search: async (req, res) => {
    sails.log.info("================================ SubjectController.search => START ================================");
    let params = req.allParams();
    let start = moment(params.start).format("YYYY-MM-DD");
    let end = moment(params.end).format("YYYY-MM-DD");
    let listSchedules = await Schedule.find({ class: params.classId, dateUse: { '>=': start, '<=': end } })
    // Prepare Schedule
    let arrSchedule = [];
    for (let schedule of listSchedules) {
      if(schedule.slotSubjects.length) {
        for (let sbj of schedule.slotSubjects) {
          let itemSubject = {};
          let _sbjObj = sbj.subject;
          if(_sbjObj) {
            itemSubject.title = _sbjObj.title;
            itemSubject.topic = sbj.topic;
            itemSubject.start = schedule.dateUse + 'T' + sbj.timeStart + ':00';
            arrSchedule.push (itemSubject);
          }
        }
      }
    } 
    return res.ok(arrSchedule);
  } 
};
