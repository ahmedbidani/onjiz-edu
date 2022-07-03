/**
 * @copyright 2020 @ ZiniMediaTeam
 * @author dao.nguyen
 * @create 2020/02/07
 * @file api/models/Currency.js
 * @description :: Currency model.
 */

module.exports = {

  attributes: {
    code: {
      type: 'string',
      required: true
    },
    title: {
      type: 'string',
      required: true
    },
    symbolLeft: {
      type: 'string'
    },
    symbolRight: {
      type: 'string'
    },
    numberSeperatorSymbol: {
      type: 'string'
    },
    decimalPoint: {
      type: 'string'
    },
    decimalPlaces: {
      type: 'number'
    },
    status: {
      type: 'number',
      isIn: [sails.config.custom.STATUS.DRAFT, sails.config.custom.STATUS.ACTIVE],
      defaultsTo: sails.config.custom.STATUS.DRAFT
    }
  }
};
