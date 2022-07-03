
/**
 * news/index.js
 *
 * @description :: Server-side controller action for handling incoming requests.
 * @help        :: See https://sailsjs.com/documentation/concepts/controllers
 */
module.exports = {
  inputs: {},
  exits: {
    success: {
      viewTemplatePath: 'frontend/pages/news/index',
    },
    redirect: {
      responseType: 'redirect'
    }
  },

  fn: async function (inputs, exits) {
    sails.log.info("================================ controllers/frontend/news ================================");
    
    let _default = await sails.helpers.getFeDefaultData(this.req)
      .tolerate('noSchoolFound', () => {
        throw { redirect: '/login' };
      });

    let page = _default.params.page ? parseInt(_default.params.page) : 1;
    let catID = _default.params.category ? _default.params.category : null;
    let limit = _default.PAGING.LIMIT;
    let skip = (page - 1) * limit;
    let where = {
      status: sails.config.custom.STATUS.ACTIVE,
      type: sails.config.custom.TYPE.NEWS,
      school: _default.school.id
    };
    let listCategories = await TaxonomyService.find({ status: _default.STATUS.ACTIVE, type: 'category', school: _default.school.id });

    if (catID != null) {
      let listPostCate = await Post_Category.find({ category: catID });
      let postIds = listPostCate.map((item) => item.postsOfCat);
      where.id = { 'in': postIds };
    }

    let listNews = await PostService.find(where, limit, skip);
    let count = await Post.count(where);
    let numberOfPages = Math.ceil(count / limit);
    
    _default.listCategories = listCategories;
    _default.listNews = listNews;
    _default.numberOfPages = numberOfPages;
    return exits.success(_default);
  }
};