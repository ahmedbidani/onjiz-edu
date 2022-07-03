  /**
   * video/view-video-add.js
   *
   * @description :: Server-side controller action for handling incoming requests.
   * @help        :: See https://sailsjs.com/documentation/concepts/controllers
   */


   module.exports = {
    friendlyName: 'View Edit Video',
    description: 'Display "Edit Video" page.',
    exits: {
      success: {
        viewTemplatePath: 'backend/pages/schedule/form',
      },
      error: {
        description: 'Error.',
        responseType: 'badRequest'
      }
    },

    fn: async function (inputs, exits) {
      let schedule = {};
      let _default = await sails.helpers.getDefaultData(this.req);
      _default.manner = (this.req.param('id') == undefined?'add':'edit');
      if(_default.manner == 'edit') {
        schedule = await ScheduleService.get({ id: this.req.param('id') });
      }

      let listVideo = await PostService.find({ status: sails.config.custom.STATUS.ACTIVE, school: this.req.me.school});
      _default.listVideo = listVideo;
      
      _default.scheduleData = schedule;
      
      return exits.success(_default);
    }
  };
