module.exports = {
  exits: {
    success: {
      viewTemplatePath: 'backend/superAdmin/role/index',
      description: 'Display the role management for authenticated users.'
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
    let listRole = await Role.find({});
    _default.listRole = listRole;
    return exits.success(_default);

  }
};
