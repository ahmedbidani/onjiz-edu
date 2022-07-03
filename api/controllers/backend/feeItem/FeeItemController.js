/**
 * FeeItemController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const ErrorMessages = require('../../../../config/errors');
const FeeItemService = require('../../../services/FeeItemService');
const accents = require('remove-accents');

module.exports = {
  add: async (req, res) => {
    sails.log.info("================================ FeeItemController.add => START ================================");
    // GET ALL PARAMS
    if (!req.me) {
      return res.badRequest(ErrorMessages.SYSTEM_SESSION_EXPIRED);
    }
    const params = req.allParams();
    // CHECK TITLE & CODE
    if (!params.title || !params.title.trim().length) return res.badRequest(ErrorMessages.FEE_ITEM_TITLE_REQUIRED);
    if (!params.code || !params.code.trim().length) return res.badRequest(ErrorMessages.FEE_ITEM_CODE_REQUIRED);
    if (!params.amount || isNaN(params.amount)) return res.badRequest(ErrorMessages.FEE_ITEM_AMOUNT_REQUIRED);
    
    //CHECK DUPLICATE CODE
    let code = accents.remove(params.code).replace(/\s/g, '');
    const checkCode = await FeeItem.findOne({ code: code, school: req.me.school });
    if (checkCode) return res.badRequest(ErrorMessages.FEE_ITEM_CODE_DUPLICATED.message);

    // PREPARE DATA FEE_ITEM
    const newData = {
      title: params.title, // REQUIRED
      code: code, // REQUIRED
      amount: parseFloat(params.amount),
      description: params.description,
      school: req.me.school
      // status: params.status ? Number.parseInt(params.status) : sails.config.custom.STATUS.DRAFT
    };

    // ADD NEW DATA FEE_ITEM
    const newFeeItem = await FeeItemService.add(newData);

    // RETURN DATA FEE_ITEM
    return res.ok(newFeeItem);
  },

  get: async (req, res) => {
    sails.log.info("================================ FeeItemController.get => START ================================");
    if (!req.me) {
      return res.badRequest(ErrorMessages.SYSTEM_SESSION_EXPIRED);
    }
    // GET ALL PARAMS
    const params = req.allParams();
    if (!params.id) {
      return res.badRequest(ErrorMessages.FEE_ITEM_ID_REQUIRED);
    }
    // QUERY & CHECK DATA FEE_ITEM
    const feeItems = await FeeItemService.get({
      id: params.id
    });
    if (!feeItems) {
      return res.notFound(ErrorMessages.FEE_ITEM_NOT_FOUND);
    }
    // RETURN DATA FEE_ITEM
    return res.json(feeItems);
  },

  edit: async (req, res) => {
    sails.log.info("================================ FeeItemController.edit => START ================================");
    // GET ALL PARAMS
    if (!req.me) {
      return res.badRequest(ErrorMessages.SYSTEM_SESSION_EXPIRED);
    }
    const params = req.allParams();
    // CHECK TITLE & CODE
    if (!params.title || !params.title.trim().length) return res.badRequest(ErrorMessages.FEE_ITEM_TITLE_REQUIRED);
    if (!params.code || !params.code.trim().length) return res.badRequest(ErrorMessages.FEE_ITEM_CODE_REQUIRED);
    if (!params.amount || isNaN(params.amount)) return res.badRequest(ErrorMessages.FEE_ITEM_AMOUNT_REQUIRED);

    //CHECK DUPLICATE CODE
    let code = accents.remove(params.code).replace(/\s/g, '');
    const checkCode = await FeeItem.findOne({ id: {'!=' : params.id}, code: code, school: req.me.school });
    if (checkCode) {
      return res.badRequest(ErrorMessages.FEE_ITEM_CODE_DUPLICATED.message);
    }
    // PREPARE DATA FEE_ITEM
    const editData = {
      title: params.title, // REQUIRED
      code: code, // REQUIRED
      amount: parseFloat(params.amount),
      description: params.description,
      // status: params.status ? Number.parseInt(params.status) : sails.config.custom.STATUS.DRAFT
    };

    // CHECK DATA FEE_ITEM
    const feeItems = FeeItemService.get({ id: params.id });
    if (!feeItems) {
      return res.notFound(ErrorMessages.FEE_ITEM_NOT_FOUND);
    }

    // UPDATE DATA FEE_ITEM
    const editObj = await FeeItemService.edit({ id: params.id }, editData);

    // RETURN DATA FEE_ITEM
    return res.json(editObj[0]);
  },

  delete: async (req, res) => {
    sails.log.info("================================ FeeItemController.delete => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();

    // let deleteFeeItemFromFeeInvoice = async (feeItemIds) => {
    //   let feeInvoices = await FeeInvoice.find({});
    //   if (feeInvoices && feeInvoices.length > 0) {
    //     for (let feeInvoiceObj of feeInvoices) {
    //       if (feeInvoiceObj.items && feeInvoiceObj.items.length > 0) {
    //         //flag
    //         let isChangeFeeItems = false;

    //         //remove feeItem which deleted from items of feeInvoice
    //         let newSlotFeedings = feeInvoiceObj.items;
    //         for (let i = 0; i < newSlotFeedings.length; i++){
    //           let feeItems = newSlotFeedings[i].feeItems.filter(item => !feeItemIds.includes(item));
    //           if (feeItems.length != newSlotFeedings[i].feeItems.length) {
    //             newSlotFeedings[i].feeItems = feeItems;
    //             isChangeFeeItems = true
    //           }
    //         }

    //         //update newSlotFeedings for feeInvoice
    //         if (isChangeFeeItems) {
    //           await FeeInvoice.update({ id: feeInvoiceObj.id }, { items: newSlotFeedings });
    //         }
    //       }
    //     }
    //   }
    // }

    // CHECK IDS PARAM
    if (!params.ids || !params.ids.length) {
      return res.badRequest(ErrorMessages.FEE_ITEM_ID_REQUIRED);
    }
    let ids = params.ids;
    if (params.ids.indexOf(';') != -1) {
      ids = ids.split(';');
    }
    if (typeof (ids) == 'object') {
      for (var i = 0; i < ids.length; i++) {
        let feeItem = await FeeItemService.get({ id: ids[i] });
        if (feeItem) FeeItemService.del({ id: ids[i] });
      }

      // deleteFeeItemFromFeeInvoice(ids);
    } else {
      let feeItem = await FeeItemService.get({ id: ids });
      if (feeItem) FeeItemService.del({ id: ids });

      // deleteFeeItemFromFeeInvoice([ids]);
    }
    // RETURN DATA
    return res.ok({ message: 'ok' });
  },

  search: async (req, res) => {
    sails.log.info("================================ FeeItemController.search => START ================================");
    if (!req.me) {
      return res.badRequest(ErrorMessages.SYSTEM_SESSION_EXPIRED);
    }

    let params = req.allParams();
    let keyword = params.search ? params.search.value : null;
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

    //let sort = (params.sort) ? JSON.parse(params.sort) : null;
    // let sort = null;
    let newSort = {};
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
    } else {
      newSort = { createdAt: -1 };
    }

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
      { school: new mongo.ObjectID(req.me.school) }
    ];

    /**SEARCH CASE_INSENSITIVE */
    const collection = FeeItem.getDatastore().manager.collection(FeeItem.tableName);
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
    const totalFeeItem = await collection.count(where);
    const dataWithObjectIds = await result.toArray();
    const arrObjFeeItems = JSON.parse(JSON.stringify(dataWithObjectIds).replace(/"_id"/g, '"id"'));

    //get settings
    let currencyObj = {};
    if (sails.config.custom.webSettings && sails.config.custom.webSettings.value && sails.config.custom.webSettings.value.currency) {
      let listCurrencies = sails.config.currencies.list;
      for(let currency of listCurrencies) {
        if(currency.code == sails.config.custom.webSettings.value.currency) {
          currencyObj = currency;
        }
      } 
    }

    let resFeeItems = [];
    for (let feeItem of arrObjFeeItems) {
      let tmpData = {};
      // tmpData.id = '<input class="js-checkbox-item" type="checkbox" value="' + feeItem.id + '">';
      tmpData.id = feeItem.id;
      tmpData.code = feeItem.code;
      tmpData.title = feeItem.title;
      tmpData.amount = feeItem.amount;
      let formattedCurrency = await sails.helpers.currencyFormat(feeItem.amount, currencyObj);
      tmpData.formattedAmount = formattedCurrency;
      tmpData.tool = await sails.helpers.renderRowAction(feeItem, isMainSchoolAdmin, isHavePermissionEdit, isHavePermissionDelete);
      if (feeItem.description && feeItem.description.trim().length > 0) {
        tmpData.description = feeItem.description;
      } else {
        tmpData.description = '-';
      }
     
      // if (feeItem.status == 1) {
      //   tmpData.status = `
      //     <label class="switch">
      //       <input class="switchStatus" type="checkbox" data-id="${feeItem.id}" checked>
      //       <span class="slider"></span>
      //     </label>`;
      // } else {
      //   tmpData.status = `
      //     <label class="switch">
      //       <input class="switchStatus" type="checkbox" data-id="${feeItem.id}">
      //       <span class="slider"></span>
      //     </label>`;
      // }

      resFeeItems.push(tmpData);
    };
    // let totalFeeItem = await FeeItemService.count(where);
    return res.ok({ draw: draw, recordsTotal: totalFeeItem, recordsFiltered: totalFeeItem, data: resFeeItems });
  },
  
  // switchStatus: async (req, res) => {
  //   sails.log.info("================================ FeeItemController.switchStatus => START ================================");
  //   // // GET ALL PARAMS
  //   const params = req.allParams();
  //   if (!params.id) return res.badRequest(ErrorMessages.FEE_ITEM_ID_REQUIRED);

  //   //CHECK OBJ IS EXISTED?
  //   let feeItemObj = await FeeItemService.get({ id: params.id });
  //   if (!feeItemObj) return res.badRequest(ErrorMessages.FEE_ITEM_NOT_FOUND);

  //   //switch status of current obj
  //   if (feeItemObj.status == 1) feeItemObj = await FeeItemService.edit({ id: params.id }, { status: 0 });
  //   else feeItemObj = await FeeItemService.edit({ id: params.id }, { status: 1 });

  //   return res.json(feeItemObj);
  //   // END UPDATE
  // },
};
