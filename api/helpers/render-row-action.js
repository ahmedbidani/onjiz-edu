module.exports = {

  friendlyName: 'Generate default data object',
  description: 'Generate default data object',

  inputs: {
    object: {
      type: 'json',
      description: 'Object active',
      required: true
    },
    isMainSchoolAdmin: {
      type: 'boolean',
      description: 'is current logged in user main school admin',
      default: false
    },
    isHavePermissionEdit: {
      type: 'boolean',
      description: 'is current logged in user have permission edit',
      default: false
    },
    isHavePermissionDelete: {
      type: 'boolean',
      description: 'is current logged in user have permission delete',
      default: false
    },
  },
  exits: {
    success: {}
  },
  fn: async function (inputs, exits) {
  let jsonObject = inputs.object;
  let result = ``;
    if(jsonObject.isNotification)
    {
      result = `<div class="btn-group-action">				
      <div class="btn-group pull-right">`;
      if (inputs.isMainSchoolAdmin || inputs.isHavePermissionEdit) {
        result +=
          `<a data-toggle="modal" data-target="#modal-edit" data-id="${jsonObject.id}" title="Sửa" class="edit btn btn-default edit-row" data-id="${jsonObject.id}">
          <i class="mdi mdi-pencil"></i>
        </a>`
      }
      if (inputs.isMainSchoolAdmin || inputs.isHavePermissionEdit || inputs.isHavePermissionDelete) {
        result +=
          `<button class="btn btn-default dropdown-toggle" data-toggle="dropdown">
          <i class="icon-caret-down"></i>
        </button>
        <ul class="dropdown-menu">`
        if (inputs.isMainSchoolAdmin || inputs.isHavePermissionDelete) {
          result +=
          `<li>
            <a href="javascript:void(0);" data-id="${jsonObject.id}" class="remove-row">
              <i class="mdi mdi-delete"></i> ` + sails.__('Delete') +
            `</a>
          </li>`
        }
        if (inputs.isMainSchoolAdmin || inputs.isHavePermissionEdit) {
          result +=
          `<li>
            <a href="javascript:void(0);" data-id="${jsonObject.id}" id="pushFirebaseNotification" class="send-row">
              <i class="mdi mdi-cellphone-iphone"></i> Send notification
            </a>
          </li>`
        }
        result +=
        `</ul>`
      }
      result +=
        `</div>
      </div>`; 
    } else {
      if (jsonObject.url) {
        result =
          `<div class="btn-group-action">				
            <div class="btn-group pull-right">`;
          if (inputs.isMainSchoolAdmin || inputs.isHavePermissionEdit) {
            result +=
            `<a href="${jsonObject.url ? jsonObject.url + jsonObject.id : 'javascript:void(0);'}" data-id="${jsonObject.id}" title="Edit" class="edit btn btn-default edit-row">
              <i class="mdi mdi-pencil"></i>
            </a>`
          }
          if (inputs.isMainSchoolAdmin || inputs.isHavePermissionDelete) {
            result +=
            `<button class="btn btn-default dropdown-toggle" data-toggle="dropdown">
              <i class="icon-caret-down"></i>
            </button>
            <ul class="dropdown-menu">
              <li>
                <a href="javascript:void(0);" data-id="${jsonObject.id}" class="remove-row">
                  <i class="mdi mdi-delete"></i>` + sails.__('Delete') +`
                </a>
              </li>
            </ul>`
          }
          result += 
          `</div>
        </div>`; 
      } else {
      result = `<div class="btn-group-action">				
        <div class="btn-group pull-right">`;
        if (inputs.isMainSchoolAdmin || inputs.isHavePermissionEdit) {
          result +=
          `<a data-toggle="modal" data-target="#modal-edit" data-id="${jsonObject.id}" title="Sửa" class="edit btn btn-default edit-row" data-id="${jsonObject.id}">
            <i class="mdi mdi-pencil"></i>
          </a>`
        }
        if (inputs.isMainSchoolAdmin || inputs.isHavePermissionDelete) {
          result +=
          `<button class="btn btn-default dropdown-toggle" data-toggle="dropdown">
            <i class="icon-caret-down"></i>
          </button>
          <ul class="dropdown-menu">
            <li>
              <a href="javascript:void(0);" data-id="${jsonObject.id}" class="remove-row">
                <i class="mdi mdi-delete"></i> ` + sails.__('Delete') +`
              </a>
            </li>
          </ul>`
        }
        result += 
        `</div>
      </div>`;
      }
    }
    return exits.success(result);
  }
};
