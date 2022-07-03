/**
 * @copyright 2020 @ ZiniMediaTeam
 * @author dao.nguyen
 * @create 2020/01/08 17:05
 * @update 2020/01/08 17:05
 * @file api/models/FeeInvoice.js
 * @description :: FeeInvoice model.
 */

module.exports = {

  attributes: {
    title: {
      type: 'string',
      required: true
    },
    code: {
      type: 'string',
      required: true,
      unique: true
    },
    deadline: {
      type: 'string',
      description: 'format YYYY-MM-DD'
    },
    items: {
      type: 'json',
      description: 'List feeItem of feeInvoice',
      defaultsTo: [],
      //format [{feeItem: `id of feeItem obj`, itemTitle: 'save title in case of item is deleted', amountPerItem: `type number`, numberOfItems: `type number`}] (lưu amountPerItem vì tùy thời điểm, feeItem sẽ có giá khác nhau)
    },
    totalAmount: {
      type: 'number'
    },
    status: {
      type: 'number',
      isIn: [sails.config.custom.STATUS.INVOICE_DRAFT, sails.config.custom.STATUS.UNPAID, sails.config.custom.STATUS.PENDING, sails.config.custom.STATUS.IN_PROCESS, sails.config.custom.STATUS.PAID],
      defaultsTo: sails.config.custom.STATUS.INVOICE_DRAFT
    },
    paidAmount: {
      type: 'number',
      defaultsTo: 0
    },
    paymentMethod: {
      type: 'number',
      isIn: [sails.config.custom.TYPE.CASH, sails.config.custom.TYPE.BANK, sails.config.custom.TYPE.STRIPE],
      defaultsTo: sails.config.custom.TYPE.CASH
    },
    paymentCode: {
      type: 'string',
      description: 'code of payment'
    },
    paymentDate: {
      type: 'string',
      description: 'format YYYY-MM-DD'
    },
    student: {
      model: 'student',
      required: true
    },
    payments: {
      collection: 'payment',
      via: 'feeInvoice'
    },
    school: {
      model: 'school',
      required: true
    }
  }
};
