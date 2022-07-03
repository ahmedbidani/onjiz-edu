/**
 * @copyright 2017 @ ZiniMediaTeam
 * @author brianvo
 * @create 2017/10/23 01:05
 * @update 2017/10/23 01:05
 * @file api/models/Schedule.js
 * @description :: Schedule  model. Thời khóa biểu: Ăn trưa, vệ sinh và khác subject môn học
 */

 const { v4: uuidv4 } = require('uuid');

module.exports = {
  attributes: {
    slotSubjects: {
      type: 'json',
      description: 'List schedule data',
      defaultsTo: [{ "timeStart": "07:00", "timeEnd": "07:30", "subject" : {}, "teacher": {}, "topic": "", "uuid": uuidv4() }]
      //Format for subjects -> get full structure from subject model
      //"subjects\":[{"title":"Math Team", "code":"math","alias":"math-team", "description":""}]
    },
    status: {                           //Integer {"TRASH":-1,"DRAFT":0,"ACTIVE":1}
      type: 'number',
      isIn: [sails.config.custom.STATUS.TRASH, sails.config.custom.STATUS.DRAFT, sails.config.custom.STATUS.ACTIVE],
      defaultsTo: sails.config.custom.STATUS.ACTIVE
    },
    dateUse: {
      type: 'string', /* Ngày áp dụng format YYYY-mm-dd*/
    },
    class: {
      model: 'class',
      //required: true
    },
    school: {
      model: 'school',
      required: true
    }
  }
};