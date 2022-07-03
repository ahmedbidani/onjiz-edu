/**
 * SubjectController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
*/
const ErrorMessage = require('../../../config/errors');
const SubjectService = require('../../services/SubjectService');
//Library
const moment = require('moment');

module.exports = {
  list: async (req, res) => {
    // GET ALL PARAMS
    const params = req.allParams();
    if (!params.school) return res.badRequest(ErrorMessage.SCHOOL_ID_REQUIRED);

    subjects = await SubjectService.find({
      status: sails.config.custom.STATUS.ACTIVE,
      school: params.school
    }, params.limit, (params.page - 1) * params.limit, params.sort);

    // RETURN DATA NOTIFICATION
    return res.json({
      data: subjects
    });
  },

  add: async (req, res) => {
    sails.log.info("================================ SubjectController.add => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();

    // CHECK FULLNAME & EMAILADDRESS & GENDER PARAMS
    if (!params.title || !params.title.trim().length) {
      return res.badRequest(ErrorMessage.SUBJECT_ERR_TITLE_REQUIRED);
    } else if (!params.code || !params.code.trim().length) {
      return res.badRequest(ErrorMessage.SUBJECT_ERR_CODE_REQUIRED);
    } else if (!params.description || !params.description.trim().length) {
      return res.badRequest(ErrorMessage.SUBJECT_ERR_DESCRIPTION_REQUIRED);
    }

    // PREPARE DATA SUBJECT
    const newData = {
      title: params.title, // REQUIRED
      code: params.code, // REQUIRED
      alias: params.alias, // REQUIRED
      description: params.description, // REQUIRED
      status: params.status ? params.status : sails.config.custom.STATUS.DRAFT,
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

    // CHECK ID PARAM
    if (!params.id) {
      return res.badRequest(ErrorMessage.SUBJECT_ERR_ID_REQUIRED);
    }

    // QUERY & CHECK DATA SUBJECT
    const subjects = await SubjectService.get({
      id: params.id
    });
    if (!subjects) {
      return res.notFound(ErrorMessage.SUBJECT_ERR_NOT_FOUND);
    }

    // RETURN DATA SUBJECT
    return res.json({
      data: subjects
    });
  },

  edit: async (req, res) => {
    sails.log.info("================================ SubjectController.edit => START ================================");
    const params = req.allParams();

    // CHECK FULLNAME & EMAILADDRESS & GENDER PARAMS
    if (!params.title || !params.title.trim().length) {
      return res.badRequest(ErrorMessage.SUBJECT_ERR_TITLE_REQUIRED);
    } else if (!params.code || !params.code.trim().length) {
      return res.badRequest(ErrorMessage.SUBJECT_ERR_CODE_REQUIRED);
    } else if (!params.description || !params.description.trim().length) {
      return res.badRequest(ErrorMessage.SUBJECT_ERR_DESCRIPTION_REQUIRED);
    }

    // PREPARE DATA SUBJECT
    const newData = {
      title: params.title, // REQUIRED
      code: params.code, // REQUIRED
      alias: params.alias, // REQUIRED
      description: params.description, // REQUIRED
      status: params.status ? params.status : sails.config.custom.STATUS.DRAFT,
    };

    // CHECK DATA SUBJECT
    const subjects = SubjectService.get({
      id: params.id
    });
    if (!subjects) {
      return res.notFound(ErrorMessage.SUBJECT_ERR_NOT_FOUND);
    }

    // UPDATE DATA SUBJECT
    const editObj = await SubjectService.edit({
      id: params.id
    }, newData);

    // RETURN DATA SUBJECT
    return res.json({
      data: editObj
    });
  },

  trash: async (req, res) => {
    sails.log.info("================================ SubjectController.trash => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();

    // CHECK IDS PARAM
    if (!params.ids || !params.ids.length) {
      return res.badRequest(ErrorMessage.SUBJECT_ERR_ID_REQUIRED);
    }

    // CHECK SUBJECT & UPDATE
    const subjects = await SubjectService.find({
      id: params.ids
    });
    if (typeof params.ids === 'string') {
      if (!subjects.length) {
        return res.badRequest(ErrorMessage.SUBJECT_ERR_NOT_FOUND);
      } else {
        // nothing to do
      }
    } else {
      if (subjects.length !== params.ids.length) {
        return res.badRequest(ErrorMessage.SUBJECT_ERR_NOT_FOUND);
      } else {
        // nothing to do
      }
    }

    await Subject.update({
      id: params.ids
    }).set({
      status: sails.config.custom.STATUS.TRASH
    });

    // RETURN DATA
    return res.json();
  },

  search: async (req, res) => {
    // GET ALL PARAMS
    const params = req.allParams();

    // PREAPARE BODY PARAMS
    const bodyParams = {
      filter: (params.filter && params.filter.trim().length) ? JSON.parse(params.filter) : null,
      limit: params.limit ? Number(params.limit) : null,
      offset: params.offset ? Number(params.offset) : null,
      sort: (params.sort && params.sort.trim().length) ? JSON.parse(params.sort) : null
    };

    let where = {};
    if (bodyParams.filter.status) {
      where = {
        status: bodyParams.filter.status === sails.config.custom.STATUS.ALL ? {
          '>=': sails.config.custom.STATUS.ALL
        } : bodyParams.filter.status
      }
    } else if (bodyParams.filter.rangeDate.active) {
      where = {
        createdAt: {
          '>=': moment(bodyParams.filter.rangeDate.begin).valueOf(),
          '<=': moment(bodyParams.filter.rangeDate.end).valueOf()
        }
      }
    } else if (typeof bodyParams.filter.keyWord === "string" && bodyParams.filter.keyWord.trim().length) {
      where = {
        or: [{
          title: {
            contains: bodyParams.keyWord
          }
        }, {
          code: {
            contains: bodyParams.keyWord
          }
        }]
      };
    } else {
      // nothing to do
    }

    let condition;
    if (params.condition && !Utils.isJsonString(params.condition)) {
      return res.serverError(ErrorService.SYSTEM_JSON_FORMAT_FAIL);
    } else {
      condition = (params.condition) ? JSON.parse(params.condition) : null;
    }

    if (condition) {
      where = condition;
    }

    // QUERY DATA SUBJECT
    const subjects = await SubjectService.find(where, bodyParams.limit, bodyParams.offset, bodyParams.sort),
      total = await SubjectService.count({
        status: {
          '>=': sails.config.custom.STATUS.ALL
        }
      }),
      trash = await SubjectService.count({ status: sails.config.custom.STATUS.TRASH }),
      publish = await SubjectService.count({ status: sails.config.custom.STATUS.ACTIVE });

    // RETURN DATA SUBJECTS
    return res.json({
      recordsTotal: total,
      recordsTrash: trash,
      recordsPublish: publish,
      data: subjects
    });
  }
};
