/**
 * @copyright 2017 @ ZiniMediaTeam
 * @author dungha
 * @create 2019/05/22 01:05
 * @update 2019/05/22 01:05
 * @file api/models/Student.js
 * @description :: Student model.
 */

module.exports = {
  attributes: {
    //Student Information
    code: {
      type: 'string',
      required: true,
      unique: true
    },
    firstName: {
      type: 'string',
      required: true,
      description: 'The fist name',
      example: 'Thanh',
      maxLength: 255
    },
    lastName: {
      type: 'string',
      required: true,
      description: 'The last name',
      example: 'Vo Thien',
      maxLength: 255
    },
    // fullName: {
    //   type: 'string',
    //   required: true,
    //   description: 'The full name of the student',
    //   example: 'Nguyen Thanh Duy',
    //   maxLength: 120
    // },
    dateOfBirth: {
      type: 'string',
      required: true,
      description: 'BirthDay of the student',
      example: '1995-09-11'
    },
    gender: {
      type: 'number',
      isIn: [
        sails.config.custom.TYPE.FEMALE,
        sails.config.custom.TYPE.MALE
      ],
      defaultsTo: sails.config.custom.TYPE.MALE
    },
    //Address Detail
    currentAddress: {
      type: 'string',
      maxLength: 255,
      description: 'student current address',
      example: 'abc street, disctrict 5, HCM city'
    },
    height: {
      type: 'number',
      description: 'student height',
      example: '85.5'
    },
    weight: {
      type: 'number',
      description: 'student weight',
      example: '10'
    },
    bloodGroup: {
      type: 'string',
      description: 'Student blood group',
      example: 'AB, O, A'
    },
    allergy: {
      type: 'string',
      description: 'which food student can not eat',
      example: 'seafood, chicken'
    },
    heartRate: {
      type: 'string',
      description: 'Heart rate of student',
      example: 'normal, slow, fast'
    },
    eyes: {
      type: 'string',
      description: 'eyes of student',
      example: 'good, not good'
    },
    ears: {
      type: 'string',
      description: 'ears of student',
      example: 'good,not good'
    },
    notes: {
      type: 'string'
    },
    healthHistory: {
      type: 'json',
      defaultsTo: [],
      description: "[{ date: '', symptom: '', note: '' }]"
    },
    w_h_History: {
      type: 'json',
      defaultsTo: [],
      description: "[{ date: '0', height: 0, weight: 0 }]"
    },
    avatar: {
      // collection: 'media',
      // via: 'student'
      // model: 'media',
      // description: 'student photo'
      type: 'string',
      defaultsTo: ''
    },
    // Date of admission and interacting
    admissionDate: {
      type: 'string',
      // required: true,
      description: 'Date that student joined in',
      example: '2018-09-11'
    },
    classes: {
      collection: 'class',
      via: 'student',
      through: 'student_class'
    },
    medical: {
      collection: 'medical',
      via: 'student',
      through: 'student_medical'
    },
    parents: {
      collection: 'parent',
      via: 'student',
      through: 'student_parent'
    },
    tuition: {
      collection: 'tuition',
      via: 'student',
      through: 'tuition_student'
    },
    status: {
      //Integer {"TRASH":-1,"DRAFT":0,"ACTIVE":1}
      type: 'number',
      isIn: [
        sails.config.custom.STUDENT_STATUS.ACTIVE,
        //sails.config.custom.STUDENT_STATUS.LEAVE,
        sails.config.custom.STUDENT_STATUS.RESERVE,
        sails.config.custom.STUDENT_STATUS.DONE,
        sails.config.custom.STUDENT_STATUS.DRAFT,
        sails.config.custom.STUDENT_STATUS.INACTIVE,
        sails.config.custom.STUDENT_STATUS.TRASH
      ],
      defaultsTo: sails.config.custom.STATUS.DRAFT
    },
    // feeInvoices: {
    //   collection: 'feeinvoice',
    //   via: 'student',
    //   through: 'payment'
    // },
    school: {
      model: 'school',
      required: true
    }
  }
};
