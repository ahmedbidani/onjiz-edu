module.exports = {
    exits: {
      success: {
        viewTemplatePath: 'backend/agency/formProfile',
      },
      redirect: {
        responseType: 'redirect'
      }
    },
    fn: async function (inputs, exits) {
      let agency = {};
      let _default = await sails.helpers.getSaDefaultData(this.req);
        agency = await Agency.findOne({ id: this.req.param('id') });
      _default.agencyData = agency;
      return exits.success(_default);
    }
  };