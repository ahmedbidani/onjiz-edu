/**
 * @copyright 2017 @ ZiniMediaTeam
 * @author brianvo
 * @create 2017/10/23 01:05
 * @update 2017/10/23 01:05
 * @file api/models/Attendent.js
 * @description :: Attendent model.
 */

module.exports = {

  attributes: {
    dateOff: {
      type: 'json',     //EX: ["2019-03-27",...]  FORMAT: YYYY-MM-DD
    },
    type: {
      type: 'number',
      isIn: [sails.config.custom.TYPE.MULTI_DAY, sails.config.custom.TYPE.SINGLE_DAY],        //1: full       2: half 
      defaultsTo: sails.config.custom.TYPE.SINGLE_DAY
    },
    content: {
      type: 'string'
    },
    note: {
      type: 'string'
    },
    status: {                           //Integer {"TRASH":,"DRAFT":,"ACTIVE":, SCHEDULE:}
      type: 'number',
      isIn: [sails.config.custom.STATUS.TRASH, sails.config.custom.STATUS.DRAFT, sails.config.custom.STATUS.ACTIVE],
      defaultsTo: sails.config.custom.STATUS.DRAFT
    },
    student: {
      model: 'student'
    },
    class: { 
      model: 'class'
    },
    school: {
      model: 'school',
      required: true
    }
  }

};