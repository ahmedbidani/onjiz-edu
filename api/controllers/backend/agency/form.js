module.exports = {
    exits: {
      success: {
        viewTemplatePath: 'backend/agency/form',
      },
      redirect: {
        responseType: 'redirect'
      }
    },
    fn: async function (inputs, exits) {
      let school = {};
      let _default = await sails.helpers.getSaDefaultData(this.req);
      _default.manner = (this.req.param('id') == undefined ? 'add' : 'edit');
      if (_default.manner == 'edit') {
        school = await School.findOne({ id: this.req.param('id') });
      }
      if (school.id) {
        userObj = await UserService.get({id: school.admin})
      }
      _default.schoolData = school;
        
      return exits.success(_default);
    }
  };