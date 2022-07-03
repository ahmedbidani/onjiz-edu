module.exports = {
  friendlyName: 'View login',
  description: 'Display "Login" page.',
  exits: {
    success: {
      viewTemplatePath: 'frontend/pages/entrance/login',
    },
    redirect: {
      description: 'The requesting user is already logged in.',
      responseType: 'redirect'
    }
  },

  fn: async function (inputs, exits) {
    let _default = await sails.helpers.getFeDefaultData(this.req);
      
    return exits.success(_default);
  }
};
