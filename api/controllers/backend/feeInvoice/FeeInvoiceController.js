/**
 * FeeInvoiceController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const ErrorMessages = require('../../../../config/errors');
const FeeInvoiceService = require('../../../services/FeeInvoiceService');
const NotificationService = require('../../../services/NotificationService');
const moment = require('moment');

module.exports = {
  add: async (req, res) => {
    sails.log.info("================================ FeeInvoiceController.add => START ================================");
    // GET ALL PARAMS
    if (!req.me) {
      return res.badRequest(ErrorMessages.SYSTEM_SESSION_EXPIRED);
    }
    const params = req.allParams();
    // CHECK TITLE & CODE
    if (!params.title || !params.title.trim().length) return res.badRequest(ErrorMessages.FEE_INVOICE_TITLE_REQUIRED);
    if (!params.deadline || !params.deadline.trim().length) return res.badRequest(ErrorMessages.FEE_INVOICE_DEADLINE_REQUIRED);
    // if (!params.totalAmount || isNaN(params.totalAmount)) return res.badRequest(ErrorMessages.FEE_INVOICE_TOTAL_AMOUNT_REQUIRED);
    if (!params.items || params.items.length == 0) return res.badRequest(ErrorMessages.FEE_INVOICE_ITEMS_REQUIRED);
    if (!params.students || params.students.length == '') return res.badRequest(ErrorMessages.FEE_INVOICE_STUDENTS_REQUIRED);

    //
    let webSettings = await Setting.findOne({ key: 'web', school: req.me.school });
    let dateFormat = webSettings && webSettings.value && webSettings.value.dateFormat ? webSettings.value.dateFormat : 'DD/MM/YYYY';
    let deadline = moment(params.deadline, dateFormat).format('YYYY-MM-DD');

    let items = [];
    let totalAmount = 0;
    for (let item of params.items) {
      let _item = {};
      let feeItemObj = await FeeItem.findOne({ id: item.feeItem });
      if (feeItemObj) {
        _item.feeItem = item.feeItem;
        _item.itemTitle = feeItemObj.title;
        _item.numberOfItems = parseFloat(item.numberOfItemsValue);
        _item.amountPerItem = feeItemObj.amount;
        _item.totalPerItem = feeItemObj.amount * _item.numberOfItems;
        totalAmount += _item.totalPerItem;
        items.push(_item);
      }
    }

    let listFeeInvoices = [];
    let studentIds = params.students.split(';');
    for (let studentId of studentIds) {

      let studentObj = await Student.findOne({ id: studentId });
      if (studentObj) {

        let code = await FeeInvoiceService.generateUniqueCode(12);

        // PREPARE DATA FEE_INVOICE
        const newData = {
          title: params.title, // REQUIRED
          code: code, // REQUIRED
          deadline: deadline, // REQUIRED
          items: items, // REQUIRED
          totalAmount: totalAmount,
          student: studentId,
          school: req.me.school
        };

        // ADD NEW DATA FEE_INVOICE
        let newFeeInvoice = await FeeInvoiceService.add(newData);
        listFeeInvoices.push(newFeeInvoice.id);
      }
    }

    // RETURN DATA FEE_INVOICE
    return res.json(listFeeInvoices);
  },

  get: async (req, res) => {
    sails.log.info("================================ FeeInvoiceController.get => START ================================");
    if (!req.me) {
      return res.badRequest(ErrorMessages.SYSTEM_SESSION_EXPIRED);
    }
    // GET ALL PARAMS
    const params = req.allParams();
    if (!params.id) {
      return res.badRequest(ErrorMessages.FEE_INVOICE_ID_REQUIRED);
    }
    // QUERY & CHECK DATA FEE_INVOICE
    const feeInvoice = await FeeInvoiceService.get({
      id: params.id
    });
    if (!feeInvoice) {
      return res.notFound(ErrorMessages.FEE_INVOICE_NOT_FOUND);
    }

    let feeItems = await FeeItem.find({ school: req.me.school });
    // RETURN DATA FEE_INVOICE
    return res.json({ feeInvoice: feeInvoice, listFeeItems: feeItems });
  },

  edit: async (req, res) => {
    sails.log.info("================================ FeeInvoiceController.edit => START ================================");
    // GET ALL PARAMS
    if (!req.me) {
      return res.badRequest(ErrorMessages.SYSTEM_SESSION_EXPIRED);
    }
    const params = req.allParams();
    // CHECK PARAMS
    if (!params.id) return res.badRequest(ErrorMessages.FEE_INVOICE_ID_REQUIRED);
    // if (!params.totalAmount || isNaN(params.totalAmount)) return res.badRequest(ErrorMessages.FEE_INVOICE_TOTAL_AMOUNT_REQUIRED);
    if (!params.items || params.items.length == 0) return res.badRequest(ErrorMessages.FEE_INVOICE_ITEMS_REQUIRED);

    // CHECK DATA FEE_INVOICE
    const feeInvoice = await FeeInvoiceService.get({ id: params.id });
    if (!feeInvoice) {
      return res.notFound(ErrorMessages.FEE_INVOICE_NOT_FOUND);
    }

    let items = [];
    let totalAmount = 0;
    for (let item of params.items) {
      let _item = {};
      let feeItemObj = await FeeItem.findOne({ id: item.feeItem });
      if (feeItemObj) {
        _item.feeItem = item.feeItem;
        _item.itemTitle = feeItemObj.title;
        _item.numberOfItems = parseFloat(item.numberOfItemsValue);
        _item.amountPerItem = feeItemObj.amount;
        _item.totalPerItem = feeItemObj.amount * _item.numberOfItems;
        totalAmount += _item.totalPerItem;
        items.push(_item);
      }
    }


    // PREPARE DATA FEE_INVOICE
    const editData = {
      totalAmount: totalAmount,
      items: items,
    };

    // UPDATE DATA FEE_INVOICE
    const editObj = await FeeInvoiceService.edit({ id: params.id }, editData);

    // RETURN DATA FEE_INVOICE
    return res.json(editObj[0]);
  },

  public: async (req, res) => {
    sails.log.info("================================ FeeInvoiceController.public => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();

    // CHECK IDS PARAM
    if (!params.ids || !params.ids.length) {
      return res.badRequest(ErrorMessages.FEE_INVOICE_ID_REQUIRED);
    }

    //get DateFormat
    let webSettings = await Setting.findOne({ key: 'web', school: req.me.school });
    let dateFormat = webSettings && webSettings.value && webSettings.value.dateFormat ? webSettings.value.dateFormat : 'DD/MM/YYYY';

    let ids = params.ids;
    if (params.ids.indexOf(',') != -1) {
      ids = ids.split(',');
    }
    if (typeof (ids) == 'object') {
      await FeeInvoice.update({ id: { in: ids } }).set({ status: sails.config.custom.STATUS.UNPAID });

      for (let i = 0; i < ids.length; i++) {
        let obj = await FeeInvoiceService.get({ id: ids[i] });
        let studentName = '';
        if (obj.student) {
          let _tmpFullname = await sails.helpers.formatFullname(obj.student.firstName, obj.student.lastName, webSettings.value.displayName);
          studentName = _tmpFullname;
        }

        //get list parent of student
        let allStudent_Parent = await Student_Parent.find({ student: obj.student.id });
        let parentIds = allStudent_Parent.map(item => item.parent);

        //create notification and send push noti
        let dataNotification = {
          title: sails.__('New Fee Invoice - %s (%s)', obj.title, studentName),
          message: sails.__('Fee Invoice %s of student %s is published, please pay the invoice before %s', obj.title, studentName, moment(obj.deadline).format(dateFormat)),
          status: sails.config.custom.STATUS.ACTIVE,
          type: sails.config.custom.TYPE.FEE_INVOICE,
          classList: [],
          school: req.me.school
        }
        let notification = await NotificationService.add(dataNotification);
        await NotificationService.pushFirebase(notification, parentIds, []);
      }

    } else {
      await FeeInvoice.update({ id: ids }).set({ status: sails.config.custom.STATUS.UNPAID });

      let feeInvoiceObj = await FeeInvoiceService.get({ id: ids });
      let deadline = moment(feeInvoiceObj.deadline).format(dateFormat);
      let studentName = '';
      if (feeInvoiceObj.student) {
        let _tmpFullname = await sails.helpers.formatFullname(feeInvoiceObj.student.firstName, feeInvoiceObj.student.lastName, webSettings.value.displayName);
        studentName = _tmpFullname;
      }

      let dataNotification = {
        title: sails.__('New Fee Invoice - %s (%s)', feeInvoiceObj.title, studentName),
        message: sails.__('Fee Invoice %s of student %s is published, please pay the invoice before %s', feeInvoiceObj.title, studentName, deadline),
        status: sails.config.custom.STATUS.ACTIVE,
        type: sails.config.custom.TYPE.FEE_INVOICE,
        classList: [],
        school: req.me.school
      }

      //get list parent of student
      let allStudent_Parent = await Student_Parent.find({ student: feeInvoiceObj.student.id });
      let allParentId = allStudent_Parent.map(item => item.parent);

      //create notification and send push noti
      let notification = await NotificationService.add(dataNotification);
      await NotificationService.pushFirebase(notification, allParentId, []);
    }
    // RETURN DATA
    return res.ok({ message: 'ok' });
  },

  delete: async (req, res) => {
    sails.log.info("================================ FeeInvoiceController.delete => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();

    // CHECK IDS PARAM
    if (!params.ids || !params.ids.length) {
      return res.badRequest(ErrorMessages.FEE_INVOICE_ID_REQUIRED);
    }
    let ids = params.ids;
    if (params.ids.indexOf(';') != -1) {
      ids = ids.split(';');
    }
    if (typeof (ids) == 'object') {
      for (var i = 0; i < ids.length; i++) {
        let feeInvoice = await FeeInvoiceService.get({ id: ids[i] });
        if (feeInvoice) FeeInvoiceService.del({ id: ids[i] });
      }

    } else {
      let feeInvoice = await FeeInvoiceService.get({ id: ids });
      if (feeInvoice) FeeInvoiceService.del({ id: ids });

    }
    // RETURN DATA
    return res.ok({ message: 'ok' });
  },

  takePayment: async (req, res) => {
    sails.log.info("================================ FeeInvoiceController.takePayment => START ================================");
    // GET ALL PARAMS
    if (!req.me) {
      return res.badRequest(ErrorMessages.SYSTEM_SESSION_EXPIRED);
    }
    const params = req.allParams();
    // CHECK PARAMS
    if (!params.id) return res.badRequest(ErrorMessages.FEE_INVOICE_ID_REQUIRED);
    if (!params.paymentMethod || isNaN(params.paymentMethod)) return res.badRequest(ErrorMessages.FEE_INVOICE_PAYMENT_METHOD_REQUIRED);
    if (!params.paymentCode) return res.badRequest(ErrorMessages.FEE_INVOICE_PAYMENT_CODE_REQUIRED);
    if (!params.paymentDate) return res.badRequest(ErrorMessages.FEE_INVOICE_PAYMENT_DATE_REQUIRED);
    if (!params.paidAmount || isNaN(params.paidAmount)) return res.badRequest(ErrorMessages.FEE_INVOICE_PAYMENT_METHOD_REQUIRED);

    // VALIDATE DATE
    let webSettings = await Setting.findOne({ key: 'web', school: req.me.school });
    let dateFormat = webSettings && webSettings.value && webSettings.value.dateFormat ? webSettings.value.dateFormat : 'DD/MM/YYYY';
    let paymentDate = '';
    let date = moment(params.paymentDate, dateFormat).format("YYYY-MM-DD");
    if (date == 'Invalid date') {
      return res.badRequest(ErrorMessages.FEE_INVOICE_PAYMENT_DATE_INVALID)
    } else {
      paymentDate = date;
    }


    // CHECK DATA FEE_INVOICE
    const feeInvoice = await FeeInvoiceService.get({ id: params.id });
    if (!feeInvoice) {
      return res.notFound(ErrorMessages.FEE_INVOICE_NOT_FOUND);
    }

    if (parseFloat(params.paidAmount) > feeInvoice.totalAmount) return res.badRequest(ErrorMessages.FEE_INVOICE_PAID_AMOUNT_INVALID);


    // PREPARE DATA FEE_INVOICE
    const editData = {
      paymentMethod: parseInt(params.paymentMethod),
      paidAmount: parseFloat(params.paidAmount),
      paymentCode: params.paymentCode,
      paymentDate: paymentDate,
      status: sails.config.custom.STATUS.IN_PROCESS
    };

    //If paidAmount = totalAmount
    if (parseFloat(params.paidAmount) == feeInvoice.totalAmount) {
      //change status to PAID
      editData.status = sails.config.custom.STATUS.PAID;

      //send notification to parent
      let studentName = '';
      if (feeInvoice.student) {
        let _tmpFullname = await sails.helpers.formatFullname(feeInvoice.student.firstName, feeInvoice.student.lastName, webSettings.value.displayName);
        studentName = _tmpFullname;
      }
      let dataNotification = {
        title: sails.__('Fee Invoice %s of student %s is paid completely', studentName, feeInvoice.title),
        message: sails.__('Thank you for your timely payment!'),
        status: sails.config.custom.STATUS.ACTIVE,
        type: sails.config.custom.TYPE.FEE_INVOICE,
        classList: [],
        school: req.me.school
      }

      //get list parent of student
      let allStudent_Parent = await Student_Parent.find({ student: feeInvoice.student.id });
      let allParentId = allStudent_Parent.map(item => item.parent);

      //create notification and send push noti
      let notification = await NotificationService.add(dataNotification);
      await NotificationService.pushFirebase(notification, allParentId, []);

    }

    // UPDATE DATA FEE_INVOICE
    const editObj = await FeeInvoiceService.edit({ id: params.id }, editData);

    // RETURN DATA FEE_INVOICE
    return res.json(editObj[0]);
  },

  search: async (req, res) => {
    sails.log.info("================================ FeeInvoiceController.search => START ================================");
    if (!req.me) {
      return res.badRequest(ErrorMessages.SYSTEM_SESSION_EXPIRED);
    }

    let params = req.allParams();
    let draw = (params.draw) ? parseInt(params.draw) : 1;
    let limit = (params.length) ? parseInt(params.length) : null;
    let skip = (params.start) ? parseInt(params.start) : null;


    //check role of current logged in user
    let schoolObj = await School.findOne({ id: req.me.school });
    let isMainSchoolAdmin = 3 == req.me.userType ? true : false;
    let isHavePermissionEdit = false;
    let isHavePermissionDelete = false;
    if (!isMainSchoolAdmin && req.me.role && req.me.role.permissions && req.me.role.permissions.album) {
      isHavePermissionEdit = req.me.role.permissions.album.edit ? true : false;
      isHavePermissionDelete = req.me.role.permissions.album.delete ? true : false;
    }

    let newSort = {};
    if (params.order) {
      let objOrder = {};
      objOrder[params.columns[params.order[0].column].data] = params.order[0].dir;
      // sort = [objOrder];
      for (var key in objOrder) {
        if (objOrder[key] == 'desc') {
          //code here
          newSort[key] = -1;
        } else {
          newSort[key] = 1;
        }
      }
    } else {
      newSort = { createdAt: -1 };
    }

    let where = {};

    let mongo = require('mongodb');

    let condition = [
      { school: new mongo.ObjectID(req.me.school) }
    ];
    if (params.ids != '') {
      let _ids = params.ids.split(',').map((invoiceId) => {
        return new mongo.ObjectID(invoiceId);
      })
      // where.$and = [
      //   { _id: { $in: _ids }  }
      // ];
      condition.push({ _id: { $in: _ids } });
    }

    if (params.studentId != '') {
      let id = new mongo.ObjectID(params.studentId);
      condition.push(
        { student: id }
      );
    } else if (params.studentId == '') {
      if (params.classId != '' && params.classId != '-1') {  //get by 1 class
        //get students form class
        let clsObj = await Class.findOne({ id: params.classId }).populate('students');
        let studentIds = clsObj.students.map((std) => {
          return new mongo.ObjectID(std.id);
        })

        condition.push(
          { student: { $in: studentIds } }
        );
      } else if (params.classId == '-1') { //get all class
        let classes = await Class.find({ school: req.me.school }).populate('students');
        let studentIds = [];
        for (let classObj of classes) {
          let ids = classObj.students.map((std) => {
            return new mongo.ObjectID(std.id);
          })
          studentIds = [...studentIds, ...ids];
        }
        condition.push(
          { student: { $in: studentIds } }
        );
      }

      else if (params.classId == '' && params.studentId == '') {  //get all student
        let classes = await Class.find({ school: req.me.school }).populate('students');
        let studentIds = [];
        for (let classObj of classes) {
          let ids = classObj.students.map((std) => {
            return new mongo.ObjectID(std.id);
          })
          studentIds = [...studentIds, ...ids];
        }
        condition.push(
          { student: { $in: studentIds } }
        );
      }
    }

    if (condition.length > 0) where.$and = condition;

    /**SEARCH CASE_INSENSITIVE */
    const collection = FeeInvoice.getDatastore().manager.collection(FeeInvoice.tableName);
    let result = [];
    if (params.length && params.start) {
      if (limit == -1) {
        result = await collection.find(where).skip(skip).sort(newSort);
      } else {
        result = await collection.find(where).limit(limit).skip(skip).sort(newSort);
      }
    } else {
      result = await collection.find(where).sort(newSort);
    }
    // let result = await collection.find(where).sort(newSort);
    const totalFeeInvoice = await collection.count(where);
    const dataWithObjectIds = await result.toArray();
    const arrObjFeeInvoices = JSON.parse(JSON.stringify(dataWithObjectIds).replace(/"_id"/g, '"id"'));

    //get DateFormat
    let webSettings = await Setting.findOne({ key: 'web', school: req.me.school });
    let dateFormat = webSettings && webSettings.value && webSettings.value.dateFormat ? webSettings.value.dateFormat : 'DD/MM/YYYY';

    //get currency format
    let currency = {
      numberSeperatorSymbol: '.',
      decimalPoint: ',',
      decimalPlaces: 0,
      symbolLeft: '',
      symbolRight: '',
    }
    if (webSettings && webSettings.value && webSettings.value.currency) {
      let currencyObj = await Currency.findOne({ id: webSettings.value.currency });
      if (currencyObj) {
        currency.numberSeperatorSymbol = currencyObj.numberSeperatorSymbol,
          currency.decimalPoint = currencyObj.decimalPoint,
          currency.decimalPlaces = currencyObj.decimalPlaces,
          currency.symbolLeft = currencyObj.symbolLeft,
          currency.symbolRight = currencyObj.symbolRight
      }
    }

    let resFeeInvoices = [];
    for (let feeInvoice of arrObjFeeInvoices) {
      let feeInvoiceObj = await FeeInvoice.findOne({ id: feeInvoice.id }).populate('student');
      let feeInvoiceObj2 = await FeeInvoice.find({ school: req.me.school }).populate('student');
      let tmpData = {};
      // tmpData.id = '<input class="js-checkbox-item" type="checkbox" value="' + feeInvoice.id + '">';
      tmpData.code = feeInvoice.code;
      tmpData.title = feeInvoice.title;

      let _tmpFullname;
      // classes = await Class.find({ school: req.me.school }).populate('students');
      // if (classes || params.classId) {
        _tmpFullname = await sails.helpers.formatFullname(feeInvoiceObj.student.firstName, feeInvoiceObj.student.lastName, webSettings.value.displayName);
        tmpData.fullName = feeInvoiceObj.student ? _tmpFullname : '-';
      // }

      tmpData.dateOfBirth = feeInvoiceObj.student && feeInvoiceObj.student.dateOfBirth ? moment(feeInvoiceObj.student.dateOfBirth).format(dateFormat) : '-';
      tmpData.gender = feeInvoiceObj.student ? feeInvoiceObj.student.gender == 1 ? sails.__('Male') : sails.__('Female') : '-';
      let studentObj = feeInvoiceObj.student ? await Student.findOne({ id: feeInvoiceObj.student.id }).populate('classes') : null;
      classes = studentObj ? studentObj.classes.map((item) => item.title) : [];
      tmpData.class = classes.length == 0 ? '-' : classes.join(',');
      tmpData.title = feeInvoice.title;
      let formattedCurrency = await sails.helpers.currencyFormat(feeInvoice.totalAmount, currency);
      tmpData.totalAmount = formattedCurrency;
      tmpData.method = feeInvoice.status != 1 ? '-' : feeInvoice.paymentMethod == 0 ? sails.__('Cash') : feeInvoice.paymentMethod == 2 ? sails.__('Stripe') : sails.__('Bank');
      tmpData.status = feeInvoice.status == 0 ? sails.__('Pending') : feeInvoice.status == 1 ? sails.__('Paid') : feeInvoice.status == 2 ? sails.__('In Process') : sails.__('Unpaid');
      tmpData.tool = await sails.helpers.renderRowAction(feeInvoice);

      tmpData.action =
        `<div class="btn-group-action">
          <div class="btn-group pull-right">`;
      if (isMainSchoolAdmin || isHavePermissionEdit || isHavePermissionDelete) {
        tmpData.action +=
          `<button class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="true">
            <i class="icon-caret-down"></i>
          </button>
          <ul class="dropdown-menu" x-placement="bottom-start" style="position: absolute; transform: translate3d(-69px, 36px, 0px); top: 0px; left: 0px; will-change: transform;">`;
        if (isMainSchoolAdmin || isHavePermissionEdit) {
          tmpData.action +=
            `<li>
              <a data-toggle="modal" data-target="#modal-take-payment" data-id="${feeInvoice.id}" class="edit btn btn-default take-payment-row">
                <i class="mdi mdi-credit-card"></i>`+ sails.__('Take Payment') + `
              </a>
            </li>`;
        }
        if ((isMainSchoolAdmin || isHavePermissionDelete) && feeInvoice.status != 1) {
          tmpData.action +=
            `<li>
              <a data-id="${feeInvoice.id}" class="edit btn btn-default remove-row">
                <i class="mdi mdi-delete"></i>`+ sails.__('Delete') + `
              </a>
            </li>`
        }
        tmpData.action +=
          `</ul>`
      }
      tmpData.action +=
        `</div>
        </div>`;
      //   <li>
      //   <a data-toggle="modal" data-target="#modal-view-invoice" data-id="${feeInvoice.id}" class="edit btn btn-default view-invoice-row">
      //     <i class="mdi mdi-eye"></i>`+sails.__('View Invoice')+`
      //   </a>
      // </li>
      if (feeInvoice.description && feeInvoice.description.trim().length > 0) {
        tmpData.description = feeInvoice.description;
      } else {
        tmpData.description = '-';
      }

      resFeeInvoices.push(tmpData);
    };
    return res.ok({ draw: draw, recordsTotal: totalFeeInvoice, recordsFiltered: totalFeeInvoice, data: resFeeInvoices });
  },

  searchStudent: async (req, res) => {
    sails.log.info("================================ FeeInvoiceController.searchStudent => START ================================");
    let params = req.allParams();
    let webSettings = res.locals.webSettings;
    let dateFormat = webSettings.value.dateFormat;
    let draw = (params.draw) ? parseInt(params.draw) : 1;
    let limit = (params.length) && params.length != '-1' ? parseInt(params.length) : 5;
    let skip = (params.start) ? parseInt(params.start) : 0;
    let newSort = {};
    if (params.order) {
      //prepared order param
      let objOrder = {};
      objOrder[params.columns[params.order[0].column].data] = params.order[0].dir;

      //get new sort for find insensitive case
      for (var key in objOrder) {
        if (objOrder[key] == 'desc') {
          //code here
          newSort[key] = -1;
        } else {
          newSort[key] = 1;
        }
      }
    }

    let where = {};

    let mongo = require('mongodb');

    if (params.studentId != '') {
      let id = new mongo.ObjectID(params.studentId);
      where.$and = [
        { _id: id },
        { school: new mongo.ObjectID(req.me.school) }
      ];
    } else {

      if (params.classId != '' && params.classId != '-1') { // get 1 class
        //get students from class
        let clsObj = await Class.findOne({ id: params.classId }).populate('students');
        let studentIds = clsObj.students.map((std) => {
          return new mongo.ObjectID(std.id);
        })

        where.$and = [
          { status: params.status ? parseInt(params.status) : 1 },
          { _id: { $in: studentIds } },
          { school: new mongo.ObjectID(req.me.school) }
        ];
      } else { //get all class
        //get students who join in specific class
        let student_classObj = await Student_Class.find({});
        let studentIds = student_classObj.map((obj) => {
          return new mongo.ObjectID(obj.student);
        })

        where.$and = [
          { status: params.status ? parseInt(params.status) : 1 },
          { _id: { $in: studentIds } },
          { school: new mongo.ObjectID(req.me.school) }
        ];
      }
    }

    /**SEARCH CASE_INSENSITIVE */
    const collection = Student.getDatastore().manager.collection(Student.tableName);
    let result = await collection.find(where).limit(limit).skip(skip).sort(newSort);
    const totalStudent = await collection.count(where);
    const dataWithObjectIds = await result.toArray();
    const arrStudent = JSON.parse(JSON.stringify(dataWithObjectIds).replace(/"_id"/g, '"id"'));


    // handler to render datatable
    let resStudents = [];
    for (let studentObj of arrStudent) {
      let student = await StudentService.get({ id: studentObj.id });
      let tmpData = {};
      // ID
      tmpData.id = '<input class="js-checkbox-item" type="checkbox" value="' + student.id + '">';
      tmpData._id = student.id;
      // CODE STUDENT
      tmpData.code = student.code;
      //FULL NAME
      let _tmpFullname = await sails.helpers.formatFullname(student.firstName, student.lastName, webSettings.value.displayName);
      tmpData.fullName = _tmpFullname;
      // BIRTHDAY
      tmpData.dateOfBirth = moment(student.dateOfBirth, "YYYY-MM-DD").format(dateFormat);
      // GENDER
      tmpData.gender = student.gender == 1 ? sails.__('Male') : sails.__('Female');
      resStudents.push(tmpData);
    };
    const allStudents = sails.__('All Student');

    // let totalStudent = await StudentService.count(where);
    return res.ok({ draw: draw, recordsTotal: totalStudent, recordsFiltered: totalStudent, data: resStudents, allStudents: allStudents});
  }
};
