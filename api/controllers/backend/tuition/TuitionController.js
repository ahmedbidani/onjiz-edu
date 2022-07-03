/**
 * TuitionController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const ErrorMessages = require('../../../../config/errors');
const TuitionService = require('../../../services/TuitionService');
// const MessageService = require('../../services/MessageService');
// const MessageDataService = require('../../services/MessageDataService');
//Library
const moment = require('moment');

module.exports = {

  add: async (req, res) => {
    sails.log.info("================================ TuitionController.add => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();
    // CHECK PARAMS DATA
    if (!params.title) return res.badRequest(ErrorMessages.TUITION_TITLE_REQUIRED);
    if (!params.deadline) return res.badRequest(ErrorMessages.TUITION_DEADLINE_REQUIRED);
    // GET LIST STUDENTS ID BY CLASS ARRAY
    let listStudentId = [];
    let where = { classObj: params.classes }
    let arrRelationStudentClass = await await Student_Class.find(where);
    _.each(arrRelationStudentClass, function (relationItem) {
      listStudentId.push(relationItem.student);
    });
    // PREPARE DATA CLASS
    const newData = {
      title: params.title,
      slotItems: params.slotItems,
      totalCost: params.totalCost,
      classes: params.classes,
      students: listStudentId,
      deadline: params.deadline,
      createdBy: req.session.userId,
      courseSession: req.session.courseSessionActive,
      status: params.status ? params.status : sails.config.custom.STATUS.DRAFT,
    };
    // ADD NEW DATA CLASS
    const newTuition = await TuitionService.add(newData);
    // RETURN DATA CLASS
    return res.ok(newTuition);
  },

  get: async (req, res) => {
    sails.log.info("================================ TuitionController.get => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();

    // CHECK ID PARAM
    if (!params.id) {
      return res.badRequest(ErrorMessages.CLASS_ID_REQUIRED);
    }

    // QUERY & CHECK DATA CLASS
    const tuitiones = await TuitionService.get({
      id: params.id
    });
    if (!tuitiones) {
      return res.notFound(ErrorMessages.CLASS_OBJECT_NOT_FOUND);
    }

    // RETURN DATA CLASS
    return res.ok(tuitiones);
  },

  edit: async (req, res) => {
    sails.log.info("================================ TuitionController.edit => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();
    // CHECK PARAMS DATA
    if (!params.title) return res.badRequest(ErrorMessages.TUITION_TITLE_REQUIRED);
    if (!params.deadline) return res.badRequest(ErrorMessages.TUITION_DEADLINE_REQUIRED);
    // GET LIST STUDENTS ID BY CLASS ARRAY
    let listStudentId = [];
    let where = { classObj: params.classes }
    let arrRelationStudentClass = await await Student_Class.find(where);
    _.each(arrRelationStudentClass, function (relationItem) {
      listStudentId.push(relationItem.student);
    });
    // Del Tuition - Student
    await Tuition_Student.destroy({ tuition: params.id })
    // PREPARE DATA CLASS
    const newData = {
      title: params.title,
      slotItems: params.slotItems,
      totalCost: params.totalCost,
      classes: params.classes,
      student: listStudentId,
      courseSession: req.session.courseSessionActive,
      deadline: params.deadline,
      createdBy: req.session.userId,
      status: params.status ? params.status : sails.config.custom.STATUS.DRAFT,
    };
    // CHECK DATA CLASS
    const tuitiones = TuitionService.get({
      id: params.id
    });
    if (!tuitiones) {
      return res.notFound(ErrorMessages.CLASS_OBJECT_NOT_FOUND);
    }
    // UPDATE DATA CLASS
    const editObj = await TuitionService.edit({
      id: params.id
    }, newData);

    // if (teachers) {
    //   await Tuition.replaceCollection(editObj.id, 'teachers', teachers).exec(function (err) { });
    // }

    // RETURN DATA CLASS
    return res.json({
      data: editObj
    });
  },

  trash: async (req, res) => {
    sails.log.info("================================ TuitionController.trash => START ================================");
    // GET ALL PARAMS
    let params = req.allParams();
    if (!params.ids) return res.badRequest(ErrorMessages.CLASS_ID_REQUIRED);
    // Call constructor with custom options:
    let data = { status: sails.config.custom.STATUS.TRASH };
    let ids = params.ids;
    if (params.ids.indexOf(';') != -1) {
      ids = ids.split(';');
    }
    if (typeof (ids) == 'object') {
      for (var i = 0; i < ids.length; i++) {
        //ALWAYS CHECK  OBJECT EXIST
        let tuitiones = await TuitionService.get({ id: ids[i] });
        if (!tuitiones) return res.notFound(ErrorMessages.TUITION_NOT_FOUND);
        //If status Tuition == 3 => Delete Tuition
        if (tuitiones.status == 3) {
          TuitionService.del({ id: ids[i] });
        } else {
          await Tuition.update(ids[i]).set(data);
        }
      }
    } else {
      //ALWAYS CHECK  OBJECT EXIST
      let tuitiones = await TuitionService.get({ id: ids });
      if (!tuitiones) return res.notFound(ErrorMessages.TUITION_NOT_FOUND);
      //If status Tuition == 3 => Delete Tuition
      if (tuitiones.status == 3) {
        TuitionService.del({ id: ids });
      } else {
        await Tuition.update(ids).set(data);
      }
    }
    return res.ok();
  },

  search: async (req, res) => {
    sails.log.info("================================ TuitionController.search => START ================================");
    let params = req.allParams();
    let webSettings = res.locals.webSettings;
    let dateFormat = webSettings.value.dateFormat;
    let keyword = params.search ? params.search.value : null;
    let draw = (params.draw) ? parseInt(params.draw) : 1;
    let limit = (params.length) ? parseInt(params.length) : null;
    let skip = (params.start) ? parseInt(params.start) : null;
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
        ]
      } 
    }

    let mongo = require('mongodb');
    let courseSessionId = new mongo.ObjectID(req.session.courseSessionActive)

    where.$and = [
      { courseSession: courseSessionId },
      { status: params.status ? parseInt(params.status) : 1 }
    ];

    /**SEARCH CASE_INSENSITIVE */
    const collection = Tuition.getDatastore().manager.collection(Tuition.tableName);
    let result = [];
    if (params.length && params.start) {
      result = await collection.find(where).limit(limit).skip(skip).sort(newSort);
    } else {
      result = await collection.find(where).sort(newSort);
    }
    const totalTuition = await collection.count(where);
    const dataWithObjectIds = await result.toArray();
    const arrObjTuitiones = JSON.parse(JSON.stringify(dataWithObjectIds).replace(/"_id"/g, '"id"'));
    //find only active status
    // let status = (params.status) ? parseInt(params.status) : 1;
    // let where = {
    //   status: status,
    //   courseSession: req.session.courseSessionActive
    // };
    // // search
    // if (typeof keyword === "string" && keyword.length > 0) {
    //   where = {
    //     or: [
    //       { title: { contains: keyword } }
    //     ]
    //   };
    // }

    // let arrObjTuitiones = await TuitionService.find(where, limit, skip, sort);
    let resTuitiones = [];
    for (let tuitiones of arrObjTuitiones) {
      let tmpData = {};
      tmpData.id = `<input class="js-checkbox-item" type="checkbox" value="${tuitiones.id}">`;
      tmpData.title = tuitiones.title;
      // Show slot items
      let listItem = '';
      _.each(tuitiones.slotItems, function (slotItem) {
        listItem += `<li>${slotItem.title} - ${slotItem.price}đ </li>`;
      });
      tmpData.slotItems = `<ul class="list-arrow mb-0">${listItem}</ul>`;
      // Show more value
      tmpData.totalCost = `<b>${tuitiones.totalCost}đ</b>`;
      tmpData.deadline = moment(tuitiones.deadline, "YYYY-MM-DD").format(dateFormat);
      
      if (tuitiones.status == 1) {
        tmpData.status = `
          <label class="switch">
            <input class="switchStatus" type="checkbox" data-id="${tuitiones.id}" checked>
            <span class="slider"></span>
          </label>`;
      } else {
        tmpData.status = `
          <label class="switch">
            <input class="switchStatus" type="checkbox" data-id="${tuitiones.id}">
            <span class="slider"></span>
          </label>`;
      }
      tmpData.tool = await sails.helpers.renderRowAction(tuitiones);
      resTuitiones.push(tmpData);
    };
    // let totalTuition = await TuitionService.count(where);
    return res.ok({ draw: draw, recordsTotal: totalTuition, recordsFiltered: totalTuition, data: resTuitiones });

  },
  
  switchStatus: async (req, res) => {
    sails.log.info("================================ TuitionController.switchStatus => START ================================");
    // // GET ALL PARAMS
    const params = req.allParams();
    if (!params.id) return res.badRequest(ErrorMessages.TUITION_ID_REQUIRED);

    //CHECK OBJ IS EXISTED?
    let tuitionObj = await TuitionService.get({ id: params.id });
    if (!tuitionObj) return res.badRequest(ErrorMessages.TUITION_NOT_FOUND);

    //switch status of current obj
    if (tuitionObj.status == 1) tuitionObj = await TuitionService.edit({ id: params.id }, { status: 0 });
    else tuitionObj = await TuitionService.edit({ id: params.id }, { status: 1 });

    return res.json(tuitionObj);
    // END UPDATE
  },
};
