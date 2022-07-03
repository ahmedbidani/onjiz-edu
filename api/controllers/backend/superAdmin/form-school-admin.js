module.exports = {
  exits: {
    success: {
      viewTemplatePath: 'backend/superAdmin/schoolAdmin/form',
    },
    redirect: {
      responseType: 'redirect'
    }
  },
  fn: async function (inputs, exits) {
    let schoolId = this.req.param('schoolId');
    let schoolObj = await School.findOne({ id: schoolId });
    
    let userObj = {};
    let _default = await sails.helpers.getSaDefaultData(this.req);
    _default.manner = (this.req.param('id') == undefined ? 'add' : 'edit');
    if (_default.manner == 'edit') {
      userObj = await User.findOne({ id: schoolObj.admin }).populate('role');
    } else {
      if (schoolObj.admin) throw { redirect: '/sa/school' };
    }
    _default.userObj = userObj;
    _default.schoolId = schoolId;

    let listRole = await Role.find({});
    _default.listRole = listRole;
      
    return exits.success(_default);
  }
};