
/**
 * import/index.js
 *
 * @description :: Server-side controller action for handling incoming requests.
 * @help        :: See https://sailsjs.com/documentation/concepts/controllers
 */
module.exports = {
  exits: {
    success: {
      viewTemplatePath: 'backend/pages/import/medical',
    },
    redirect: {
      responseType: 'redirect'
    }
  },
  fn: async function (inputs, exits) {
    let params = this.req.allParams();
    let _default = await sails.helpers.getDefaultData(this.req);
    let schoolObj = await School.findOne({ id: _default.branchActiveObj.school });
    _default.schoolObj = schoolObj;
    _default.medical = params.id;
    return exits.success(_default);
  }

};