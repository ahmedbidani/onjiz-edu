/**
 * FeeInvoiceController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
*/
const NotificationService = require('../../services/NotificationService');
const FeeInvoiceService = require('../../services/FeeInvoiceService');
const ErrorMessage = require('../../../config/errors');
//Library
const moment = require('moment');
const STRIPE_API_KEY = sails.config.custom.STRIPE_API_KEY;
const stripe = require('stripe')(STRIPE_API_KEY);

module.exports = {
  add: async (req, res) => {
    sails.log.info("================================ MobilePaymentController.add => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();
    // CHECK TITLE & CODE
    if (!params.feeInvoiceId) return res.badRequest(ErrorMessage.PAYMENT_FEE_INVOICE_REQUIRED);
    if (!params.school) return res.badRequest(ErrorMessage.SCHOOL_ID_REQUIRED);
    // if (!params.amount || isNaN(params.amount)) return res.badRequest(ErrorMessage.PAYMENT_AMOUNT_REQUIRED);
    if (!params.method) return res.badRequest(ErrorMessage.PAYMENT_METHOD_REQUIRED);
    if (!params.parentId) return res.badRequest(ErrorMessage.PAYMENT_PARENT_REQUIRED);

    const newData = {
      feeInvoice: params.feeInvoiceId, // REQUIRED
      // paidAmount: parseFloat(params.amount), // REQUIRED
      paymentMethod: parseInt(params.method),
      paymentDate: moment().format('YYYY-MM-DD'), // REQUIRED
      note: params.note,
      parent: params.parentId,
      school: params.school
    };

    let newPayment = {};
    let status = 'fail';

    //STRIPE
    if (params.method == 2) {
      if (!params.token) return res.badRequest(ErrorMessage.PAYMENT_STRIPE_TOKEN_REQUIRED);

      let feeInvoiceObj = await FeeInvoiceService.get({ id: params.feeInvoiceId });
      if (!feeInvoiceObj) return res.badRequest(ErrorMessage.FEE_INVOICE_NOT_FOUND);


      //get default currency
      let webSettings = await Setting.findOne({ key: 'web', school: params.school });
      let defaultCurrency = {};
      if (webSettings && webSettings.value && webSettings.value.currency && webSettings.value.currency != '') {
        defaultCurrency = await Currency.findOne({ id: webSettings.value.currency });
        if (!defaultCurrency) return res.badRequest(ErrorMessage.DEFAULT_CURRENCY_NOT_FOUND);
      } else res.badRequest(ErrorMessage.DEFAULT_CURRENCY_NOT_EXISTED);

      const charge = await stripe.charges.create({
        amount: feeInvoiceObj.totalAmount,
        currency: defaultCurrency.code.toLowerCase(),
        description: 'Example charge',
        source: params.token,
        statement_descriptor: 'Custom descriptor',
      });

      if (charge && charge.status == 'succeeded') {
        newData.note = 'STRIPE_' + charge.id;
        status = 'succeeded';

        // ADD NEW DATA FEE_INVOICE
        newPayment = await Payment.create(newData).fetch();
        //PREPARE DATA FOR UPDATE
        let editedData = {
          status: sails.config.custom.STATUS.PAID,
          paidAmount: feeInvoiceObj.totalAmount,
          paymentMethod: 2,
          paymentCode: charge.id,
          paymentDate: moment().format('YYYY-MM-DD')
        }
        //SET STATUS OF FEEINVOICE TO PENDING
        await FeeInvoice.update({ id: params.feeInvoiceId }).set(editedData);

        //send notification to parent
        let studentName = '';
        if (feeInvoiceObj.student) {
          studentName = feeInvoiceObj.student.firstName + ' ' + feeInvoiceObj.student.lastName;
        }
        let dataNotification = {
          title:  sails.__('Fee Invoice %s of student %s is paid completely', studentName, feeInvoiceObj.title),
          message: sails.__('Thank you for your timely payment!'),
          status: sails.config.custom.STATUS.ACTIVE,
          type: sails.config.custom.TYPE.FEE_INVOICE,
          classList: [],
          school: params.school
        }

        //get list parent of student
        let allStudent_Parent = await Student_Parent.find({ student: feeInvoiceObj.student.id });
        let allParentId = allStudent_Parent.map(item => item.parent);
        
        //create notification and send push noti
        let notification = await NotificationService.add(dataNotification);
        await NotificationService.pushFirebase(notification, allParentId, []);
      }

    } else {

      // ADD NEW DATA FEE_INVOICE
      newPayment = await Payment.create(newData).fetch();
      status = 'succeeded';
  
      //SET STATUS OF FEEINVOICE TO PENDING
      await FeeInvoice.update({ id: params.feeInvoiceId }).set({ status: sails.config.custom.STATUS.PENDING });
    }
    
    // RETURN DATA FEE_INVOICE
    return res.json({ payment: newPayment, chargeStatus: status });

  },
};
