/**
 * @copyright 2018 @ ZiniMedia Ltd. Co
 * @author thanhvo
 * @create 2019/10/21 20:18
 * @update 2019/10/21 20:18
 * @file api/models/Auth.js
 */
'use strict';

module.exports = {
  attributes: {
    teacher: {
      model: 'user'
    },
    parent: {
      model: 'parent'
    },
    classObj: {
      model: 'class'
    },
    type: {
      type: 'number',
      isIn: [sails.config.custom.TYPE.PRIVATE, sails.config.custom.TYPE.PUBLIC],
      defaultsTo: sails.config.custom.TYPE.PRIVATE
    },
    lastSeen: { // array obj { user: {model: 'user'}, lastSeen: Date.now() }
      type: 'json', //latest time to view message
      defaultsTo: []
    },
    school: {
      model: 'school',
      required: true
    }
  }
};
