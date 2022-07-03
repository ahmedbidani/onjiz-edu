/**
 * @copyright 2018 @ ZiniMedia Ltd. Co
 * @author dungha
 * @create 2019/10/21 20:18
 * @update 2019/10/21 20:18
 * @file api/models/Auth.js
 */
'use strict';

module.exports = {
  attributes: {
    student: {
      model: 'student'
    },
    tuition: {
      model: 'tuition'
    },
    paid: {
      type: 'number',
      isIn: [sails.config.custom.TYPE.UNPAID, sails.config.custom.TYPE.PAIDED],
      defaultsTo: sails.config.custom.TYPE.UNPAID
    }
  }
};