/**
 * ClassController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const ErrorMessages = require('../../../../config/errors');
const ClassService = require('../../../services/ClassService');
// const MessageService = require('../../services/MessageService');
// const MessageDataService = require('../../services/MessageDataService');
//Library
const accents = require('remove-accents');

module.exports = {

  add: async (req, res) => {
    sails.log.info("================================ ClassController.add => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();

    // CHECK TITTLE & CODE CLASS PARAMS
    if (!params.title) return res.badRequest(ErrorMessages.CLASS_TITLE_REQUIRED);
    if (!params.code || !params.code.trim().length) return res.badRequest(ErrorMessages.CLASS_CODE_REQUIRED);
    if (!params.courseSession) return res.badRequest(ErrorMessages.CLASS_COURSE_SESSION_REQURIED);
    if (!params.formations) return res.badRequest(ErrorMessages.FORMATION_ID_REQUIRED);

    let code = accents.remove(params.code).replace(/\s/g, '');
    //  CHECK SDKCLASS EXIST
    const foundCodeClass = await ClassService.find({ code: code, school: req.me.school });

    if (foundCodeClass.length) {
      return res.badRequest(ErrorMessages.CLASS_CODE_EXISTED);
    }
    
    // PREPARE DATA CLASS
    const newData = {
      title: params.title, // REQUIRED
      code: code, // REQUIRED
      totalStudent: params.totalStudent ? parseInt(params.totalStudent) : 0,
      teachers: params.teachers,
      thumbnail: params.thumbnail ? parseInt(params.thumbnail) : 1,
      courseSession: params.courseSession,
      formations: params.formations,
      status: params.status ? params.status : sails.config.custom.STATUS.DRAFT,
      createdBy: req.session.userId,
      school: req.me.school
    };

    let codeClass = await ClassService.get({ code: code });
    if (codeClass) {
      return res.badRequest(ErrorMessages.CLASS_CODE_EXISTED);
    }
    // ADD NEW DATA CLASS
    const newClass = await ClassService.add(newData);
    // RETURN DATA CLASS
    return res.ok(newClass);
  },

  get: async (req, res) => {
    sails.log.info("================================ ClassController.get => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();

    // CHECK PARAM
    if (!params.id) return res.badRequest(ErrorMessages.CLASS_ID_REQUIRED);

    // QUERY & CHECK DATA CLASS
    const classObj = await ClassService.get({
      id: params.id
    });
    if (!classObj) {
      return res.notFound(ErrorMessages.CLASS_OBJECT_NOT_FOUND);
    }
    // RETURN DATA CLASS
    return res.ok(classObj);
  },

  edit: async (req, res) => {
    sails.log.info("================================ ClassController.edit => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();

    console.log(params);

    // CHECK TITTLE & CODE CLASS PARAMS
    if (!params.title) return res.badRequest(ErrorMessages.CLASS_TITLE_REQUIRED);
    if (!params.code || !params.code.trim().length) return res.badRequest(ErrorMessages.CLASS_CODE_IS_REQUIRED);
    if (!params.courseSession) return res.badRequest(ErrorMessages.CLASS_COURSE_SESSION_REQURIED);
    if (!params.formations) return res.badRequest(ErrorMessages.FORMATION_ID_REQUIRED);

    // Count Total student in class
    let totalStudent = await Student_Class.count({ classObj: params.id });

    let teachers = params.teachers;
    //CHECK DUPLICATE CODE
    let code = accents.remove(params.code).replace(/\s/g, '');
    const checkCode = await Class.findOne({ id: { '!=': params.id }, code: code, school: req.me.school });
    if (checkCode) {
      return res.badRequest(ErrorMessages.CLASS_CODE_DUPLICATED);
    }
    // PREPARE DATA CLASS
    const newData = {
      title: params.title, // REQUIRED
      totalStudent: totalStudent,
      code: code, // REQUIRED
      thumbnail: params.thumbnail ? parseInt(params.thumbnail) : 1,
      courseSession: params.courseSession,
      formations: params.formations,
      status: params.status ? params.status : sails.config.custom.STATUS.DRAFT,
      createdBy: req.session.userId
    };

    // CHECK DATA CLASS
    const classObj = ClassService.get({
      id: params.id
    });
    if (!classObj) {
      return res.notFound(ErrorMessages.CLASS_OBJECT_NOT_FOUND);
    }

    // UPDATE DATA CLASS
    const editObj = await ClassService.edit({
      id: params.id
    }, newData);

    if (teachers) {
      await Class.replaceCollection(editObj.id, 'teachers', teachers).exec(function (err) { });
    }

    // RETURN DATA CLASS
    return res.json({
      data: editObj
    });
  },

  trash: async (req, res) => {
    sails.log.info("================================ ClassController.trash => START ================================");
    // GET ALL PARAMS
    let params = req.allParams();
    if (!params.ids) return res.badRequest(ErrorMessages.CLASS_ID_REQUIRED);

    let deleteClassFromRelations = async (classIds) => {
      //delete from notification
      let notifications = await Notifications.find({});
      if (notifications && notifications.length > 0) {
        for (let notificationObj of notifications) {
          if (notificationObj.classList && notificationObj.classList != -1 && notificationObj.classList.length > 0) {
            //remove subject which deleted from slotSubject of notification
            let newClassList = notificationObj.classList.filter(item => !classIds.includes(item));
            //update newClassList for notification
            if (newClassList.length != notificationObj.classList.length) {
              await Notifications.update({ id: notificationObj.id }, { classList: newClassList });
            }
          }
        }
      }

      //delete from schedule
      await Schedule.destroy({ classes: { in: classIds } });

      //delete from menu
      await Menu.destroy({ class: { in: classIds } });

    }

    let ids = params.ids;
    if (params.ids.indexOf(';') != -1) {
      ids = ids.split(';');
    }
    if (typeof (ids) == 'object') {
      for (var i = 0; i < ids.length; i++) {
        //ALWAYS CHECK  OBJECT EXIST
        let classObj = await ClassService.get({ id: ids[i] });
        if (classObj) ClassService.del({ id: ids[i] });
      }

      deleteClassFromRelations(ids);
    } else {
      let classObj = await ClassService.get({ id: ids });
      if (classObj) ClassService.del({ id: ids });

      deleteClassFromRelations([ids])
    }
    return res.ok();
  },

  search: async (req, res) => {
    sails.log.info("================================ ClassController.search => START ================================");
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
    const collection = Class.getDatastore().manager.collection(Class.tableName);
    let result = [];
    if (params.length && params.start) {
      result = await collection.find(where).limit(limit).skip(skip).sort(newSort);
    } else {
      result = await collection.find(where).sort(newSort);
    }
    const totalClass = await collection.count(where);
    const dataWithObjectIds = await result.toArray();
    const arrClassObj = JSON.parse(JSON.stringify(dataWithObjectIds).replace(/"_id"/g, '"id"'));

    // let arrClassObj = await ClassService.find(where, limit, skip, sort);
    let resClasses = [];
    for (let objClass of arrClassObj) {
      let classObj = await Class.findOne({id: objClass.id}).populate('teachers').populate('courseSession');
      let tmpData = {};
      tmpData.id = `<input class="js-checkbox-item" type="checkbox" value="${classObj.id}">`;
      tmpData.tool = await sails.helpers.renderRowAction(classObj, isMainSchoolAdmin, isHavePermissionEdit, isHavePermissionDelete);
      tmpData.title = classObj.title + " (" + classObj.code + ")";
      tmpData.totalStudent = classObj.totalStudent;


      tmpData.courseSession = classObj.courseSession ? classObj.courseSession.title : `<p class="text-center">-</p>`;
      tmpData.branch = `<p class="text-center">-</p>`;
      if (classObj.courseSession) {
        tmpData.courseSession = classObj.courseSession.title;
        if (classObj.courseSession.branchOfSession) {
          let branchObj = await Branch.findOne({ id: classObj.courseSession.branchOfSession });
          if(branchObj) {
            tmpData.branch = branchObj.title;
          } else {
            tmpData.branch = "-";
          }
          
        }
      }
      
      tmpData.status = '';
      if (isMainSchoolAdmin || isHavePermissionEdit) {
        if (classObj.status == 1) {
          tmpData.status = `
            <label class="switch">
              <input class="switchStatus" type="checkbox" data-id="${classObj.id}" checked>
              <span class="slider"></span>
            </label>`;
        } else {
          tmpData.status = `
            <label class="switch">
              <input class="switchStatus" type="checkbox" data-id="${classObj.id}">
              <span class="slider"></span>
            </label>`;
        }
      } else {
        if (classObj.status == 1) {
          tmpData.status = '<label class="badge badge-success">' + sails.__("Active") + '</label>';
        } else {
          tmpData.status = '<label class="badge badge-warning">' + sails.__("Draft") + '</label>';
        }
      }
      resClasses.push(tmpData);
    };
    // let totalClass = await ClassService.count(where);
    return res.ok({ draw: draw, recordsTotal: totalClass, recordsFiltered: totalClass, data: resClasses });
  },
  
  switchStatus: async (req, res) => {
    sails.log.info("================================ ClassController.switchStatus => START ================================");
    // // GET ALL PARAMS
    const params = req.allParams();
    if (!params.id) return res.badRequest(ErrorMessages.CLASS_ID_REQUIRED);

    //CHECK OBJ IS EXISTED?
    let classObj = await ClassService.get({ id: params.id });
    if (!classObj) return res.badRequest(ErrorMessages.CLASS_OBJECT_NOT_FOUND);

    //switch status of current obj
    if (classObj.status == 1) classObj = await ClassService.edit({ id: params.id }, { status: 0 });
    else classObj = await ClassService.edit({ id: params.id }, { status: 1 });

    return res.json(classObj);
    // END UPDATE
  },
  
  searchClassBySession: async (req, res) => {
    sails.log.info("================================ FeeInvoiceController.searchStudent => START ================================");
    let params = req.allParams();
    let webSettings = res.locals.webSettings;
    let dateFormat = webSettings.value.dateFormat;
    let draw = (params.draw) ? parseInt(params.draw) : 1;

    let newSort = {};
    if (params.order) {
      //prepared order param
      let objOrder = {};
      objOrder[params.columns[params.order[0].column].data] = params.order[0].dir;
  
      //get new sort for find insensitive case
      for(var key in objOrder){
        if(objOrder[key] == 'desc'){
          //code here
          newSort[key] = -1; 
        } else {
          newSort[key] = 1;
        }
      }
    }

    let where = {};

    let mongo = require('mongodb');
    
    // if (params.classId != '') {
    //   let id = new mongo.ObjectID(params.classId);
    //   where.$and = [
    //     { _id: id },
    //     { school: new mongo.ObjectID(req.me.school) }
    //   ];
    // } else {

      if (params.sessionId != '') {
        //get students from class
        let sessionObj = await CourseSession.find({ id: params.sessionId }).populate('classes');
        let classIds = sessionObj[0].classes.map((std) => {
          return new mongo.ObjectID(std.id);
        })
    
        where.$and = [
          { status: params.status ? parseInt(params.status) : 1 },
          { _id: { $in: classIds } },
          { school: new mongo.ObjectID(req.me.school) }
        ];
      }
    //}

    /**SEARCH CASE_INSENSITIVE */
    const collection = Class.getDatastore().manager.collection(Class.tableName);
    let result = await collection.find(where).sort(newSort);
    const totalClass = await collection.count(where);
    const dataWithObjectIds = await result.toArray();
    const arrClass = JSON.parse(JSON.stringify(dataWithObjectIds).replace(/"_id"/g, '"id"'));


    // handler to render datatable
    let resClasses = [];
    for (let classObj of arrClass) {
      let clas = await ClassService.get({ id: classObj.id });
      let tmpData = {};
      tmpData._id = clas.id;
      // CODE STUDENT
      tmpData.code = clas.code;
      tmpData.title = clas.title;
      resClasses.push(tmpData);
    };
    // let totalStudent = await StudentService.count(where);
    return res.ok({ draw: draw, recordsTotal: totalClass, recordsFiltered: totalClass, data: resClasses });
  }
};
