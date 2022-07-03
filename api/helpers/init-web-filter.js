const CourseSessionService = require('../services/CourseSessionService');
module.exports = {
    friendlyName: 'Generate default web module',
    description: 'Generate default web module',
  
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
      // let _default = {
      //   totalAll : '',
      //   totalActive : '',
      //   totalDraft : '',
      //   totalTrash : '',
      //   url: inputs.req.options.action,
      // }; 
      switch (inputs.req.options.action) {
        case 'backend/coursesession/index':
          let totalAll = await CourseSessionService.count();
          let totalActive = await CourseSessionService.count({ status: sails.config.custom.STATUS.ACTIVE });
          let totalDraft = await CourseSessionService.count({ status: sails.config.custom.STATUS.DRAFT });
          let totalTrash = await CourseSessionService.count({ status: sails.config.custom.STATUS.TRASH });
          _default.totalAll = totalAll;
          _default.totalActive = totalActive;
          _default.totalDraft = totalDraft;
          _default.totalTrash = totalTrash;
        break;
      }
      return exits.success(_default);
    }
};