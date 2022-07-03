/**
 * @copyright 2017 @ ZiniMediaTeam
 * @author brianvo
 * @create 2017/10/23 01:05
 * @update 2017/10/23 01:05
 * @file api/models/Comment.js
 * @description :: Comment model.
 */

module.exports = {

  attributes: {
    contentCmt: {
      type: 'string',
      required: true,
      maxLength: 200,
      example: 'Example is description'
    },

    stateCmt: {
      type: 'boolean',
      defaultsTo: true
    },
    status: {                           //Integer {"TRASH":-1,"DRAFT":0,"ACTIVE":1}
      type: 'number',
      isIn: [sails.config.custom.STATUS.TRASH, sails.config.custom.STATUS.DRAFT, sails.config.custom.STATUS.ACTIVE],
      defaultsTo: sails.config.custom.STATUS.DRAFT
    },

    authorCmt: {
      model: 'user'
    },
    school: {
      model: 'school',
      required: true
    }
  }
};

