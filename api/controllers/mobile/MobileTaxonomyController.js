/**
 * TaxonomyController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
*/
const ErrorMessage = require('../../../config/errors');
const TaxonomyService = require('../../services/TaxonomyService');
//Library
const moment = require('moment');

module.exports = {
  add: async (req, res) => {
    // GET ALL PARAMS
    const params = req.allParams();

    // CHECK TITLE & ALIAS PARAMS
    if (!params.title || !params.title.trim().length) {
      return res.badRequest(ErrorMessage.TAXONOMY_ERR_TITLE_REQUIRED);
    } else if (!params.alias || !params.alias.trim().length) {
      return res.badRequest(ErrorMessage.TAXONOMY_ERR_ALIAS_REQUIRED);
    }

    // PREPARE DATA TAXONOMY
    const newData = {
      title: params.title, // REQUIRED
      alias: params.alias, // REQUIRED
      description: (params.description && params.description.trim().length) ? params.description : '',
      parent: params.parent ? params.parent : '',
      type: (params.type && params.type !== 0) ? params.type : 0,
      order: (params.order && params.order !== 0) ? params.order : 1,
      status: (params.status && params.status !== 0) ? params.status : sails.config.custom.STATUS.DRAFT,

    };

    // ADD NEW DATA TAXONOMY
    const newTaxonomy = await TaxonomyService.add(newData);

    // RETURN DATA TAXONOMY
    return res.json({
      data: newTaxonomy
    });
  },

  get: async (req, res) => {
    // GET ALL PARAMS
    const params = req.allParams();

    // CHECK ID PARAM
    if (!params.id) {
      return res.badRequest(ErrorMessage.TAXONOMY_ERR_ID_REQUIRED);
    }

    // QUERY & CHECK DATA TAXONOMY
    const taxonomy = await TaxonomyService.get({
      id: params.id
    });
    if (!taxonomy) {
      return res.notFound(ErrorMessage.TAXONOMY_ERR_NOT_FOUND);
    }

    // RETURN DATA TAXONOMY
    return res.json({
      data: taxonomy
    });
  },

  edit: async (req, res) => {
    // GET ALL PARAMS
    const params = req.allParams();

    // CHECK TITLE & ALIAS PARAMS
    if (!params.title || !params.title.trim().length) {
      return res.badRequest(ErrorMessage.TAXONOMY_ERR_TITLE_REQUIRED);
    } else if (!params.alias || !params.alias.trim().length) {
      return res.badRequest(ErrorMessage.TAXONOMY_ERR_ALIAS_REQUIRED);
    }

    // PREPARE DATA TAXONOMY
    const newData = {
      title: params.title, // REQUIRED
      alias: params.alias, // REQUIRED
      description: (params.description && params.description.trim().length) ? params.description : '',
      parent: params.parent ? params.parent : '',
      type: (params.type && params.type !== 0) ? params.type : 0,
      order: (params.order && params.order !== 0) ? params.order : 1,
      status: (params.status && params.status !== 0) ? params.status : sails.config.custom.STATUS.DRAFT,

    };

    // CHECK DATA TAXONOMY
    const taxonomy = TaxonomyService.get({
      id: params.id
    });
    if (!taxonomy) {
      return res.notFound(ErrorMessage.TAXONOMY_ERR_NOT_FOUND);
    }

    // UPDATE DATA TAXONOMY
    const editObj = await TaxonomyService.edit({
      id: params.id
    }, newData);

    // RETURN DATA TAXONOMY
    return res.json({
      data: editObj[0]
    });
  },

  trash: async (req, res) => {
    // GET ALL PARAMS
    const params = req.allParams();

    // CHECK IDS PARAM
    if (!params.ids || !params.ids.length) {
      return res.badRequest(ErrorMessage.TAXONOMY_ERR_ID_REQUIRED);
    }

    // CHECK TAXONOMY & UPDATE
    const taxonomies = await TaxonomyService.find({
      id: params.ids
    });
    if (typeof params.ids === 'string') {
      if (!taxonomies.length) {
        return res.badRequest(ErrorMessage.TAXONOMY_ERR_NOT_FOUND);
      } else {
        // nothing to do
      }
    } else {
      if (taxonomies.length !== params.ids.length) {
        return res.badRequest(ErrorMessage.TAXONOMY_ERR_NOT_FOUND);
      } else {
        // nothing to do
      }
    }

    await Taxonomy.update({
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
          description: {
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

    // QUERY DATA TAXONOMY
    const Taxonomies = await TaxonomyService.find(where, bodyParams.limit, bodyParams.offset, bodyParams.sort),
      total = await TaxonomyService.count({
        status: {
          '>=': sails.config.custom.STATUS.ALL
        }
      }),
      trash = await TaxonomyService.count({ status: sails.config.custom.STATUS.TRASH }),
      publish = await TaxonomyService.count({ status: sails.config.custom.STATUS.ACTIVE });

    // RETURN DATA TAXONOMIES
    return res.json({
      recordsTotal: total,
      recordsTrash: trash,
      recordsPublish: publish,
      data: Taxonomies
    });
  }
};
