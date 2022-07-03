/**
 * @copyright 2017 @ ZiniMediaTeam
 * @author brianvo
 * @create 2017/10/23 01:05
 * @update 2017/10/23 01:05
 * @file api/models/Class.js
 * @description :: Class model.
 */

module.exports = {

  attributes: {
    title: {
      type: 'string',
      required: true,
      maxLength: 120,
      description: 'Name of facalty or class which are enrolled',
      example: 'Software Engineering'
    },
    code: {
      type: 'string',
      required: true,
      unique: true,
      description: 'The code of class'
    },
    courseSession: {
      model: 'coursesession',
      required: true
    },
    status: { //Integer {"TRASH":,"DRAFT":,"ACTIVE":, SCHEDULE:}
      type: 'number',
      isIn: [sails.config.custom.STATUS.TRASH, sails.config.custom.STATUS.DRAFT, sails.config.custom.STATUS.ACTIVE],
      defaultsTo: sails.config.custom.STATUS.DRAFT
    },
    thumbnail: {
      type: 'number', //Array thumb class type (from 1-4: mầm, chồi, lá, mẫu giáo)
      defaultsTo: 1
    },
    totalStudent: {
      type: 'number',
      description: 'The number of students in each class',
      example: '60'
    },
	  teachers: {
      collection: 'user',
      via: 'classObj',
      through: 'teacher_class'
    },
    students: {
      collection: 'student',
      via: 'classObj',
      through: 'student_class'
    },
    // subject: {
    //   collection: 'subject',
    //   via: 'classObj',
    //   through: 'subject_class'
    // },
    formations: {
      collection: 'formation',
      via: 'classes'
    },
    school: {
      model: 'school',
      required: true
    }
  }
};