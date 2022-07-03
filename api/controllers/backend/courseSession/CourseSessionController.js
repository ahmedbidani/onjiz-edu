/**
 * CourseSessionController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const ErrorMessages = require('../../../../config/errors');
const moment = require('moment');
const accents = require('remove-accents');

module.exports = {
  add: async (req, res) => {
    sails.log.info("================================ CourseSessionController.add => START ================================");
    // GET ALL PARAMS
    if (!req.me) {
      return res.badRequest(ErrorMessages.SYSTEM_SESSION_EXPIRED);
    }
    const params = req.allParams();
    // CHECK TITLE & CODE
    if (!params.title || !params.title.trim().length) {
      return res.badRequest(ErrorMessages.COURSE_SESSION_TITLE_REQUIRED);
    }
    if (!params.code || !params.code.trim().length) {
      return res.badRequest(ErrorMessages.COURSE_SESSION_CODE_REQUIRED);
    }
    if (!params.branch || !params.branch.trim().length) {
      return res.badRequest(ErrorMessages.COURSE_SESSION_BRANCH_REQUIRED);
    }
    //CHECK DUPLICATE CODE
    let code = accents.remove(params.code).replace(/\s/g, '');
    const checkCode = await CourseSession.find({ code: code.toUpperCase(), school: req.me.school });
    if (checkCode.length > 0) return res.badRequest(ErrorMessages.COURSE_SESSION_CODE_DUPLICATED);
    // PREPARE DATA COURSE SESSION
    const newData = {
      title: params.title, // REQUIRED
      code: code.toUpperCase(), // REQUIRED
      startTime: params.startTime,
      endTime: params.endTime,
      branchOfSession: params.branch,
      status: params.status ? Number.parseInt(params.status) : sails.config.custom.STATUS.DRAFT,
      school: req.me.school
    }; 
    // ADD NEW DATA COURSE SESSION
    const newCourseSession = await CourseSessionService.add(newData);

    // RETURN DATA COURSE SESSION
    return res.ok(newCourseSession);
  },

  get: async (req, res) => {
    sails.log.info("================================ CourseSessionController.get => START ================================");
    // GET ALL PARAMS
    let params = req.allParams();
    if (!params.id) {
      return res.badRequest(ErrorMessages.COURSE_SESSION_ID_REQUIRED);
    }

    // QUERY & CHECK DATA COURSE SESSION
    let courseSessions = await CourseSessionService.get({
      id: params.id
    });
    if (!courseSessions) {
      return res.notFound(ErrorMessages.COURSE_SESSION_NOT_FOUND);
    }
    // RETURN DATA COURSE SESSION
    return res.json(courseSessions);
  },

  edit: async (req, res) => {
    sails.log.info("================================ CourseSessionController.edit => START ================================");
    // GET ALL PARAMS
    if (!req.me)  return res.badRequest(ErrorMessages.SYSTEM_SESSION_EXPIRED);
    let params = req.allParams();
    // CHECK TITLE & CODE
    if (!params.title || !params.title.trim().length)  return res.badRequest(ErrorMessages.COURSE_SESSION_TITLE_REQUIRED);
    if (!params.code || !params.code.trim().length) return res.badRequest(ErrorMessages.COURSE_SESSION_CODE_REQUIRED);

    // CHECK DATA COURSE SESSION
    let courseSessions = await CourseSessionService.get({ id: params.id });
    if (!courseSessions) return res.notFound(ErrorMessages.COURSE_SESSION_NOT_FOUND);

    //CHECK DUPLICATE CODE
    let code = accents.remove(params.code).replace(/\s/g, '');
    const checkCode = await CourseSession.findOne({ id: { '!=': params.id }, code: code.toUpperCase(), school: req.me.school });
    if (checkCode) return res.badRequest(ErrorMessages.COURSE_SESSION_CODE_DUPLICATED);
    // PREPARE DATA COURSE SESSION
    const editData = {
      title: params.title, // REQUIRED
      code: code.toUpperCase(), // REQUIRED
      startTime: params.startTime,
      endTime: params.endTime,
      branchOfSession: params.branch,
      status: params.status ? Number.parseInt(params.status) : sails.config.custom.STATUS.DRAFT
    };

    // UPDATE DATA COURSE SESSION
    let editObj = await CourseSessionService.edit({ id: params.id }, editData);

    // RETURN DATA COURSE SESSION
    return res.json({
      status: 1,
      data: editObj
    });
  },

  trash: async (req, res) => {
    sails.log.info("================================ CourseSessionController.trash => START ================================");
    // GET ALL PARAMS
    let params = req.allParams();
    if (!params.ids) return res.badRequest(ErrorService.COURSE_SESSION_ID_REQUIRED);
    // Call constructor with custom options:
    let data = { status: sails.config.custom.STATUS.TRASH };
    let ids = params.ids;
    if (params.ids.indexOf(';') != -1) {
      ids = ids.split(';');
    }
    if (typeof (ids) == 'object') {
      for (var i = 0; i < ids.length; i++) {
        let courseSessionsObj = await CourseSessionService.get({ id: ids[i] });
        if (!courseSessionsObj) return res.notFound(ErrorMessages.COURSESESSION_OBJECT_NOT_FOUND);
        //not allow delete course session which have class
        let classes = await Class.find({ courseSession: ids[i] });
        if (classes && classes.length != 0) return res.badRequest(ErrorMessages.CAN_NOT_DELETE_COURSE_SESSION_HAVE_CLASS);
        CourseSessionService.del({ id: ids[i] });

        // let courseSessionsObj = await CourseSessionService.get({ id: ids[i] });
        // if (!courseSessionsObj) return res.notFound(ErrorMessages.COURSESESSION_OBJECT_NOT_FOUND);
        // //not allow delete course session which have class
        // let classes = await Class.find({ courseSession: ids[i] });
        // if (classes && classes.length != 0) return res.badRequest(ErrorMessages.CAN_NOT_DELETE_COURSE_SESSION_HAVE_CLASS);

        // //If status Class == 3 => Delete Class
        // if (courseSessionsObj.status == 3) {
        //   CourseSessionService.del({ id: ids[i] });
        // } else {
        //   await CourseSession.update(ids[i]).set(data);
        // }
      }
    } else {
      //ALWAYS CHECK  OBJECT EXIST
      let courseSessionsObj = await CourseSessionService.get({ id: ids });
      if (!courseSessionsObj) return res.notFound(ErrorMessages.COURSESESSION_OBJECT_NOT_FOUND);
      
      //not allow delete course session which have class
      let classes = await Class.find({ courseSession: ids });
      if (classes && classes.length != 0) return res.badRequest(ErrorMessages.CAN_NOT_DELETE_COURSE_SESSION_HAVE_CLASS);
      CourseSessionService.del({ id: ids });

      //  //ALWAYS CHECK  OBJECT EXIST
      //  let courseSessionsObj = await CourseSessionService.get({ id: ids });
      // if (!courseSessionsObj) return res.notFound(ErrorMessages.COURSESESSION_OBJECT_NOT_FOUND);
      
      // //not allow delete course session which have class
      // let classes = await Class.find({ courseSession: ids });
      // if (classes && classes.length != 0) return res.badRequest(ErrorMessages.CAN_NOT_DELETE_COURSE_SESSION_HAVE_CLASS);

      //  //If status Class == 3 => Delete Class
      //  if (courseSessionsObj.status == 3) {
      //   CourseSessionService.del({ id: ids });
      //  } else {
      //    await CourseSession.update(ids).set(data);
      //  }
    }
    return res.ok();
  },

  search: async (req, res) => {
    sails.log.info("================================ CourseSessionController.search => START ================================");
    let params = req.allParams(); 
    let keyword = params.search ? params.search.value : null;
    let draw = (params.draw) ? parseInt(params.draw) : 1;
    let limit = (params.length) ? parseInt(params.length) : null;
    let skip = (params.start) ? parseInt(params.start) : null;
    let webSettings = res.locals.webSettings;
    let dateFormat = webSettings.value.dateFormat;
    
    //check role of current logged in user
    let schoolObj = await School.findOne({ id: req.me.school });
    let isMainSchoolAdmin = 3 == req.me.userType ? true : false;
    let isHavePermissionEdit = false;
    let isHavePermissionDelete = false;
    if (!isMainSchoolAdmin && req.me.role && req.me.role.permissions && req.me.role.permissions.album) {
      isHavePermissionEdit = req.me.role.permissions.album.edit ? true : false;
      isHavePermissionDelete = req.me.role.permissions.album.delete ? true : false;
    }

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
      { status: params.status ? parseInt(params.status) : 1 },
      { school: new mongo.ObjectID(req.me.school) }
    ];
    
    /**SEARCH CASE_INSENSITIVE */
    const collection = CourseSession.getDatastore().manager.collection(CourseSession.tableName);
    let result = [];
    if (params.length && params.start) {
      result = await collection.find(where).limit(limit).skip(skip).sort(newSort);
    } else {
      result = await collection.find(where).sort(newSort);
    }
    const totalCourseSession = await collection.count(where);
    const dataWithObjectIds = await result.toArray();
    const arrObjCourseSessions = JSON.parse(JSON.stringify(dataWithObjectIds).replace(/"_id"/g, '"id"'));

    //END IF TITLE
    // let arrObjCourseSessions = await CourseSessionService.find(where, limit, skip, sort);
    //RESPONSE COURSE SESSIONS
    let resCourseSessions = []; 
    for (let courseSession of arrObjCourseSessions) {
      let tmpData = {};
      tmpData.id = '<input class="js-checkbox-item" type="checkbox" value="' + courseSession.id + '">';
      tmpData.code = courseSession.code; 
      tmpData.tool = await sails.helpers.renderRowAction(courseSession, isMainSchoolAdmin, isHavePermissionEdit, isHavePermissionDelete);
      tmpData.title = courseSession.title;
      
      tmpData.status = '';
      if (isMainSchoolAdmin || isHavePermissionEdit) {
        if (courseSession.status == 1) {
          tmpData.status = `
            <label class="switch">
              <input class="switchStatus" type="checkbox" data-id="${courseSession.id}" checked>
              <span class="slider"></span>
            </label>`;
        } else {
          tmpData.status = `
            <label class="switch">
              <input class="switchStatus" type="checkbox" data-id="${courseSession.id}">
              <span class="slider"></span>
            </label>`;
        }
      } else {
        if (courseSession.status == 1) {
          tmpData.status = '<label class="badge badge-success">' + sails.__("Active") + '</label>';
        } else {
          tmpData.status = '<label class="badge badge-warning">' + sails.__("Draft") + '</label>';
        }
      }
      tmpData.startTime = moment(courseSession.startTime, "YYYY-MM-DD").format(dateFormat);
      tmpData.endTime = moment(courseSession.endTime, "YYYY-MM-DD").format(dateFormat);
      resCourseSessions.push(tmpData);
    };
    //END RESPONSE COURSE SESSIONS
    // let totalCourseSession = await CourseSessionService.count(where);
    return res.ok({ draw: draw, recordsTotal: totalCourseSession, recordsFiltered: totalCourseSession, data: resCourseSessions });
  },
  
  switchStatus: async (req, res) => {
    sails.log.info("================================ CourseSessionController.switchStatus => START ================================");
    // // GET ALL PARAMS
    const params = req.allParams();
    if (!params.id) return res.badRequest(ErrorMessages.COURSE_SESSION_ID_REQUIRED);

    //CHECK OBJ IS EXISTED?
    let courseSessionObj = await CourseSessionService.get({ id: params.id });
    if (!courseSessionObj) return res.badRequest(ErrorMessages.COURSE_SESSION_NOT_FOUND);

    //switch status of current obj
    if (courseSessionObj.status == 1) courseSessionObj = await CourseSessionService.edit({ id: params.id }, { status: 0 });
    else courseSessionObj = await CourseSessionService.edit({ id: params.id }, { status: 1 });

    return res.json(courseSessionObj);
    // END UPDATE
  },
  switchSession: async (req, res) => {
    sails.log.info("================================ CourseSessionController.switchSession => START ================================");
    // // GET ALL PARAMS
    const params = req.allParams();
    if (!params.id) return res.badRequest(ErrorMessages.COURSE_SESSION_ID_REQUIRED);

    //CHECK OBJ IS EXISTED?
    let courseSessionObj = await CourseSessionService.get({ id: params.id });
    if (!courseSessionObj) return res.badRequest(ErrorMessages.COURSE_SESSION_NOT_FOUND);

    return res.json(courseSessionObj);
    // END UPDATE
  },
};
