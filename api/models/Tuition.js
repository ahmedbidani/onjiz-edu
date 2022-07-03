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
    title: {
      type: 'string',
      required: true
    },
    slotItems: {
      type: 'json',
      description: 'List item Tuition',
      defaultsTo: [{ "title": "Phí quản lý", "price": 0 }]
    },
    totalCost: {
      type: 'number',
      defaultsTo: 0
    },
    // classes: {
    //   collection: 'class',
    //   via: 'tuition',
    //   through: 'tuition_class'
    // },
    student: {
      collection: 'student',
      via: 'tuition',
      through: 'tuition_student'
    },
    deadline: {
      type: 'string',
      required: true
    },
    createdBy: {
      model: 'user'
    },
    courseSession: {
      model: 'coursesession',
      required: true
    },
    status: {
      type: 'number',
      isIn: [
        sails.config.custom.STATUS.TRASH,
        sails.config.custom.STATUS.DRAFT,
        sails.config.custom.STATUS.ACTIVE
      ],
      defaultsTo: sails.config.custom.STATUS.ACTIVE
    },
  }
};