/**
 * @copyright 2018 @ ZiniMedia Ltd. Co
 * @author dungha
 * @create 2019/05/28
 * @update 2019/05/28
 * @file api/models/Auth.js
 */
'use strict';

module.exports = {
  attributes: {
    title: {
      type: 'string',
      required: true
    },
    code: {
      type: 'string',
      required: true,
    },
    startTime: {
      type: 'string',
      required: true,
      description: 'Start time of course session',
      example: '2018-09-01'
    },
    endTime: {
      type: 'string',
      required: true,
      description: 'End time of course session',
      example: '2019-06-01'
    },
    status: { //Integer {"TRASH":-1,"DRAFT":0,"ACTIVE":1, SCHEDULE:2}
      type: 'number',
      isIn: [sails.config.custom.STATUS.TRASH, sails.config.custom.STATUS.DRAFT, sails.config.custom.STATUS.ACTIVE],
      defaultsTo: sails.config.custom.STATUS.DRAFT
    },
    branchOfSession: {
      model: 'branch',
      required: true
    },
    classes: {
      collection: 'class',
      via: 'courseSession'
    },
    school: {
      model: 'school',
      required: true
    }
  }
};
