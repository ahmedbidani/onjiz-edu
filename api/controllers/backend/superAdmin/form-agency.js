module.exports = {
    exits: {
      success: {
        viewTemplatePath: 'backend/superAdmin/agency/form',
      },
      redirect: {
        responseType: 'redirect'
      }
    },
    fn: async function (inputs, exits) {
      let agency = {};
      let _default = await sails.helpers.getSaDefaultData(this.req);
      _default.manner = (this.req.param('id') == undefined ? 'add' : 'edit');
      if (_default.manner == 'edit') {
        agency = await Agency.findOne({ id: this.req.param('id') });
      }
      _default.agencyData = agency;
      return exits.success(_default);
    }
  };