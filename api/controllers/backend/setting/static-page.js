

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
    
    if (this.req.originalUrl.indexOf(_cust.URL.SETTING_WEB_DKSD) != -1){
      _default = _.extend({
        CURRENT_PAGE: _cust.PAGE.SETTING_WEB_DKSD,
        contentTop: {
          caption: sails.__('Sidebar.Setting.Web')
        }
      }, _default);
    } else if (this.req.originalUrl.indexOf(_cust.URL.SETTING_WEB_CHINHSACH) != -1){
      _default = _.extend({
        CURRENT_PAGE: _cust.PAGE.SETTING_WEB_CHINHSACH,
        contentTop: {
          caption: sails.__('Sidebar.Setting.Web')
        }
      }, _default);
    } else {
      _default = _.extend({
        CURRENT_PAGE: _cust.PAGE.SETTING_WEB_BAOMAT,
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

    return exits.success(_default);
  }

};