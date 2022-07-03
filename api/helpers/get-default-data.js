var moment = require("moment");
const Post_Category = require("../models/Post_Category");
const TaxonomyService = require("../services/TaxonomyService");

module.exports = {

  friendlyName: 'Generate default data object',
  description: 'Generate default data object',

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
    sails.log.info("=== helper/get-default-data => START ===========");
    let listClasses = [];
    let listCategories = [];
    let listTags = [];

    let listBranches = await Branch.find({ status: sails.config.custom.STATUS.ACTIVE, school: inputs.req.me.school }).populate("sessions");

    let classActive = "";
    let branchActive = null;
    let classActiveObj = {};
    let params = inputs.req.allParams();
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
    let extend = require('extend');

    let getPermissions;
    let roles;
    let roleOfUser = await User_Role.find({ user: inputs.req.me.id });
    if (roleOfUser.length) {
      for (let role of roleOfUser) {
        roles = await RoleService.get({ id: role.role });
        if (roles && roles.permissions) {
          getPermissions = extend(getPermissions, roles.permissions);
        }
      }
    } 
 
    let currencyObj = {};
    if (sails.config.custom.webSettings && sails.config.custom.webSettings.value && sails.config.custom.webSettings.value.currency) {
      let listCurrencies = sails.config.currencies.list;
      for(let currency of listCurrencies) {
        if(currency.code == sails.config.custom.webSettings.value.currency) {
          currencyObj = currency;
        }
      } 
    }
    let webSettings = await SettingService.get({ key: 'web', school: inputs.req.me.school });
    let page = params.page ? parseInt(params.page) : 1;

    let medicalDate = [];
    if (inputs.req.params && inputs.req.params.id) {
			let medical = {};
			medical = await Medical.findOne({ id: inputs.req.params.id });
			if (medical && medical.classObj) {
				let medicals = await Medical.find({ classObj: medical.classObj });
				if (medicals.length) {
					for (let medicalClass of medicals) {
						if (medicalClass && medicalClass.date) {
							medicalClass.date = moment(medicalClass.date, "YYYY-MM-DD").format(webSettings.value.dateFormat);
							medicalDate.push(medicalClass);
						}
					}
				}
			}
		}

    let catID = params.category ? params.category : null;
		let limit = 10;
    let skip = (page - 1) * limit;
    let where = {};

    if (catID != null) {
      where.category = catID;
    }

    // PREPARE DATA NEWS PAGING
    let listNews = await PostCategoryService.find(where);
    let lengthOfPage = listNews.length;
    //GET NUMBER OF PAGES.
    var numberOfPages = Math.floor((lengthOfPage + limit - 1) / limit);

    let userActive = inputs.req.me;
    let schoolObj = await School.findOne({ id: inputs.req.me.school });
    userActive.schoolObj = schoolObj;
    userActive.isMainSchoolAdmin = userActive.userType == 3 ? true : false;
    listCategories = await Taxonomy.find({school: inputs.req.me.school, status: 1, type: "category"});
    listTags = await Taxonomy.find({school: inputs.req.me.school, status: 1, type: "tag"});
    let _default = await {
      userActive: userActive,
      webSettings: webSettings,
      branchActive: branchActive,
      branchActiveObj: branchActiveObj,
      sessionsOfBranchActive: sessionsOfBranchActive,
      classActive: classActive,
      classActiveObj: classActiveObj,
      moduleActive: inputs.req.options,
      listCategories: listCategories,
      listTags: listTags,
      listClasses: listClasses,
      listBranches:listBranches,
      currency: currencyObj,
      moment: moment,
      url: inputs.req.path,
      lang: inputs.req.getLocale(),
      lengthOfPage: lengthOfPage,
      numberOfPages: numberOfPages,
      categoryActive: catID,
      pageActive: page,
      getPermissions: getPermissions,
      medicalDate: medicalDate
    };


    _default = await _.extend(sails.config.custom, _default);

    return exits.success(_default);
  }
};
