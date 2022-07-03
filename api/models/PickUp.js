/**
 * @copyright 2019 @ ZiniMedia Ltd. Co
 * @author dungha
 * @create 2019/06/20
 * @file api/models/PickUp.js
 */
'use strict';

module.exports = {
  attributes: {
    student: {
      model: 'student',
      required: true
    },
    date: {
      type: 'string',
      required: true,
      description: 'Date pickup'
    },
    time: {
      type: 'string',
      description: 'Time pickup'
    },
    parent: {
      model: 'parent'
    },
    note: {
      type: 'string'
    },
    classObj: {
      model: 'class',
      required: true
    },
    school: {
      model: 'school',
      required: true
    }
  }
};
