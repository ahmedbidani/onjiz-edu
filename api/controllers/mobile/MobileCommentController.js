/**
 * CommentController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
*/
const ErrorMessage = require('../../../config/errors');
const CommentService = require('../../services/CommentService');
//Library
const moment = require('moment');

module.exports = {

  add: async (req, res) => {
    sails.log.info("================================ CommentController.add => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();
    // CHECK CONTENT PARAMS
    if (!params.contentCmt || !params.contentCmt.trim().length) {
      return res.badRequest(ErrorMessage.COMMENT_ERR_CONTENT_REQUIRED);
    }
    // PREPARE DATA COMMENT
    const newData = {
      contentCmt: params.contentCmt, // REQUIRED
      status: params.status ? params.status : sails.config.custom.STATUS.DRAFT,

    };

    // ADD NEW DATA COMMENT
    const newComment = await CommentService.add(newData);

    // RETURN DATA COMMENT
    return res.ok(newComment);
  },

  get: async (req, res) => {
    sails.log.info("================================ CommentController.get => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();
    // CHECK ID PARAM
    if (!params.id) {
      return res.badRequest(ErrorMessage.COMMENT_ERR_ID_REQUIRED);
    }
    // QUERY & CHECK DATA COMMENT
    const comments = await CommentService.get({
      id: params.id
    });
    if (!comments) {
      return res.notFound(ErrorMessage.COMMENT_ERR_NOT_FOUND);
    }
    // RETURN DATA COMMENT
    return res.json({
      data: comments
    });
  },

  edit: async (req, res) => {
    sails.log.info("================================ CommentController.edit => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();
    // CHECK CONTENT PARAMS
    if (!params.contentCmt || !params.contentCmt.trim().length) {
      return res.badRequest(ErrorMessage.COMMENT_ERR_CONTENT_REQUIRED);
    }
    // PREPARE DATA COMMENT
    const newData = {
      contentCmt: params.contentCmt, // REQUIRED
      status: params.status ? params.status : sails.config.custom.STATUS.DRAFT,

    };

    // CHECK DATA COMMENT
    const comments = CommentService.get({
      id: params.id
    });
    if (!comments) {
      return res.notFound(ErrorMessage.COMMENT_ERR_NOT_FOUND);
    }

    // UPDATE DATA COMMENT
    const editObj = await CommentService.edit({
      id: params.id
    }, newData);

    // RETURN DATA COMMENT
    return res.json({
      data: editObj
    });
  },

  trash: async (req, res) => {
    sails.log.info("================================ CommentController.trash => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();

    // CHECK IDS PARAM
    if (!params.ids || !params.ids.length) {
      return res.badRequest(ErrorMessage.COMMENT_ERR_ID_REQUIRED);
    }

    // CHECK COMMENT & UPDATE
    const comments = await CommentService.find({
      id: params.ids
    });
    if (typeof params.ids === 'string') {
      if (!comments.length) {
        return res.badRequest(ErrorMessage.COMMENT_ERR_NOT_FOUND);
      } else {
        // nothing to do
      }
    } else {
      if (comments.length !== params.ids.length) {
        return res.badRequest(ErrorMessage.COMMENT_ERR_NOT_FOUND);
      } else {
        // nothing to do
      }
    }

    await Comment.update({
      id: params.ids
    }).set({
      status: 3
    });

    // RETURN DATA
    return res.json();
  },

  search: async (req, res) => {
    sails.log.info("================================ CommentController.search => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();

    // PREAPARE BODY PARAMS
    const bodyParams = {
      keyWord: (params.keyWord && params.keyWord.trim().length) ? params.keyWord : null,
      limit: params.limit ? Number(params.limit) : null,
      offset: params.offset ? Number(params.offset) : null,
      sort: (params.sort && params.sort.trim().length) ? JSON.parse(params.sort) : null
    };
    let where = {
      status: {
        '>=': 0
      }
    };
    let condition;
    if (params.condition && !Utils.isJsonString(params.condition)) {
      return res.serverError(ErrorService.SYSTEM_JSON_FORMAT_FAIL);
    } else {
      condition = (params.condition) ? JSON.parse(params.condition) : null;
    }

    if (typeof bodyParams.keyWord === "string" && bodyParams.keyWord.trim().length) {
      where = {
        or: [{
          name: {
            contains: bodyParams.keyWord
          }
        }]
      };
    }
    if (condition) {
      where = condition;
    }
    // QUERY DATA COMMENT
    const comments = await CommentService.find(where, bodyParams.limit, bodyParams.offset, bodyParams.sort),
      total = await CommentService.count(where);

    // RETURN DATA COMMENTS
    return res.json({
      recordsTotal: total,
      data: comments
    });
  }
};
