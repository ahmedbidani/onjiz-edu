

/**
 * taxonomy/view-taxonomy.js
 *
 * @description :: Server-side controller action for handling incoming requests.
 * @help        :: See https://sailsjs.com/documentation/concepts/controllers
 */
module.exports = {

  friendlyName: 'Web Setting Management',

  description: 'Web Setting Management',

  inputs: {

  },

  exits: {

    success: {
      viewTemplatePath: 'zadmin/pages/setting/index',
    },

    redirect: {
      responseType: 'redirect'
    }

  },

  fn: async function (inputs, exits) {

    if (!this.req.administrator) {
      throw { redirect: '/zadmin' };
    }

    //init
    let _cust = sails.config.custom;
    let _paging = _cust.PAGING;
    let _default = await sails.helpers.getDefaultData();
    
    if (this.req.originalUrl.indexOf(_cust.URL.SETTING_WEB_HOMEKID) != -1){
      _default = _.extend({
        CURRENT_PAGE: _cust.PAGE.SETTING_WEB_HOMEKID,
        contentTop: {
          caption: sails.__('Sidebar.Setting.Web')
        }
      }, _default);
    } else if (this.req.originalUrl.indexOf(_cust.URL.SETTING_WEB_HOME) != -1){
      _default = _.extend({
        CURRENT_PAGE: _cust.PAGE.SETTING_WEB_HOME,
        contentTop: {
          caption: sails.__('Sidebar.Setting.Web')
        }
      }, _default);
    } else if (this.req.originalUrl.indexOf(_cust.URL.SETTING_WEB_SHOP) != -1){
      _default = _.extend({
        CURRENT_PAGE: _cust.PAGE.SETTING_WEB_SHOP,
        contentTop: {
          caption: sails.__('Sidebar.Setting.Web')
        }
      }, _default);
    } else if (this.req.originalUrl.indexOf(_cust.URL.SETTING_WEB_ADVERTISEMENT) != -1){
      _default = _.extend({
        CURRENT_PAGE: _cust.PAGE.SETTING_WEB_ADVERTISEMENT,
        contentTop: {
          caption: sails.__('Sidebar.Setting.Web')
        }
      }, _default);
    } else if (this.req.originalUrl.indexOf(_cust.URL.SETTING_WEB_GENERAL) != -1){
      _default = _.extend({
        CURRENT_PAGE: _cust.PAGE.SETTING_WEB_GENERAL,
        contentTop: {
          caption: sails.__('Sidebar.Setting.Web')
        }
      }, _default);
    }
    
    let settings = await GeneralSetting.find();

    if(settings.length) {
      _default.editGenSetting = settings[0];
    } else {
      _default.editGenSetting = {};      
    }

    if (this.req.originalUrl.indexOf(_cust.URL.SETTING_WEB_SHOP) != -1){
      //[START] build tree category multi level
      _default.treeCategory = [];
      let allCategories = await ProductCategory.listAllProductCategory();
      let recursiveMenu = (cont, listCategories, parentId = 0, space = '') => {
        _.each(listCategories, (cate, index) => {
          if (cate.parent == parentId) {
            cate.space = space;
            cont.push(cate);
            recursiveMenu(cont, listCategories, cate.id, space + '|-- ');
          }
        });
      };
      recursiveMenu(_default.treeCategory, allCategories);
      //[END] build tree category multi level
    } else {
      //get playlist
      _default.allPlaylist = await Taxonomy.listAllPlaylist();
      _default.allParentCategories = await Taxonomy.listAllParentCategory();
      //[START] build tree category multi level
      _default.treeCategory = [];
      let allCategories = await Taxonomy.listAllCategory();   
      let recursiveMenu = (cont, listCategories, parentId = 0, space = '') => {
        _.each(listCategories, (cate, index) => {
          if (cate.parent == parentId) {
            cate.space = space;
            cont.push(cate);
            recursiveMenu(cont, listCategories, cate.id, space + '|-- ');
          }
        });
      };
      recursiveMenu(_default.treeCategory, allCategories);
      //[END] build tree category multi level 
    }

    return exits.success(_default);
  }

};