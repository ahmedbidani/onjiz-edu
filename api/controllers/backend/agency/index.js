module.exports = {
    exits: {
      success: {
        viewTemplatePath: 'backend/agency/index',
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
      let _default = await sails.helpers.getAgDefaultData(this.req);
      return exits.success(_default);
    }
  };
  