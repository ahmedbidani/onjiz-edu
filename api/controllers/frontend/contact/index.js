let moment = require('moment');

module.exports = {
  exits: {
    success: {
      viewTemplatePath: 'frontend/pages/contact/index',
      description: 'Display the contact page.'
    },
    redirect: {
      responseType: 'redirect'
    }
  },
  fn: async function (inputs, exits) {
    let _default = await sails.helpers.getFeDefaultData(this.req)
      .tolerate('noSchoolFound', () => {
        throw { redirect: '/login' };
      });

    return exits.success(_default);

  }
};
