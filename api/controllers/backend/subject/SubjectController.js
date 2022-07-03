/**
 * SubjectController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const ErrorMessages = require('../../../../config/errors');
const accents = require('remove-accents');

module.exports = {
  add: async (req, res) => {
    sails.log.info("================================ SubjectController.add => START ================================");
    // GET ALL PARAMS
    if (!req.me) {
      return res.badRequest(ErrorMessages.SYSTEM_SESSION_EXPIRED);
    }
    const params = req.allParams();
    // CHECK TITLE & CODE
    if (!params.title || !params.title.trim().length) {
      return res.badRequest(ErrorMessages.SUBJECT_TITLE_REQUIRED);
    }
    if (!params.code || !params.code.trim().length) {
      return res.badRequest(ErrorMessages.SUBJECT_CODE_REQUIRED);
    }
    //CHECK DUPLICATE CODE
    let code = accents.remove(params.code).replace(/\s/g, '');
    const checkCode = await Subject.findOne({ code: code, school: req.me.school });
    if (checkCode) return res.badRequest( ErrorMessages.SUBJECT_CODE_DUPLICATED );
    // PREPARE DATA SUBJECT
    const newData = {
      title: params.title, // REQUIRED
      code: code, // REQUIRED
      description: params.description,
      // classObj: params.class,
      // courseSession: req.session.courseSessionActive,
      status: params.status ? Number.parseInt(params.status) : sails.config.custom.STATUS.DRAFT,
      school: req.me.school
    };

    // ADD NEW DATA SUBJECT
    const newSubject = await SubjectService.add(newData);

    // RETURN DATA SUBJECT
    return res.ok(newSubject);
  },

  get: async (req, res) => {
    sails.log.info("================================ SubjectController.get => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();
    if (!params.id) {
      return res.badRequest(ErrorMessages.SUBJECT_ID_REQUIRED);
    }

    // QUERY & CHECK DATA SUBJECT
    const subjects = await SubjectService.get({
      id: params.id
    });
    if (!subjects) {
      return res.notFound(ErrorMessages.SUBJECT_NOT_FOUND);
    }
    // RETURN DATA SUBJECT
    return res.json(subjects);
  },

  edit: async (req, res) => {
    sails.log.info("================================ SubjectController.edit => START ================================");
    // GET ALL PARAMS
    if (!req.me) {
      return res.badRequest(ErrorMessages.SYSTEM_SESSION_EXPIRED);
    }
    const params = req.allParams();
    // CHECK TITLE & CODE
    if (!params.title || !params.title.trim().length) {
      return res.badRequest(ErrorMessages.SUBJECT_TITLE_REQUIRED);
    }
    if (!params.code || !params.code.trim().length) {
      return res.badRequest(ErrorMessages.SUBJECT_CODE_REQUIRED);
    }
    //CHECK DUPLICATE CODE
    let code = accents.remove(params.code).replace(/\s/g, '');
    const checkCode = await Subject.findOne({ id: { '!=': params.id }, code: code, school: req.me.school });
    if (checkCode) {
      return res.badRequest( ErrorMessages.SUBJECT_CODE_DUPLICATED );
    }
    // PREPARE DATA SUBJECT
    const editData = {
      title: params.title, // REQUIRED
      code: code, // REQUIRED
      nutrition: params.nutrition,
      description: params.description,
      // courseSession: req.session.courseSessionActive,
      status: params.status ? Number.parseInt(params.status) : sails.config.custom.STATUS.DRAFT
    };

    // CHECK DATA SUBJECT
    const subjects = SubjectService.get({ id: params.id });
    if (!subjects) {
      return res.notFound(ErrorMessages.SUBJECT_NOT_FOUND);
    }

    // UPDATE DATA SUBJECT
    const editObj = await SubjectService.edit({ id: params.id }, editData);

    // RETURN DATA SUBJECT
    return res.json({
      status: 1,
      data: editObj
    });
  },

  trash: async (req, res) => {
    sails.log.info("================================ SubjectController.trash => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();

    let deleteSubjectFromSchedule = async (subjectIds) => {
      let schedules = await Schedule.find({});
      if (schedules && schedules.length > 0) {
        for (let scheduleObj of schedules) {
          if (scheduleObj.slotSubjects && scheduleObj.slotSubjects.length > 0) {
            //remove subject which deleted from slotSubject of schedule
            let newSlotSubject = scheduleObj.slotSubjects.filter(item => !subjectIds.includes(item.subject));
            //update newSlotSubject for schedule
            if (newSlotSubject.length != scheduleObj.slotSubjects.length) {
              await Schedule.update({ id: scheduleObj.id }, { slotSubjects: newSlotSubject });
            }
          }
        }
      }
    }

    // CHECK IDS PARAM
    if (!params.ids || !params.ids.length) {
      return res.badRequest(ErrorMessages.SUBJECT_ID_REQUIRED);
    }
    let ids = params.ids;
    if (params.ids.indexOf(';') != -1) {
      ids = ids.split(';');
    }
    if (typeof (ids) == 'object') {
      for (var i = 0; i < ids.length; i++) {
        let subject = await SubjectService.get({ id: ids[i] });
        if (subject) SubjectService.del({ id: ids[i] });
      }
      
      deleteSubjectFromSchedule(ids);
    } else {
      let subject = await SubjectService.get({ id: ids });
      if (subject) SubjectService.del({ id: ids });

      deleteSubjectFromSchedule([ids]);
    }
    // RETURN DATA
    return res.json({ status: 1 });
  },

  search: async (req, res) => {
    sails.log.info("================================ SubjectController.search => START ================================");
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
    //sort
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
      { school: new mongo.ObjectID(req.me.school )}
    ];
    if (params.status && params.status != '-1') {
      where.$and.push({ status: parseInt(params.status) });
    }
    /**SEARCH CASE_INSENSITIVE */
    const collection = Subject.getDatastore().manager.collection(Subject.tableName);
    let result = [];
    if (params.length && params.start) {
      result = await collection.find(where).limit(limit).skip(skip).sort(newSort);
    } else {
      result = await collection.find(where).sort(newSort);
    }
    const totalSubject = await collection.count(where);
    const dataWithObjectIds = await result.toArray();
    const arrObjSubjects = JSON.parse(JSON.stringify(dataWithObjectIds).replace(/"_id"/g, '"id"'));

    // let arrObjSubjects = await SubjectService.find(where, limit, skip, sort);
    let resSubjects = [];
    for (let subject of arrObjSubjects) {
      let tmpData = {};
      tmpData.id = '<input class="js-checkbox-item" type="checkbox" value="' + subject.id + '">';
      tmpData.code = subject.code;
      tmpData.title = subject.title;
      tmpData.tool = await sails.helpers.renderRowAction(subject, isMainSchoolAdmin, isHavePermissionEdit, isHavePermissionDelete);
      if (subject.description && subject.description.trim().length > 0) {
        tmpData.description = subject.description;
      } else {
        tmpData.description = '-';
      }
      
      tmpData.status = '';
      if (isMainSchoolAdmin || isHavePermissionEdit) {
        if (subject.status == 1) {
          tmpData.status = `
            <label class="switch">
              <input class="switchStatus" type="checkbox" data-id="${subject.id}" checked>
              <span class="slider"></span>
            </label>`;
        } else {
          tmpData.status = `
            <label class="switch">
              <input class="switchStatus" type="checkbox" data-id="${subject.id}">
              <span class="slider"></span>
            </label>`;
        }
      } else {
        if (subject.status == 1) {
          tmpData.status = '<label class="badge badge-success">' + sails.__("Active") + '</label>';
        } else {
          tmpData.status = '<label class="badge badge-warning">' + sails.__("Draft") + '</label>';
        }
      }
      resSubjects.push(tmpData);
    };
    // let totalSubject = await SubjectService.count(where);
    return res.ok({ draw: draw, recordsTotal: totalSubject, recordsFiltered: totalSubject, data: resSubjects });
  },
  
  switchStatus: async (req, res) => {
    sails.log.info("================================ SubjectController.switchStatus => START ================================");
    // // GET ALL PARAMS
    const params = req.allParams();
    if (!params.id) return res.badRequest(ErrorMessages.SUBJECT_ID_REQUIRED);

    //CHECK OBJ IS EXISTED?
    let subjectObj = await SubjectService.get({ id: params.id });
    if (!subjectObj) return res.badRequest(ErrorMessages.SUBJECT_NOT_FOUND);

    //switch status of current obj
    if (subjectObj.status == 1) subjectObj = await SubjectService.edit({ id: params.id }, { status: 0 });
    else subjectObj = await SubjectService.edit({ id: params.id }, { status: 1 });

    return res.json(subjectObj);
    // END UPDATE
  },
};
