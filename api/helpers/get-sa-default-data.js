var moment = require("moment");
const i18n = require('../../config/i18n');

module.exports = {

  friendlyName: 'Generate default data sa object',
  description: 'Generate default data sa object',

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
    sails.log.info("=== helper/get-default-data-sa => START ===========");

    let _default = await {
      userActive: inputs.req.me,
      moduleActive: inputs.req.options,
      moment: moment,
      url: inputs.req.path, 
      lang: inputs.req.getLocale()
    };
    //set curr language equal with defaultLocale
    _default = await _.extend(sails.config.custom, _default);

    return exits.success(_default);
  }
};
