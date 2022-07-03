
/**
 * news/detail.js
 *
 * @description :: Server-side controller action for handling incoming requests.
 * @help        :: See https://sailsjs.com/documentation/concepts/controllers
 */
let moment = require('moment');
module.exports = {
  inputs: {},
  exits: {
    success: {
      viewTemplatePath: 'frontend/pages/news/detail',
    },
    redirect: {
      responseType: 'redirect'
    }
  },

  fn: async function (inputs, exits) {
    sails.log.info("================================ controllers/frontend/detail ================================");
    
    let _default = await sails.helpers.getFeDefaultData(this.req)
      .tolerate('noSchoolFound', () => {
        throw { redirect: '/login' };
      });

   
    let postId = _default.params.id ? _default.params.id : null;
    let postObj = await PostService.get({id: postId});  
    let listCategories = await TaxonomyService.find({ status: _default.STATUS.ACTIVE, type: 'category', school: _default.school.id });
    let cateActive = await Post_Category.find({ postsOfCat: postId });
    cateActive = cateActive.map((item) => item.category);
    
    //PREPARE DATA LASTEST POSTS
    let listLastestPost = await PostService.find({ status: _default.STATUS.ACTIVE, type: _default.TYPE.NEWS, id: { '!=': postId }, school: _default.school.id }, 10);
   
    _default.postObj = postObj;
    _default.cateActive = cateActive;
    _default.listCategories = listCategories;
    _default.listLastestPost = listLastestPost;
    _default.moment = moment;
    return exits.success(_default);
  }
};