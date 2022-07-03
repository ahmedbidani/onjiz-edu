/**
 * @copyright 2020 @ ZiniMediaTeam
 * @author dao.nguyen
 * @create 2020/06/24 15:05
 * @update 2010/06/24 15:05
 * @file api/models/Formation.js
 * @description :: Formation model.
 */

module.exports = {

  attributes: {
    name: {
      type: 'string',
      required: true
    },
    description: {
      type: 'string',
    },
    status: { //Integer {"TRASH":-1,"DRAFT":0,"ACTIVE":1, SCHEDULE:2}
      type: 'number',
      isIn: [sails.config.custom.STATUS.TRASH, sails.config.custom.STATUS.DRAFT, sails.config.custom.STATUS.ACTIVE],
      defaultsTo: sails.config.custom.STATUS.DRAFT
    },
    classes: {
      collection: 'class',
      via: 'formations'
    },
    teachers: {
      collection: 'user',
      via: 'formations'
    },
    school: {
      model: 'school',
      required: true
    }
  }
};
