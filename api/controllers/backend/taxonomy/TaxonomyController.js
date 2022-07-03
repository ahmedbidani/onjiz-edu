/**
 * TaxonomyController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const ErrorMessages = require('../../../../config/errors');
module.exports = {
  add: async (req, res) => {
    sails.log.info("================================ TaxonomyController.add => START ================================");
    // GET ALL PARAMS
    if (!req.me) {
      return res.badRequest(ErrorMessages.SYSTEM_SESSION_EXPIRED);
    }
    const params = req.allParams();
    // CHECK TITLE & CODE
    if (!params.title || !params.title.trim().length) {
      return res.badRequest(ErrorMessages.TAXONOMY_TITLE_REQUIRED);
    }
    // PREPARE DATA COURSE SESSION
    const newData = {
      title: params.title, // REQUIRED
      description: (params.description) ? params.description : '',
      type: (params.type) ? params.type : sails.config.custom.TYPE.CATEGORY,
      parent: (params.parent == 0) ? null : params.parent,
      status: params.status ? Number.parseInt(params.status) : sails.config.custom.STATUS.DRAFT,
      school: req.me.school
    };

    // ADD NEW DATA COURSE SESSION
    const newTaxonomy = await TaxonomyService.add(newData);

    // RETURN DATA COURSE SESSION
    return res.ok(newTaxonomy);
  },

  get: async (req, res) => {
    sails.log.info("================================ TaxonomyController.get => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();
    if (!params.id) {
      return res.badRequest(ErrorMessages.TAXONOMY_ID_REQUIRED);
    }

    // QUERY & CHECK DATA COURSE SESSION
    const taxonomys = await TaxonomyService.get({
      id: params.id
    });
    if (!taxonomys) {
      return res.notFound(ErrorMessages.TAXONOMY_NOT_FOUND);
    }
    // RETURN DATA COURSE SESSION
    return res.json(taxonomys);
  },

  edit: async (req, res) => {
    sails.log.info("================================ TaxonomyController.edit => START ================================");
    // GET ALL PARAMS
    if (!req.me) {
      return res.badRequest(ErrorMessages.SYSTEM_SESSION_EXPIRED);
    }
    const params = req.allParams();
    // CHECK TITLE & CODE
    if (!params.title || !params.title.trim().length) {
      return res.badRequest(ErrorMessages.TAXONOMY_TITLE_REQUIRED);
    }
    // PREPARE DATA COURSE SESSION
    const editData = {
      title: params.title, // REQUIRED
      description: (params.description) ? params.description : '',
      type: (params.type) ? params.type : sails.config.custom.TYPE.CATEGORY,
      parent: (params.parent == 0) ? null : params.parent,
      status: params.status ? Number.parseInt(params.status) : sails.config.custom.STATUS.DRAFT,
    };

    // CHECK DATA COURSE SESSION
    const taxonomys = TaxonomyService.get({ id: params.id });
    if (!taxonomys) {
      return res.notFound(ErrorMessages.TAXONOMY_NOT_FOUND);
    }

    // UPDATE DATA COURSE SESSION
    const editObj = await TaxonomyService.edit({ id: params.id }, editData);

    // RETURN DATA COURSE SESSION
    return res.json({
      status: 1,
      data: editObj
    });
  },

  trash: async (req, res) => {
    sails.log.info("================================ TaxonomyController.trash => START ================================");

    let params = req.allParams();
    if (!params.ids) return res.badRequest(ErrorService.TAXONOMY_ID_REQUIRED);

    let ids = params.ids;
    if (params.ids.indexOf(';') != -1) {
      ids = ids.split(';');
    }
    if (typeof (ids) == 'object') {
      for (var i = 0; i < ids.length; i++) {
        let taxonomy = await TaxonomyService.get({ id: ids[i] });
        if (taxonomy) TaxonomyService.del({ id: ids[i] });
        // let taxonomysObj = await TaxonomyService.get({ id: ids[i] });
        // if (!taxonomysObj) return res.notFound(ErrorMessages.COURSESESSION_OBJECT_NOT_FOUND);
        // if (taxonomysObj.status == sails.config.custom.STATUS.TRASH) {
        //   TaxonomyService.del({ id: ids[i] });
        // } else {
        //   await Taxonomy.update({ id: ids[i] }).set({ status: sails.config.custom.STATUS.TRASH });
        // }
      }
    } else {
      let taxonomy = await TaxonomyService.get({ id: ids });
      if (taxonomy) TaxonomyService.del({ id: ids });
      // let taxonomys = await TaxonomyService.get({ id: ids });
      // if (taxonomys && taxonomys.status == sails.config.custom.STATUS.TRASH) {
      //   TaxonomyService.del({ id: ids });
      // } else if (taxonomys) {
      //   await Taxonomy.update({ id: ids }).set({ status: sails.config.custom.STATUS.TRASH });
      // }
    }
    return res.ok();
  },

  search: async (req, res) => {
    sails.log.info("================================ TaxonomyController.search => START ================================");
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
        ]
      } 
    }

    let mongo = require('mongodb');
    where.$and = [
      { type: params.type ? params.type : '' },
      { school: mongo.ObjectID(req.me.school) }
    ];
    if (params.status && params.status != '-1') {
      where.$and.push({ status: parseInt(params.status) });
    }
    /**SEARCH CASE_INSENSITIVE */
    const collection = Taxonomy.getDatastore().manager.collection(Taxonomy.tableName);
    let result = [];
    if (params.length && params.start) {
      result = await collection.find(where).limit(limit).skip(skip).sort(newSort);
    } else {
      result = await collection.find(where).sort(newSort);
    }
    const totalTaxonomy = await collection.count(where);
    const dataWithObjectIds = await result.toArray();
    const arrObjTaxonomies = JSON.parse(JSON.stringify(dataWithObjectIds).replace(/"_id"/g, '"id"'));

    // //find only active status
    // let status = (params.status) ? parseInt(params.status) : 1;
    // let type = (params.type) ? params.type : '';
    // let where = { status: status, type: type };
    // if (status != 1) {
    //   where = { status: status, type: type };
    // }
    
    // //find only active status
    // //let select = ["_id", "name", "description", "order"];
    // if (params.condition && !Utils.isJsonString(params.condition)) return res.serverError(ErrorMessages.SYSTEM_JSON_FORMAT_FAIL);
    // if (typeof title === "string" && title.length > 0) {
    //   where = {
    //     or: [
    //       { 
    //         title: { contains: title },
    //         type: type,
    //         status: status
    //       }
    //     ]
    //   };
    // }
    // let condition = (params.condition) ? JSON.parse(params.condition) : null;
    // if (condition) {
    //   where = condition;
    // }
    // let arrObjTaxonomies = await TaxonomyService.find(where, limit, skip, sort);
    let resTaxonomies = [];
    for (let taxonomy of arrObjTaxonomies) {
      let tmpData = {};
      tmpData.id = '<input class="js-checkbox-item" type="checkbox" value="' + taxonomy.id + '">';
      tmpData.tool = await sails.helpers.renderRowAction(taxonomy, isMainSchoolAdmin, isHavePermissionEdit, isHavePermissionDelete);
        
      tmpData.title = taxonomy.title;
      tmpData.description = taxonomy.description;
      
      tmpData.status = '';
      if (isMainSchoolAdmin || isHavePermissionEdit) {
        if (taxonomy.status == 1) {
          tmpData.status = `
            <label class="switch">
              <input class="switchStatus" type="checkbox" data-id="${taxonomy.id}" checked>
              <span class="slider"></span>
            </label>`;
        } else {
          tmpData.status = `
            <label class="switch">
              <input class="switchStatus" type="checkbox" data-id="${taxonomy.id}">
              <span class="slider"></span>
            </label>`;
        }
      } else {
        if (taxonomy.status == 1) {
          tmpData.status = '<label class="badge badge-success">' + sails.__("Active") + '</label>';
        } else {
          tmpData.status = '<label class="badge badge-warning">' + sails.__("Draft") + '</label>';
        }
      }

      resTaxonomies.push(tmpData);
    };
    // let totalTaxonomy = await TaxonomyService.count(where);
    return res.ok({ draw: draw, recordsTotal: totalTaxonomy, recordsFiltered: totalTaxonomy, data: resTaxonomies });
  },
  
  switchStatus: async (req, res) => {
    sails.log.info("================================ TaxonomyController.switchStatus => START ================================");
    // // GET ALL PARAMS
    const params = req.allParams();
    if (!params.id) return res.badRequest(ErrorMessages.TAXONOMY_ID_REQUIRED);

    //CHECK OBJ IS EXISTED?
    let taxonomyObj = await TaxonomyService.get({ id: params.id });
    if (!taxonomyObj) return res.badRequest(ErrorMessages.TAXONOMY_OBJECT_NOT_FOUND);

    //switch status of current obj
    if (taxonomyObj.status == 1) taxonomyObj = await TaxonomyService.edit({ id: params.id }, { status: 0 });
    else taxonomyObj = await TaxonomyService.edit({ id: params.id }, { status: 1 });

    return res.json(taxonomyObj);
    // END UPDATE
  },
};
