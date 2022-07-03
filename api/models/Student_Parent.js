/**
 * @copyright 2018 @ ZiniMedia Ltd. Co
 * @author dungha
 * @create 2019/05/24
 * @update 2019/05/24
 * @file api/models/Auth.js
 */
'use strict';

module.exports = {
  attributes: {
    parent: {
      model: 'parent'
    },
    student: {
      model: 'student'
    },
    type: {
      type: 'number',
      isIn: [
        sails.config.custom.TYPE.MOTHER,
        sails.config.custom.TYPE.FATHER,
        sails.config.custom.TYPE.OTHERS
      ],
      defaultsTo: sails.config.custom.TYPE.OTHERS
    }
  }
};