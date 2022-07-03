let moment = require("moment");
const i18n = require('../../config/i18n');

module.exports = {

  friendlyName: 'Generate default data object for frontend',
  description: 'Generate default data object for frontend',

  inputs: {
    req: {
      type: 'ref',
      description: 'The current incoming request (req).',
      required: true
    }
  },
  exits: {
    success: {},
    noSchoolFound: {
      description: 'Could not get schoolCode or school not found'
    }
  },
  fn: async function (inputs, exits) {
    sails.log.info("=== helper/get-default-data => START ===========");
    let params = inputs.req.allParams();
  
    //if (!params.schoolCode) throw 'noSchoolFound';
    let school = {};
    let schools = await School.find({});
    if (schools.length) school = schools[0];
    const moment = require('moment');
    let date = moment().format("YYYY-MM-DD");
    let sessions = await CourseSession.find({});
    let currCourseSession = {};
    if (sessions.length) currCourseSession = sessions[0];
    if (!school) throw 'noSchoolFound';
    let webSettings = await SettingService.get({ key: 'web', school: school.id });
    let page = params.page ? parseInt(params.page) : 1;

    let listClasses = []; 

    let listBranches = await Branch.find({ status: sails.config.custom.STATUS.ACTIVE, school: school.id }).populate("sessions");

    let classActive = "";
    let branchActive = null;
    let classActiveObj = {}; 
    let branchActiveObj = {};
    let sessionsOfBranchActive = [];
    if(params.branchId) {
      branchActive = params.branchId;
    } else {
      if (inputs.req.session.branchId) {
        branchActive = inputs.req.session.branchId;
      } else if (listBranches.length) {
        branchActive = listBranches[0].id;
      }
    }
    if (branchActive && branchActive != '0' && branchActive != 'undefined') {
      branchActiveObj = await Branch.findOne({ id: branchActive });
      sessionsOfBranchActive = await CourseSession.find({ branchOfSession: branchActiveObj.id }).populate('classes');
      sessionsOfBranchActive.map(item => listClasses = [...listClasses,...item.classes])

    }
    if (params.classId) {
      classActive = params.classId;
    }
    // PREPARE DATA FOR STUDENT FOLLOW THE BRANCH AND SPECIFIC CLASS.
    if (classActive && classActive != '0' && classActive != 'undefined') {
      classActiveObj = await Class.findOne({ id: classActive }).populate('courseSession');

      //if have no params branchId => save branchActive = branch of class
      if (!branchActive && classActiveObj.courseSession && classActiveObj.courseSession.branchOfSession) {
        branchActive = classActiveObj.courseSession.branchOfSession;
        branchActiveObj = await Branch.findOne({ id: classActiveObj.courseSession.branchOfSession });
        sessionsOfBranchActive = await CourseSession.find({ branchOfSession: branchActiveObj.id }).populate('classes');
        sessionsOfBranchActive.map(item => listClasses = [...listClasses,...item.classes])
      }
    }
    
    let _default = await {
      userActive: inputs.req.me,
      webSettings: webSettings,
      moduleActive: inputs.req.options,
      params: params,
      school: school,
      currCourseSession: currCourseSession,
      branchActive: branchActive,
      branchActiveObj: branchActiveObj,
      sessionsOfBranchActive: sessionsOfBranchActive,
      classActive: classActive,
      classActiveObj: classActiveObj,  
      listClasses: listClasses,
      listBranches:listBranches,
      moment: moment,
      url: inputs.req.path,
      lang: inputs.req.getLocale(),
      pageActive: page,
    };
 
    _default = await _.extend(sails.config.custom, _default);

    return exits.success(_default);
  }
};
