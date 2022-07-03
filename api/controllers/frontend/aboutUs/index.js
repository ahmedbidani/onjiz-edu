
/**
 * aboutUs/index.js
 *
 * @description :: Server-side controller action for handling incoming requests.
 * @help        :: See https://sailsjs.com/documentation/concepts/controllers
 */

module.exports = {
  inputs: {},
  exits: {
    success: {
      viewTemplatePath: 'frontend/pages/aboutUs/index',
    },
    redirect: {
      responseType: 'redirect'
    }
  },

  fn: async function (inputs, exits) {
    sails.log.info("================================ controllers/frontend/aboutUs ================================");
    
    let _default = await sails.helpers.getFeDefaultData(this.req)
      .tolerate('noSchoolFound', () => {
        throw { redirect: '/login' };
      });
 
    return exits.success(_default);
  }
};