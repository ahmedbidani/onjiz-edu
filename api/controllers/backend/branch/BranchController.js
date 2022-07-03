/**
 * BranchController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const ErrorMessages = require('../../../../config/errors');
const BranchService = require('../../../services/BranchService');
const UserService = require('../../../services/UserService');
// const MessageService = require('../../services/MessageService');
// const MessageDataService = require('../../services/MessageDataService');
//Library
const moment = require('moment');
const accents = require('remove-accents');

module.exports = {

  add: async (req, res) => {
    sails.log.info("================================ BranchController.add => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();

    
    // CHECK TITTLE & CODE BRANCH PARAMS
    if (!params.title) return res.badRequest(ErrorMessages.BRANCH_TITLE_REQUIRED);
    if (!params.code || !params.code.trim().length) return res.badRequest(ErrorMessages.BRANCH_CODE_REQUIRED);
    if (!params.minister) return res.badRequest(ErrorMessages.BRANCH_MINISTER_REQURIED);
    if (!params.address) return res.badRequest(ErrorMessages.BRANCH_ADDRESS_REQURIED);

    // PREPARE UPDATE BY 
    let updatedBy = req.session.userId; 
    let code = accents.remove(params.code).replace(/\s/g, '');

     //  CHECK CODE BRANCH EXIST
     const foundCodeBranch = await BranchService.get({
       code: code,
       school: req.me.school
    });

    if (foundCodeBranch) {
      return res.badRequest(ErrorMessages.BRANCH_CODE_EXISTED);
    }

    // PREPARE DATA BRANCH
    const newData = {
      title: params.title, // REQUIRED
      code: code, // REQUIRED
      address: params.address, // REQUIRED
      status: params.status ? params.status : sails.config.custom.STATUS.DRAFT,
      minister: params.minister,
      updatedBy: updatedBy,
      school: req.me.school
    };
    // ADD NEW DATA BRANCH
    const newBranch = await BranchService.add(newData);
    // RETURN DATA BRANCH
    return res.ok(newBranch);
  },

  get: async (req, res) => {
    sails.log.info("================================ BranchController.get => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();

    // CHECK PARAM
    if (!params.id) return res.badRequest(ErrorMessages.BRANCH_ID_REQUIRED);

    // QUERY & CHECK DATA CLASS
    const branchObj = await BranchService.get({
      id: params.id
    });
    if (!branchObj) return res.notFound(ErrorMessages.BRANCH_OBJECT_NOT_FOUND);

    let sessionsIds = branchObj.sessions.map(item => item.id);
    let classesOfBranch = await Class.find({ id: { 'in': sessionsIds } });
    branchObj.classes = classesOfBranch;
    // RETURN DATA CLASS
    return res.ok(branchObj);
  },

  edit: async (req, res) => {
    sails.log.info("================================ BranchController.edit => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();

    // CHECK TITTLE & CODE BRANCH PARAMS
    if (!params.id) return res.badRequest(ErrorMessages.BRANCH_ID_REQUIRED);
    if (!params.title) return res.badRequest(ErrorMessages.BRANCH_TITLE_REQUIRED);
    if (!params.code || !params.code.trim().length) return res.badRequest(ErrorMessages.BRANCH_CODE_REQUIRED);
    if (!params.minister) return res.badRequest(ErrorMessages.BRANCH_MINISTER_REQURIED);
    if (!params.address) return res.badRequest(ErrorMessages.BRANCH_ADDRESS_REQURIED);

    

    // PREPARE UPDATE BY
    let updatedBy = req.session.userId;  
 
    let code = accents.remove(params.code).replace(/\s/g, '');
    
    //  CHECK CODE BRANCH EXIST
    const foundCodeBranch = await BranchService.get({ code: code, id: { '!=': params.id }, school: req.me.school });
    
    if (foundCodeBranch) return res.badRequest(ErrorMessages.BRANCH_CODE_EXISTED);
   
    // PREPARE DATA BRANCH
    const newData = {
      title: params.title, // REQUIRED
      code: code, // REQUIRED
      address: params.address, // REQUIRED
      status: params.status ? params.status : sails.config.custom.STATUS.DRAFT,
      minister: params.minister,
      updatedBy: updatedBy
    };

    // CHECK DATA BRANCH
    const branchObj = BranchService.get({ id: params.id, school: req.me.school });
    if (!branchObj) {
      return res.notFound(ErrorMessages.BRANCH_OBJECT_NOT_FOUND);
    }

    // UPDATE DATA BRANCH
    const editObj = await BranchService.edit({
      id: params.id
    }, newData);

    // RETURN DATA BRANCH
    return res.json({
      data: editObj
    });
  },

  trash: async (req, res) => {
    sails.log.info("================================ BranchController.trash => START ================================");
    // GET ALL PARAMS
    let params = req.allParams();
    if (!params.ids) return res.badRequest(ErrorMessages.BRANCH_ID_REQUIRED);

    let ids = params.ids;
    if (params.ids.indexOf(';') != -1) {
      ids = ids.split(';');
    }
    if (typeof (ids) == 'object') {
      Class.update({ branch: { 'in': ids } }).set({ branch: null });
      User.update({ branch: { 'in': ids } }).set({ branch: null });
      BranchService.del({ id: { 'in': ids } });
    } else {
      Class.update({ branch: ids }).set({ branch: null });
      User.update({ branch: ids }).set({ branch: null });
      BranchService.del({ id: ids });
    }
    return res.ok();
  },

  search: async (req, res) => {
    sails.log.info("================================ BranchController.search => START ================================");
    let webSettings = res.locals.webSettings;
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

    //prepared order param
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
    const collection = Branch.getDatastore().manager.collection(Branch.tableName);
    let result = [];
    if (params.length && params.start) {
      result = await collection.find(where).limit(limit).skip(skip).sort(newSort);
    } else {
      result = await collection.find(where).sort(newSort);
    }
    const totalBranch = await collection.count(where);
    const dataWithObjectIds = await result.toArray();
    const arrBranchObj = JSON.parse(JSON.stringify(dataWithObjectIds).replace(/"_id"/g, '"id"'));

    // let arrClassObj = await BranchService.find(where, limit, skip, sort);
    let resBranches = [];
    for (let objBranch of arrBranchObj) {
      let branchObj = await Branch.findOne({id: objBranch.id}).populate('minister');
      let tmpData = {};
      tmpData.id = `<input class="js-checkbox-item" type="checkbox" value="${branchObj.id}">`;
      tmpData.title = branchObj.title;
      let _tmpFullname = await sails.helpers.formatFullname(branchObj.minister.firstName, branchObj.minister.lastName, webSettings.value.displayName);
      tmpData.minister = _tmpFullname;
      tmpData.address = branchObj.address;  
      tmpData.status = '';
      if (isMainSchoolAdmin || isHavePermissionEdit) {
        if (branchObj.status == 1) {
          tmpData.status = `
            <label class="switch">
              <input class="switchStatus" type="checkbox" data-id="${branchObj.id}" checked>
              <span class="slider"></span>
            </label>`;
        } else {
          tmpData.status = `
            <label class="switch">
              <input class="switchStatus" type="checkbox" data-id="${branchObj.id}">
              <span class="slider"></span>
            </label>`;
        }
      } else {
        if (branchObj.status == 1) {
          tmpData.status = '<label class="badge badge-success">' + sails.__("Active") + '</label>';
        } else {
          tmpData.status = '<label class="badge badge-warning">' + sails.__("Draft") + '</label>';
        }
      }
      let userObj = await UserService.get(branchObj.updatedBy);
      tmpData.updatedBy = userObj.firstName + ' '+userObj.lastName;
      tmpData.tool = await sails.helpers.renderRowAction(branchObj, isMainSchoolAdmin, isHavePermissionEdit, isHavePermissionDelete);
      resBranches.push(tmpData);
    };
    // let totalClass = await BranchService.count(where);
    return res.ok({ draw: draw, recordsTotal: totalBranch, recordsFiltered: totalBranch, data: resBranches });
  },
  
  switchStatus: async (req, res) => {
    sails.log.info("================================ BranchController.switchStatus => START ================================");
    // // GET ALL PARAMS
    const params = req.allParams();
    if (!params.id) return res.badRequest(ErrorMessages.CLASS_ID_REQUIRED);

    //CHECK OBJ IS EXISTED?
    let branchObj = await BranchService.get({ id: params.id });
    if (!branchObj) return res.badRequest(ErrorMessages.CLASS_OBJECT_NOT_FOUND);

    //switch status of current obj
    if (branchObj.status == 1) branchObj = await BranchService.edit({ id: params.id }, { status: 0 });
    else branchObj = await BranchService.edit({ id: params.id }, { status: 1 });

    return res.json(branchObj);
    // END UPDATE
  },
};
