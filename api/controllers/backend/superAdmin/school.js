module.exports = {
  exits: {
    success: {
      viewTemplatePath: 'backend/superAdmin/school/index',
      description: 'Display the dashboard for authenticated users.'
    },
    redirect: {
      responseType: 'redirect'
    }
  },
  fn: async function (inputs, exits) {
    if (!this.req.me) {
      throw { redirect: '/backend/login' };
    }
    let _default = await sails.helpers.getSaDefaultData(this.req);
    let params = this.req.allParams();
    let status = (params.status) ? (params.status) : -1;
    _default.status = status;
    return exits.success(_default);

  }
};
