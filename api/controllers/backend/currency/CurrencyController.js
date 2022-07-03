/**
 * CurrencyController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const ErrorMessages = require('../../../../config/errors');
const CurrencyService = require('../../../services/CurrencyService');

module.exports = {
  add: async (req, res) => {
    sails.log.info("================================ CurrencyController.add => START ================================");
    // GET ALL PARAMS
    if (!req.me) {
      return res.badRequest(ErrorMessages.SYSTEM_SESSION_EXPIRED);
    }
    const params = req.allParams();
    // CHECK TITLE & CODE
    if (!params.title || !params.title.trim().length) return res.badRequest(ErrorMessages.CURRENCY_TITLE_REQUIRED);
    if (!params.code || !params.code.trim().length) return res.badRequest(ErrorMessages.CURRENCY_CODE_REQUIRED);
    
    //CHECK DUPLICATE CODE
    const checkCode = await Currency.findOne({ code: params.code });
    if (checkCode) return res.badRequest(ErrorMessages.CURRENCY_CODE_DUPLICATED);

    // PREPARE DATA CURRENCY
    const newData = {
      code: params.code, // REQUIRED
      title: params.title, // REQUIRED
      symbolLeft: params.symbolLeft,
      symbolRight: params.symbolRight,
      decimalPoint: params.decimalPoint,
      numberSeperatorSymbol: params.numberSeperatorSymbol,
      decimalPlaces: parseInt(params.decimalPlaces),
      status: params.status ? Number.parseInt(params.status) : sails.config.custom.STATUS.DRAFT
    };

    // ADD NEW DATA CURRENCY
    const newCurrency = await CurrencyService.add(newData);

    // RETURN DATA CURRENCY
    return res.ok(newCurrency);
  },

  get: async (req, res) => {
    sails.log.info("================================ CurrencyController.get => START ================================");
    if (!req.me) {
      return res.badRequest(ErrorMessages.SYSTEM_SESSION_EXPIRED);
    }
    // GET ALL PARAMS
    const params = req.allParams();
    if (!params.id) {
      return res.badRequest(ErrorMessages.CURRENCY_ID_REQUIRED);
    }
    // QUERY & CHECK DATA CURRENCY
    const currency = await CurrencyService.get({
      id: params.id
    });
    if (!currency) {
      return res.notFound(ErrorMessages.CURRENCY_NOT_FOUND);
    }
    // RETURN DATA CURRENCY
    return res.json(currency);
  },

  edit: async (req, res) => {
    sails.log.info("================================ CurrencyController.edit => START ================================");
    // GET ALL PARAMS
    if (!req.me) {
      return res.badRequest(ErrorMessages.SYSTEM_SESSION_EXPIRED);
    }
    const params = req.allParams();
    // CHECK TITLE & CODE
    if (!params.id) return res.badRequest(ErrorMessages.CURRENCY_ID_REQUIRED);
    if (!params.title || !params.title.trim().length) return res.badRequest(ErrorMessages.CURRENCY_TITLE_REQUIRED);
    if (!params.code || !params.code.trim().length) return res.badRequest(ErrorMessages.CURRENCY_CODE_REQUIRED);

    //CHECK DUPLICATE CODE
    const checkCode = await Currency.findOne({ id: { '!=': params.id }, code: params.code });
    if (checkCode) {
      return res.badRequest(ErrorMessages.CURRENCY_CODE_DUPLICATED);
    }

    // PREPARE DATA CURRENCY
    const editData = {
      code: params.code, // REQUIRED
      title: params.title, // REQUIRED
      symbolLeft: params.symbolLeft,
      symbolRight: params.symbolRight,
      decimalPoint: params.decimalPoint,
      numberSeperatorSymbol: params.numberSeperatorSymbol,
      decimalPlaces: parseInt(params.decimalPlaces),
      status: params.status ? Number.parseInt(params.status) : sails.config.custom.STATUS.DRAFT
    };

    // CHECK DATA CURRENCY
    const currency = CurrencyService.get({ id: params.id });
    if (!currency) {
      return res.notFound(ErrorMessages.CURRENCY_NOT_FOUND);
    }

    // UPDATE DATA CURRENCY
    const editObj = await CurrencyService.edit({ id: params.id }, editData);

    // RETURN DATA CURRENCY
    return res.json({
      status: 1,
      data: editObj
    });
  },

  trash: async (req, res) => {
    sails.log.info("================================ CurrencyController.trash => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();

    // CHECK IDS PARAM
    if (!params.ids || !params.ids.length) {
      return res.badRequest(ErrorMessages.CURRENCY_ID_REQUIRED);
    }
    let ids = params.ids;
    if (params.ids.indexOf(';') != -1) {
      ids = ids.split(';');
    }
    if (typeof (ids) == 'object') {
      for (var i = 0; i < ids.length; i++) {
        CurrencyService.del({ id: ids[i] });
      }
    } else {
      CurrencyService.del({ id: ids });
    }
    // RETURN DATA
    return res.json({ status: 1 });
  },

  search: async (req, res) => {
    sails.log.info("================================ CurrencyController.search => START ================================");
    if (!req.me) {
      return res.badRequest(ErrorMessages.SYSTEM_SESSION_EXPIRED);
    }

    let params = req.allParams();
    let keyword = params.search ? params.search.value : null;
    let draw = (params.draw) ? parseInt(params.draw) : 1;
    let limit = (params.length) ? parseInt(params.length) : null;
    let skip = (params.start) ? parseInt(params.start) : null; 

    //let sort = (params.sort) ? JSON.parse(params.sort) : null;
    // let sort = null;
    let newSort = { createdAt: -1 };
    if ( params.order ) {
      let objOrder = {};
      objOrder[params.columns[params.order[0].column].data] = params.order[0].dir ;
      // sort = [objOrder];
      for(var key in objOrder){
        if(objOrder[key] == 'desc'){
          //code here
          newSort[key] = -1; 
        } else {
          newSort[key] = 1;
        }
      }
    }
    // else {
    //   newSort = { createdAt: -1 };
    // }

    let where = {};
    if (typeof keyword === "string" && keyword.length > 0) {
      where = {
        $or: [
          { title: { $regex: keyword, $options: 'i' }},
          { code: { $regex: keyword, $options: 'i' }},
        ]
      } 
    }

    let mongo = require('mongodb');
    where.$and = [
      { status: params.status ? parseInt(params.status) : 1 }
    ];

    /**SEARCH CASE_INSENSITIVE */
    const collection = Currency.getDatastore().manager.collection(Currency.tableName);
    let result = [];
    if (params.length && params.start) {
      result = await collection.find(where).limit(limit).skip(skip).sort(newSort);
    } else {
      result = await collection.find(where).sort(newSort);
    }
    const totalCurrency = await collection.count(where);
    const dataWithObjectIds = await result.toArray();
    const arrObjCurrencys = JSON.parse(JSON.stringify(dataWithObjectIds).replace(/"_id"/g, '"id"'));

    let resCurrencys = [];
    for (let currency of arrObjCurrencys) {
      let tmpData = {};
      tmpData.id = '<input class="js-checkbox-item" type="checkbox" value="' + currency.id + '">';
      tmpData.code = currency.code;
      tmpData.title = currency.title;
      tmpData.tool = await sails.helpers.renderRowAction(currency, true,true, true);
      if (currency.description && currency.description.trim().length > 0) {
        tmpData.description = currency.description;
      } else {
        tmpData.description = '-';
      }
     
      tmpData.status = '';
      
      if (currency.status == 1) {
        tmpData.status = `
          <label class="switch">
            <input class="switchStatus" type="checkbox" data-id="${currency.id}" checked>
            <span class="slider"></span>
          </label>`;
      } else {
        tmpData.status = `
        <label class="switch">
          <input class="switchStatus" type="checkbox" data-id="${currency.id}">
          <span class="slider"></span>
        </label>`;
      }

      resCurrencys.push(tmpData);
    };
    // let totalCurrency = await CurrencyService.count(where);
    return res.ok({ draw: draw, recordsTotal: totalCurrency, recordsFiltered: totalCurrency, data: resCurrencys });
  },
  
  switchStatus: async (req, res) => {
    sails.log.info("================================ CurrencyController.switchStatus => START ================================");
    // // GET ALL PARAMS
    const params = req.allParams();
    if (!params.id) return res.badRequest(ErrorMessages.CURRENCY_ID_REQUIRED);

    //GET DEFAULT CURRENCY
    let webSettings = await Setting.findOne({ key: 'web', school: req.me.school });
    if (webSettings && webSettings.value && webSettings.value.currency == params.id) {
      return res.badRequest(ErrorMessages.DEFAULT_CURRENCY_NOT_ALLOW);
    }

    //CHECK OBJ IS EXISTED?
    let currencyObj = await CurrencyService.get({ id: params.id });
    if (!currencyObj) return res.badRequest(ErrorMessages.CURRENCY_NOT_FOUND);

    //switch status of current obj
    if (currencyObj.status == 1) currencyObj = await CurrencyService.edit({ id: params.id }, { status: 0 });
    else currencyObj = await CurrencyService.edit({ id: params.id }, { status: 1 });

    return res.json(currencyObj);
    // END UPDATE
  },
};
