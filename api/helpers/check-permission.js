module.exports = {

  friendlyName: '',
  description: '',

  inputs: {
    req: {
      type: 'ref',
      description: 'The current incoming request (req).',
      required: true
    }
  },
  exits: {
    success: {}
  },
  fn: async function (inputs, exits) {
    let extend = require('extend');
    const params = inputs.req.allParams();
    let listPermissions = {};
    let roles;
    if (inputs.req.me.userType == 3) return exits.success(true);
    if (inputs.req.me.isAgency == true) return exits.success(true);
    let roleOfUser = await User_Role.find({ user: inputs.req.me.id });
    if (roleOfUser.length) {
      for (let role of roleOfUser) {
        roles = await RoleService.get({ id: role.role });
        if (roles && roles.permissions) {
          listPermissions = extend(listPermissions, roles.permissions);
        }
      }
    } else {
      roles = await RoleService.get({ name: 'Teacher' });
      if (roles && roles.permissions) listPermissions = roles.permissions;
    }
    const objectArray = Object.entries(listPermissions);
    
    let nameAction = inputs.req.options.action;
    let arr = nameAction.split('/');
    let controller = arr[arr.length - 2];
    let action = arr[arr.length - 1];

    let actionPermisstion = false;
    let permissionAction = ['dashboard', 'branch', 'setting', 'formation', 'message'];
    if(permissionAction.includes(controller)) actionPermisstion = true;
    else if (action == 'student-attendance') {
      for (let permission of objectArray) {
        if (permission[0].toLowerCase() == 'attendent') actionPermisstion = permission[1].view;
      }
    } else {
      for (let permission of objectArray) {
        if (permission[0].toLowerCase() == controller.toLowerCase()) {
          if (action.includes('view') || action == 'index' || action == 'list' || action == "search") actionPermisstion = permission[1].view;
          else if (action == 'edit' || action == 'change') actionPermisstion = permission[1].edit;
          else if (action == 'add' || action == 'form') actionPermisstion = permission[1].add;
          else if (action == 'delete') actionPermisstion = permission[1].delete;
        }
      }
    }
    return exits.success(actionPermisstion);
  }
};
