/**
 * @copyright 2017 @ ZiniMediaTeam
 * @author brianvo
 * @create 2017/10/23 01:05
 * @update 2017/10/23 01:05
 * @file api/models/Parent.js
 * @description :: Parent model.
 */

module.exports = {
  attributes: {
    userName: {
      type: 'string',
      maxLength: 200,
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
    emailAddress: {
      type: 'string',
      isEmail: true, //Only manage controller logic
      maxLength: 200,
      example: 'brian.vo@zinimedia.com'
    },
    phone: {
      type: 'string',
      maxLength: 20
    },
    password: {
      type: 'string',
      required: true,
      description: 'Securely hashed representation of the user\'s login password.',
      protect: true,
      example: '2$28a8eabna301089103-13948134nad'
    },
    birthday: {
      type: 'string'
    },
    profession: {
      type: 'string',
      maxLength: 200,
      example: ''
    },
    currentAddress: {
      type: 'string',
      description: '',
      example: ''
    },
    permanentAddress: {
      type: 'string',
      description: '',
      example: ''
    },
    religion: {
      type: 'string',
      description: '',
      example: ''
    },
    note: {
      type: 'string',
      description: 'note what they want',
      example: 'need to upgrade quality of meal'
    },
    timeUpdate: {
      type: 'number',
      defaultsTo: Date.now()
    },
    // expoToken: {
    //   type: 'string'
    // },
    fcmTokeniOS: {
      type: 'json',
      defaultsTo: []
    },
    fcmTokenAndroid: {
      type: 'json',
      defaultsTo: []
    },
    activated: {
      type: 'boolean',
      defaultsTo: false
    },
    gender: {
      type: 'number',
      isIn: [
        sails.config.custom.TYPE.FEMALE,
        sails.config.custom.TYPE.MALE
      ],
      defaultsTo: sails.config.custom.TYPE.MALE
    },
    allowNotification: {
      type: 'boolean',
      defaultsTo: true
    },
    students: {
      collection: 'student',
      via: 'parent',
      through: 'student_parent'
    },
    status: {
      type: 'number',
      isIn: [
        sails.config.custom.STATUS.TRASH,
        sails.config.custom.STATUS.DRAFT,
        sails.config.custom.STATUS.ACTIVE
      ],
      defaultsTo: sails.config.custom.STATUS.DRAFT
    },
    message: {
      collection: 'message',
      via: 'parent'
    },
    avatar: {
      type: 'string',
      defaultsTo: ''
    },
    school: {
      model: 'school',
      required: true
    }
  }
};
