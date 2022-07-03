
/**
 * subject/index.js
 *
 * @description :: Server-side controller action for handling incoming requests.
 * @help        :: See https://sailsjs.com/documentation/concepts/controllers
 */

module.exports = {
  inputs: {},
  exits: {
    success: {
      viewTemplatePath: 'frontend/pages/subject/index',
    },
    redirect: {
      responseType: 'redirect'
    }
  },

  fn: async function (inputs, exits) {
    sails.log.info("================================ controllers/frontend/subject ================================");
    
    let _default = await sails.helpers.getFeDefaultData(this.req)
      .tolerate('noSchoolFound', () => {
        throw { redirect: '/login' };
      });
    
    _default.classSelect = _default.listClasses.length ? _default.listClasses[0].id : '';

    let startTimeCourseSession = _default.currCourseSession.startTime;
		let endTimeCourseSession = _default.currCourseSession.endTime;
		_default.startTimeCourseSession = startTimeCourseSession;
		_default.endTimeCourseSession = endTimeCourseSession;
    return exits.success(_default);
  }
};