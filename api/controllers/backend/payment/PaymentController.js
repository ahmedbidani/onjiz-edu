/**
 * PaymentController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const ErrorMessages = require('../../../../config/errors');
const moment = require('moment');

module.exports = {
  // add: async (req, res) => {
  //   sails.log.info("================================ PaymentController.add => START ================================");
  //   // GET ALL PARAMS
  //   if (!req.me) {
  //     return res.badRequest(ErrorMessages.SYSTEM_SESSION_EXPIRED);
  //   }
  //   const params = req.allParams();
  //   // CHECK TITLE & CODE
  //   if (!params.feeInvoice) return res.badRequest(ErrorMessages.PAYMENT_FEE_INVOICE_REQUIRED);
  //   if (!params.paidAmount || isNaN(params.totalAmount)) return res.badRequest(ErrorMessages.PAYMENT_AMOUNT_REQUIRED);
  //   if (!params.method) return res.badRequest(ErrorMessages.PAYMENT_METHOD_REQUIRED);

  //   const newData = {
  //     feeInvoice: params.feeInvoice, // REQUIRED
  //     paidAmount: parseInt(params.paidAmount), // REQUIRED
  //     paymentMethod: parseInt(params.paymentMethod),
  //     paymentDate: moment().format('YYYY-MM-DD'), // REQUIRED
  //   };
    
  //   // ADD NEW DATA FEE_INVOICE
  //   let newPayment = await Payment.create(newData).fetch();

  //   // RETURN DATA FEE_INVOICE
  //   return res.json(newPayment);
  // },
};
