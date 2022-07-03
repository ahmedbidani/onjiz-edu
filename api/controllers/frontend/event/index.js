module.exports = {
  exits: {
    success: {
      viewTemplatePath: "frontend/pages/event/index",
      description: "Display the event page."
    },
    redirect: {
      responseType: "redirect"
    }
  },
  fn: async function(inputs, exits) {
    let _default = await sails.helpers.getFeDefaultData(this.req);
    let startTimeCourseSession = _default.currCourseSession.startTime;
		let endTimeCourseSession = _default.currCourseSession.endTime;
		_default.startTimeCourseSession = startTimeCourseSession;
    _default.endTimeCourseSession = endTimeCourseSession;
    return exits.success(_default);
  }
};
