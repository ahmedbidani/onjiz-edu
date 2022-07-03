/**
 * @copyright 2020 @ ZiniMediaTeam
 * @author dao.nguyen
 * @create 2020/01/08 17:05
 * @update 2010/01/08 17:05
 * @file api/models/FeeItem.js
 * @description :: FeeItem model.
 */

module.exports = {

  attributes: {
    title: {
      type: 'string',
      required: true
    },
    code: {
      type: 'string',
      required: true
    },
    description: {
      type: 'string',
    },
    amount: {
      type: 'number',
      required: true
    },
    school: {
      model: 'school',
      required: true
    }
  }
};
