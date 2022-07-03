/**
 * @copyright 2017 @ ZiniMediaTeam
 * @author brianvo
 * @create 2017/10/23 01:05
 * @update 2017/10/23 01:05
 * @file api/models/Subject.js
 * @description :: Subject model.
 */

module.exports = {

  attributes: {
    title: {
      type: 'string',
      required: true
    },
    description: {
      type: 'string',
    },
    nutrition: {
      type: 'string',
    },
    status: {
      type: 'number',
      isIn: [sails.config.custom.STATUS.TRASH, sails.config.custom.STATUS.DRAFT, sails.config.custom.STATUS.ACTIVE],
      defaultsTo: sails.config.custom.STATUS.DRAFT
    },
    thumbnail: {
      type: 'number', //Array thumb food type (from 1-9)
      defaultsTo: 1
    },
    school: {
      model: 'school',
      required: true
    }
  }
};
