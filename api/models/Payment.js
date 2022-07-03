/**
 * @copyright 2020 @ ZiniMediaTeam
 * @author dao.nguyen
 * @create 2020/01/08 17:05
 * @update 2020/01/08 17:05
 * @file api/models/Payment.js
 * @description :: Payment model.
 */

module.exports = {

  attributes: {
    feeInvoice: {
      model: 'feeinvoice',
      required: true
    },
    // paidAmount: {
    //   type: 'number',
    //   required: true
    // },
    paymentMethod: {
      type: 'number',
      isIn: [sails.config.custom.TYPE.CASH, sails.config.custom.TYPE.BANK, sails.config.custom.TYPE.STRIPE],
      defaultsTo: sails.config.custom.TYPE.CASH
    },
    paymentDate: {
      type: 'string',
      description: 'format YYYY-MM-DD'
    },
    note: {
      type: 'string'
    },
    parent: {
      model: 'parent',
      // required: true
    },
    school: {
      model: 'school',
      required: true
    }
  }
};
