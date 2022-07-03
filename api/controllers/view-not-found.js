const custom = sails.config.custom;

module.exports = {
  friendlyName: 'View login',
  description: 'Display "Login" page.',
  exits: {
    success: {
      viewTemplatePath: '404',
    },
    redirect: {
      description: 'The requesting user is already logged in.',
      responseType: 'redirect'
    }
  },

  fn: async function (inputs, exits) {
    return exits.success({
      lang: this.req.getLocale()    
    });
  }
};
