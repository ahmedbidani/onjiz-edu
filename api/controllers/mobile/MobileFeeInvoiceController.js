/**
 * FeeInvoiceController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
*/
const ErrorMessage = require('../../../config/errors');
const FeeInvoiceService = require('../../services/FeeInvoiceService');

module.exports = {

  listByStudent: async (req, res) => {
    // GET ALL PARAMS
    const params = req.allParams();
    if (!params.school) return res.badRequest(ErrorMessage.SCHOOL_ID_REQUIRED);
    if (!params.studentId) return res.badRequest(ErrorMessage.FEE_INVOICE_STUDENT_REQUIRED);
    let page = params.page ? params.page : 1;
    let limit = params.limit ? params.limit : 10;

    let feeInvoices = await FeeInvoiceService.find({ student: params.studentId }, limit, (page - 1) * limit);

    if (feeInvoices && feeInvoices.length > 0) {
      for (let i = 0; i < feeInvoices.length; i++){
        feeInvoices[i] = await FeeInvoiceService.currencyFormat(feeInvoices[i], params.school);
      }
    }

    // RETURN DATA NOTIFICATION
    return res.json(feeInvoices);
  },

  get: async (req, res) => {
    sails.log.info("================================ FeeInvoiceController.get => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();

    // CHECK ID PARAM
    if (!params.school) return res.badRequest(ErrorMessage.SCHOOL_ID_REQUIRED);
    if (!params.id) return res.badRequest(ErrorMessage.FEE_INVOICE_ID_REQUIRED);

    // QUERY & CHECK DATA FOOD
    let feeInvoices = await FeeInvoiceService.get({id: params.id});
    if (!feeInvoices) return res.notFound(ErrorMessage.FEE_INVOICE_NOT_FOUND);

    feeInvoices = await FeeInvoiceService.currencyFormat(feeInvoices, params.school);

    // RETURN DATA FOOD
    return res.json(feeInvoices);
  },
};
