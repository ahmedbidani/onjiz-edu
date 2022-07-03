
const FoodService = require('../../../services/MediaService');

/**
 * taxonomy/list-taxonomy.js
 *
 * @description :: Server-side controller action for handling incoming requests.
 * @help        :: See https://sailsjs.com/documentation/concepts/controllers
 */
module.exports = {
  exits: {
    success: {
      viewTemplatePath: 'backend/pages/media/list',
    },
    redirect: {
      responseType: 'redirect'
    }
  },
  fn: async function (inputs, exits) {
    let _default = await sails.helpers.getDefaultData(this.req);
    let params = this.req.allParams();
    let status = (params.status) ? (params.status) : -1;
    let type = _default.TYPE.FOOD;
    // if (_default.CURRENT_PAGE == _default.BACKEND.TAG.ID){
    //   //Remember CURRENT_PAGE will be defined at helpers.getDefaultData with request params (this.req)
    //   type = _default.TYPE.TAG;
    // }
    sails.log.info("================================ controllers/backend/media/list => TYPE ================================");
  

    let totalAll = await MediaService.count({ school: this.req.me.school });
    let totalActive = await MediaService.count({type:type,status: _default.STATUS.ACTIVE, school: this.req.me.school});
    let totalDraft = await MediaService.count({type:type,status: _default.STATUS.DRAFT, school: this.req.me.school}); 

    _default.type = type;
    _default.status = status;
    _default.totalAll = totalAll;
    _default.totalActive = totalActive;
    _default.totalDraft = totalDraft; 
    
    sails.log.info("================================ controllers/backend/media/list => _default =============================");
  
    
    return exits.success(_default);
  }

};