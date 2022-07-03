/**
 * @copyright 2020 @ ZiniMediaTeam
 * @author dao.nguyenquan
 * @file api/models/School.js
 * @description :: School model.
 */

module.exports = {
  attributes: {
    code: {
      type: "string",
      required: true,
      unique: true,
      description: "The code of school",
    },
    name: {
      type: "string",
      required: true,
      unique: true,
      description: "Name of the School that user enroled in",
      example: "University of Natural Science",
    },
    emailAddress: {
      type: "string",
      required: true,
      unique: true,
      isEmail: true,
      description: "Email address to login",
      example: "abc@gmail.com",
    },
    phone: {
      type: "string",
      required: true,
      unique: true,
      description: "The phone number to login or used for contact by School",
      example: "0123456789",
    },
    address: {
      type: "string",
      description: "The User address",
      example: "abc street, ward 5, Ho Chi Minh City",
    },
    description: {
      type: "string",
      description: "what the user expectation from School",
      example: "I wanna become a Software development",
    },
    server: {
      type: 'string',
      description: 'code of server which define at config/custom.js SERVER',
      defaultsTo: ''
    },
    status: {
      //Integer {"TRASH":-1,"DRAFT":0,"ACTIVE":1}
      type: "number",
      isIn: [
        sails.config.custom.STATUS.TRASH,
        sails.config.custom.STATUS.DRAFT,
        sails.config.custom.STATUS.ACTIVE,
      ],
      defaultsTo: sails.config.custom.STATUS.DRAFT,
    },
    // trialTime: {
    //   type: "string",
    //   columnType: "date",
    //   defaultsTo: "30",
    // },
    admin: {
      model: "user"
    },
    teachers: {
      collection: "user",
      via: "school",
      description: "The user who studyied at this school.",
    },
    photo: {
      type: "string",
      description: "school photo",
    },
    numberOfVAT: {
      type: "string",
      description: "The number of VAT",
    },
    website: {
      type: "string",
      description: "The website of school",
    },
    published: {
      type: "string",
      description: "The date publish school",
    },
    package: {
      type: 'string',
      isIn: ['trial', 'standard', 'advance'],
      defaultsTo: 'trial'
    },
    activeModules: {
      type: 'json',
      defaultsTo: {
        feeInvoice: false,
        attendance: true,
        statistics: true,
        messages: true,
        health: true
      }
    },
    foods: {
      collection: "food",
      via: "school",
    },
    schedules: {
      collection: "schedule",
      via: "school",
    },
    parents: {
      collection: "parent",
      via: "school",
    },
    students: {
      collection: "student",
      via: "school",
    },
    subjects: {
      collection: "subject",
      via: "school",
    },
    notifications: {
      collection: "notifications",
      via: "school",
    },
    agency: {
      model: 'agency'
    }
  },
};
