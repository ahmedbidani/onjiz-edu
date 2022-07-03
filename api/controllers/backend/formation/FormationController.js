/**
 * FormationController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const ErrorMessages = require('../../../../config/errors');
const FormationService = require('../../../services/FormationService');

module.exports = {
  add: async (req, res) => {
    sails.log.info("================================ FormationController.add => START ================================");
    // GET ALL PARAMS
    if (!req.me) {
      return res.badRequest(ErrorMessages.SYSTEM_SESSION_EXPIRED);
    }
    const params = req.allParams();
    // CHECK NAME
    if (!params.name || !params.name.trim().length) return res.badRequest(ErrorMessages.FORMATION_NAME_REQUIRED);

    // PREPARE DATA FORMATION
    const newData = {
      name: params.name, // REQUIRED
      description: params.description,
      status: params.status ? Number.parseInt(params.status) : sails.config.custom.STATUS.DRAFT,
      school: req.me.school
    };

    // ADD NEW DATA FORMATION
    const newFormation = await FormationService.add(newData);

    // RETURN DATA FORMATION
    return res.ok(newFormation);
  },

  get: async (req, res) => {
    sails.log.info("================================ FormationController.get => START ================================");
    if (!req.me) {
      return res.badRequest(ErrorMessages.SYSTEM_SESSION_EXPIRED);
    }
    // GET ALL PARAMS
    const params = req.allParams();
    if (!params.id) return res.badRequest(ErrorMessages.FORMATION_ID_REQUIRED);

    // QUERY & CHECK DATA FORMATION
    const formations = await FormationService.get({ id: params.id });

    if (!formations) {
      return res.notFound(ErrorMessages.FORMATION_NOT_FOUND);
    }
    // RETURN DATA FORMATION
    return res.json(formations);
  },

  edit: async (req, res) => {
    sails.log.info("================================ FormationController.edit => START ================================");
    // GET ALL PARAMS
    if (!req.me) {
      return res.badRequest(ErrorMessages.SYSTEM_SESSION_EXPIRED);
    }
    const params = req.allParams();
    // CHECK NAME
    if (!params.name || !params.name.trim().length) return res.badRequest(ErrorMessages.FORMATION_NAME_REQUIRED);
    
    // PREPARE DATA FORMATION
    const editData = {
      name: params.name, // REQUIRED
      description: params.description,
      status: params.status ? Number.parseInt(params.status) : sails.config.custom.STATUS.DRAFT
    };

    // CHECK DATA FORMATION
    const formations = FormationService.get({ id: params.id });
    if (!formations) return res.notFound(ErrorMessages.FORMATION_NOT_FOUND);

    // UPDATE DATA FORMATION
    const editObj = await FormationService.edit({ id: params.id }, editData);

    // RETURN DATA FORMATION
    return res.json(editObj[0]);
  },

  delete: async (req, res) => {
    sails.log.info("================================ FormationController.delete => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();

    // CHECK IDS PARAM
    if (!params.ids || !params.ids.length) {
      return res.badRequest(ErrorMessages.FORMATION_ID_REQUIRED);
    }
    let ids = params.ids;
    if (params.ids.indexOf(';') != -1) {
      ids = ids.split(';');
    }
    if (typeof (ids) == 'object') {
      for (var i = 0; i < ids.length; i++) {
        let formation = await FormationService.get({ id: ids[i] });
        if (formation) FormationService.del({ id: ids[i] });
      }
    } else {
      let formation = await FormationService.get({ id: ids });
      if (formation) FormationService.del({ id: ids });
    }
    // RETURN DATA
    return res.ok({ message: 'ok' });
  },

  search: async (req, res) => {
    sails.log.info("================================ FormationController.search => START ================================");
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
    if (!isMainSchoolAdmin && req.me.role && req.me.role.permissions && req.me.role.permissions.formation) {
      isHavePermissionEdit = req.me.role.permissions.formation.edit ? true : false;
      isHavePermissionDelete = req.me.role.permissions.formation.delete ? true : false;
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
    const collection = Formation.getDatastore().manager.collection(Formation.tableName);
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
    const totalFormation = await collection.count(where);
    const dataWithObjectIds = await result.toArray();
    const arrObjFormations = JSON.parse(JSON.stringify(dataWithObjectIds).replace(/"_id"/g, '"id"'));

    let resFormations = [];
    for (let formation of arrObjFormations) {
      let tmpData = {};
      tmpData.id = '<input class="js-checkbox-item" type="checkbox" value="' + formation.id + '">';
      tmpData.name = formation.name;
      tmpData.tool = await sails.helpers.renderRowAction(formation, isMainSchoolAdmin, isHavePermissionEdit, isHavePermissionDelete);
      if (formation.description && formation.description.trim().length > 0) {
        tmpData.description = formation.description;
      } else {
        tmpData.description = '-';
      }
     
      if (formation.status == 1) {
        tmpData.status = `
          <label class="switch">
            <input class="switchStatus" type="checkbox" data-id="${formation.id}" checked>
            <span class="slider"></span>
          </label>`;
      } else {
        tmpData.status = `
          <label class="switch">
            <input class="switchStatus" type="checkbox" data-id="${formation.id}">
            <span class="slider"></span>
          </label>`;
      }

      resFormations.push(tmpData);
    };
    
    return res.ok({ draw: draw, recordsTotal: totalFormation, recordsFiltered: totalFormation, data: resFormations });
  },
  
  switchStatus: async (req, res) => {
    sails.log.info("================================ FormationController.switchStatus => START ================================");
    // // GET ALL PARAMS
    const params = req.allParams();
    if (!params.id) return res.badRequest(ErrorMessages.FORMATION_ID_REQUIRED);

    //CHECK OBJ IS EXISTED?
    let formationObj = await FormationService.get({ id: params.id });
    if (!formationObj) return res.badRequest(ErrorMessages.FORMATION_NOT_FOUND);

    //switch status of current obj
    if (formationObj.status == 1) formationObj = await FormationService.edit({ id: params.id }, { status: 0 });
    else formationObj = await FormationService.edit({ id: params.id }, { status: 1 });

    return res.json(formationObj);
    // END UPDATE
  },
};
