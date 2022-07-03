/**
 * PostController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
*/
const ErrorMessage = require('../../../config/errors');
const PostService = require('../../services/PostService');
const MediaService = require('../../services/MediaService');
const CommentService = require('../../services/CommentService');

//Library
const moment = require('moment');

module.exports = {

  list: async (req, res) => {
    let params = req.allParams();
    if (!params.school) return res.badRequest(ErrorMessage.SCHOOL_ID_REQUIRED);

    let limit  = params.limit ? Number(params.limit) : 10;
    let page  = params.page ? Number(params.page) : 1;
    let posts = await PostService.find({
      status: sails.config.custom.STATUS.ACTIVE,
      school: params.school
    }, limit, (page - 1) * limit, params.sort);

    return res.json({
      code: 'SUCCESS_200',
      data: posts
    });
  },
  addComment: async (req, res) => {
    let params = req.allParams();
    // CHECK CONTENT PARAMS
    if (!params.contentCmt || !params.contentCmt.trim().length) {
      return res.badRequest(ErrorMessage.COMMENT_ERR_CONTENT_REQUIRED);
    }
    const newData = {
      contentCmt: params.contentCmt, // REQUIRED
    };
    // ADD NEW DATA COMMENT
    const newComment = await CommentService.add(newData);

    // RETURN DATA COMMENT
    return res.ok(newComment);
  },

  get: async (req, res) => {
    // GET ALL PARAMS
    const params = req.allParams();

    // CHECK ID PARAM
    if (!params.id) {
      return res.badRequest(ErrorMessage.POST_ERR_ID_REQUIRED);
    }
    const post = await PostService.get({
      id: params.id
    });

    if (post.thumbnail != '') {
      let objMedia = await MediaService.get({
        id: post.thumbnail
      });
      if (objMedia) {
        post.thumbnail = objMedia;
      }
    }

    if (!post) {
      return res.notFound(ErrorMessage.ERR_NOT_FOUND);
    }

    // RETURN DATA POST
    return res.json({
      data: post
    });
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
            contains: bodyParams.filter.keyWord
          }
        }, {
          motto: {
            contains: bodyParams.filter.keyWord
          }
        }]
      }
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

    // QUERY DATA  POST
    const posts = await PostService.find(where, bodyParams.limit, bodyParams.offset, bodyParams.sort),
      total = await PostService.count({
        status: {
          '>=': sails.config.custom.STATUS.ALL
        }
      }),
      trash = await PostService.count({ status: sails.config.custom.STATUS.TRASH }),
      publish = await PostService.count({ status: sails.config.custom.STATUS.ACTIVE });

    // RETURN DATA POST
    return res.json({
      recordsTotal: total,
      recordsTrash: trash,
      recordsPublish: publish,
      data: posts
    });
  }
};
