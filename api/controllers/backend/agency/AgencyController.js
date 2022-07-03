let mongo = require('mongodb');
const ErrorMessages = require('../../../../config/errors');
const accents = require('remove-accents');
module.exports = { 
  searchSchool: async (req, res) => {
      sails.log.info("================================ AgencyController.searchSchool => START ================================");
  
      let params = req.allParams();
      if(!params.agencyID) {
          return res.badRequest(ErrorMessages.AGENCY_ID_REQUIRED);
      }
      let keyword = params.search ? params.search.value : null;
      let draw = (params.draw) ? parseInt(params.draw) : 1;
      let limit = (params.length) ? parseInt(params.length) : null;
      let skip = (params.start) ? parseInt(params.start) : null;
      
      let newSort = {};
      if ( params.order ) {
        let objOrder = {};
        objOrder[params.columns[params.order[0].column].data] = params.order[0].dir ;
        // sort = [objOrder];
        for(var key in objOrder){
          if(objOrder[key] == 'desc'){
            //code here
            newSort[key] = -1; 
          } else {
            newSort[key] = 1;
          }
        }
      } else {
        newSort = { createdAt: -1 };
      }
  
      let where = {};
      if (typeof keyword === "string" && keyword.length > 0) {
        where = {
          $or: [
            { code: { $regex: keyword, $options: 'i' }},
            { name: { $regex: keyword, $options: 'i' }},
          ]
        } 
      }
  
      where.$and = [
          { agency: params.agencyID ? new mongo.ObjectID(params.agencyID) : null },
          { status: params.status ? parseInt(params.status) : 1 }
      ];
      
      /**SEARCH CASE_INSENSITIVE */
      const collection = School.getDatastore().manager.collection(School.tableName);
      let result = [];
      if (params.length && params.start) {
        result = await collection.find(where).limit(limit).skip(skip).sort(newSort);
      } else {
        result = await collection.find(where).sort(newSort);
      }
      const totalSchool = await collection.count(where);
      const dataWithObjectIds = await result.toArray();
      const arrObjSchools = JSON.parse(JSON.stringify(dataWithObjectIds).replace(/"_id"/g, '"id"'));
  
      let resSchools = [];
      for (let school of arrObjSchools) {
        let tmpData = {};
        tmpData.id = '<input class="js-checkbox-item" type="checkbox" value="' + school.id + '">';
        tmpData.code = school.code;
        tmpData.name = school.name;
        tmpData.emailAddress = school.emailAddress;
        tmpData.address = school.address;
  
        let isAdminRegistered = school.admin ? true : false;
        tmpData.tool = 
          `<div class="btn-group-action">				
            <div class="btn-group pull-right">
            <a href="/agency/school/edit/${school.id}" data-id="${school.id}" title="Edit" class="edit btn btn-default edit-row">
              <i class="mdi mdi-pencil"></i>
            </a>
              <button class="btn btn-default dropdown-toggle" data-toggle="dropdown">
                <i class="icon-caret-down"></i>
              </button>
              <ul class="dropdown-menu">
                <li>
                  <a href="javascript:void(0);" data-id="${school.id}" class="remove-row">
                    <i class="mdi mdi-delete"></i>Delete
                  </a>
                </li>
                ${isAdminRegistered ? 
                  `<li>
                    <a href="/agency/school-${school.id}/admin/edit/${school.admin}">
                      <i class="mdi mdi-account"></i>Edit school admin
                    </a>
                  </li>`
                  :
                  `<li>
                    <a href="/agency/school-${school.id}/admin/add">
                      <i class="mdi mdi-account"></i>Add school admin
                    </a>
                  </li>`
                }
              </ul>
            </div>
          </div>`;
  
        resSchools.push(tmpData);
      };
      return res.ok({ draw: draw, recordsTotal: totalSchool, recordsFiltered: totalSchool, data: resSchools });
  },
  addSchool: async (req, res) => {
    sails.log.info('================================ AgencyController.addSchool => START ================================');

    let params = req.allParams();
    // CHECK REQUIRED DATAFIELD FOR SCHOOL
    if (!params.code || !params.code.trim().length) return res.badRequest(ErrorMessages.SCHOOL_CODE_REQUIRED);
    if (!params.name) return res.badRequest(ErrorMessages.SCHOOL_NAME_REQUIRED);
    if (!params.emailAddress) return res.badRequest(ErrorMessages.SCHOOL_EMAIL_REQUIRED);
    if (!params.phone) return res.badRequest(ErrorMessages.SCHOOL_PHONE_REQUIRED);

    let checkMailExist = await SchoolService.get({ emailAddress: params.emailAddress.toLowerCase() });
    if (checkMailExist) return res.badRequest(ErrorMessages.SCHOOL_EMAIL_HAS_BEEN_REGISTERED);

    let checkPhoneExist = await SchoolService.get({ phone: params.phone });
    if (checkPhoneExist) return res.badRequest(ErrorMessages.SCHOOL_PHONE_HAS_BEEN_REGISTERED);

    let checkNameExist = await SchoolService.get({ name: params.name });
    if (checkNameExist) return res.badRequest(ErrorMessages.SCHOOL_NAME_HAS_BEEN_REGISTERED);

    let code = accents.remove(params.code).replace(/\s/g, '');
    let checkCodeExist = await SchoolService.get({ code: code });
    if (checkCodeExist) return res.badRequest(ErrorMessages.SCHOOL_CODE_HAS_BEEN_REGISTERED);

    let dataSchool = {
      code: code,
      name: params.name,
      emailAddress: params.emailAddress.toLowerCase(),
      phone: params.phone,
      address: params.address,
      description: params.description,
      status: sails.config.custom.STATUS.ACTIVE,
      photo: params.photo,
      numberOfVAT: params.numberOfVAT,
      server: params.server,
      website: params.website,
      //agency: req.me.id
    };
    
    let newSchool = await SchoolService.add(dataSchool);
    let adminSchool = await User.find({ userType: 3 });
    if (adminSchool.length > 0) {
      await User.update({ userType: 3 })
      .set({
        school: newSchool.id
      });
      // for (let admin of adminSChool) {
      //   admin.school = newSchool.id;
      //   await User.update({ id: admin.id }, admin);
      // }
    }
    return res.json(newSchool);
  },
  editSchool: async (req, res) => {
    sails.log.info('================================ AgencyController.editSchool => START ================================');

    let params = req.allParams();
    // CHECK REQUIRED DATAFIELD FOR SCHOOL
    if (!params.id) return res.badRequest(ErrorMessages.SCHOOL_ID_REQUIRED);
    if (!params.code || !params.code.trim().length) return res.badRequest(ErrorMessages.SCHOOL_CODE_REQUIRED);
    if (!params.name) return res.badRequest(ErrorMessages.SCHOOL_NAME_REQUIRED);
    if (!params.emailAddress) return res.badRequest(ErrorMessages.SCHOOL_EMAIL_REQUIRED);
    if (!params.phone) return res.badRequest(ErrorMessages.SCHOOL_PHONE_REQUIRED);

    let checkPhoneExist = await SchoolService.get({ id: { '!=': params.id}, phone: params.phone });
    if (checkPhoneExist) return res.badRequest(ErrorMessages.SCHOOL_PHONE_HAS_BEEN_REGISTERED);

    let checkNameExist = await SchoolService.get({ id: { '!=': params.id}, name: params.name });
    if (checkNameExist) return res.badRequest(ErrorMessages.SCHOOL_NAME_HAS_BEEN_REGISTERED);

    let code = accents.remove(params.code).replace(/\s/g, '');
    let checkCodeExist = await SchoolService.get({ id: { '!=': params.id}, code: code });
    if (checkCodeExist) return res.badRequest(ErrorMessages.SCHOOL_CODE_HAS_BEEN_REGISTERED);

    let dataSchool = {
      code: code,
      name: params.name,
      // emailAddress: params.emailAddress,
      phone: params.phone,
      address: params.address,
      description: params.description,
      photo: params.photo,
      numberOfVAT: params.numberOfVAT,
      server:params.server,
      website: params.website
    };

    //ALWAYS CHECK  OBJECT EXIST BEFORE UPDATE
    let school = await School.findOne({ id: params.id });
    if (!school) return res.notFound(ErrorMessages.SCHOOL_NOT_FOUND);

    //UPDATE DATA
    let editSchool = await SchoolService.edit({ id: params.id }, dataSchool);
    return res.json(editSchool);

  },
  deleteSchool: async (req, res) => {
    sails.log.info("================================ AgencyController.delete => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();
    if (!params.ids) return res.badRequest(ErrorMessages.AGENCY_ID_REQUIRED);
    /** delete all data (user, album, attendent, branch, class, courseSession, ....) of specific school */
    let deleteSchoolData = async (id) => {
      let deletedAlbum = AlbumService.del({ school: id });
      let deletedAttendent = AttendentService.del({ school: id });
      let deletedBranch = BranchService.del({ school: id });
      let deletedComment = CommentService.del({ school: id });
      let deletedCourseSession = CourseSessionService.del({ school: id });
      let deletedDayoff = DayoffService.del({ school: id });
      let deletedEvent = EventService.del({ school: id });
      let deletedFeeInvoice = FeeInvoiceService.del({ school: id });
      let deletedFeeItem = FeeItemService.del({ school: id });
      let deletedFood = FoodService.del({ school: id });
      let deletedMedia = MediaService.del({ school: id });
      let deletedMenu = MenuService.del({ school: id });
      let deletedMessage = MessageService.del({ school: id });
      let deletedMessageData = MessageDataService.del({ school: id });
      let deletedSubject = SubjectService.del({ school: id });
      let deletedTaxonomy = TaxonomyService.del({ school: id });
      let deletedUser = UserService.del({ school: id });
      let deletedParent = ParentService.del({ school: id });
      let deletedPayment = Payment.destroy({ school: id });
      let deletedPickUp = PickUpService.del({ school: id });
      let deletedSchedule = ScheduleService.del({ school: id });
      let deletedSetting = SettingService.del({ school: id });
      
      //delete class data and related things
      let classes = await Class.find({ school: id });
      let classIds = classes.map(item => item.id);
      let deletedSubjectClass = Subject_Class.destroy({ id: { 'in': classIds } });
      let deletedTeacherClass = Teacher_Class.destroy({ id: { 'in': classIds } });
      let deletedClass = ClassService.del({ school: id });
      
      //delete noti data and related things
      let notifications = await Notifications.find({ school: id });
      let notiIds = notifications.map(item => item.id);
      let deletedNotificationParent = Notification_Parent.destroy({ id: { 'in': notiIds } });
      let deletedNotificationUser = Notification_User.destroy({ id: { 'in': notiIds } });
      let deletedNotification = NotificationService.del({ school: id });
      
      //delete post data and related things
      let posts = await Post.find({ school: id });
      let postIds = posts.map(item => item.id);
      let deletedPostCategory = Post_Category.destroy({ id: { 'in': postIds } });
      let deletedPostTag = Post_Tag.destroy({ id: { 'in': postIds } });
      let deletedPost = PostService.del({ school: id });
      
      //delete student data and related things
      let students = await Student.find({ school: id });
      let studentIds = students.map(item => item.id);
      let deletedStudentClass = Student_Class.destroy({ id: { 'in': studentIds } });
      let deletedStudentParent = Student_Parent.destroy({ id: { 'in': studentIds } });
      let deletedStudent = StudentService.del({ school: id });
      
      await deletedAlbum;
      await deletedAttendent;
      await deletedBranch;
      await deletedComment;
      await deletedCourseSession;
      await deletedDayoff;
      await deletedEvent;
      await deletedFeeInvoice;
      await deletedFeeItem;
      await deletedFood;
      await deletedMedia;
      await deletedMenu;
      await deletedMessage;
      await deletedMessageData;
      await deletedParent;
      await deletedPayment;
      await deletedPickUp;
      await deletedSchedule;
      await deletedSetting;
      await deletedSubject;
      await deletedTaxonomy;
      await deletedUser;
      
      await deletedClass;
      await deletedSubjectClass;
      await deletedTeacherClass;
      
      await deletedNotification;
      await deletedNotificationParent;
      await deletedNotificationUser;
      
      await deletedPostCategory;
      await deletedPostTag;
      await deletedPost;
      
      await deletedStudentClass;
      await deletedStudentParent;
      await deletedStudent;
    }
    // CHECK IDS PARAM
    if (!params.ids || !params.ids.length) {
      return res.badRequest(ErrorMessages.SCHOOL_ID_REQUIRED);
    }
    let ids = params.ids;
    if (params.ids.indexOf(';') != -1) {
      ids = ids.split(';');
    }
    if (typeof (ids) == 'object') {
      //delete other data of this schools in database
      for (let i = 0; i < ids.length; i++){
        await deleteSchoolData(ids[i]);
      }

      await School.destroy({ id: { in: ids } });
    } else {
      //delete other data of this school in database
      await deleteSchoolData(ids);

      await School.destroy({ id: ids });
    }
    // RETURN DATA
    return res.json({ status: 1 });
  },
  addSchoolAdmin: async (req, res) => {
    sails.log.info('================================ AgencyController.addSchoolAdmin => START ================================');

    let params = req.allParams();
    // CHECK REQUIRED DATAFIELD FOR SCHOOL
    //if (!params.emailAddress) return res.badRequest(ErrorMessages.USER_EMAIL_REQUIRED);
    if (!params.userName) return res.badRequest(ErrorMessages.USER_REQUIRED);
    if (!params.firstName) return res.badRequest(ErrorMessages.USER_FIRST_NAME_REQUIRED);
    if (!params.lastName) return res.badRequest(ErrorMessages.USER_LAST_NAME_REQUIRED);
    if (!params.schoolId) return res.badRequest(ErrorMessages.SCHOOL_ID_REQUIRED);

    let checkMailExist = await User.findOne({ emailAddress: params.emailAddress.toLowerCase() });
    if (checkMailExist) return res.badRequest(ErrorMessages.USER_ERR_EMAIL_EXISTED);

    let checkUserNameExist = await User.findOne({ userName: params.userName });
    if (checkUserNameExist) return res.badRequest(ErrorMessages.USER_ERR_USERNAME_EXISTED);


    let dataSchoolAdmin = {
      firstName: params.firstName,
      lastName: params.lastName,
      emailAddress: params.emailAddress.toLowerCase(),
      userName: params.userName,
      phone: params.phone,
      password: await sails.helpers.passwords.hashPassword(params.password),
      birthday: params.birthday,
      userType: sails.config.custom.TYPE.SCHOOLADMIN,
      status: sails.config.custom.STATUS.ACTIVE,
      avatar: params.avatar,
      school: params.schoolId
    };
    let newSchoolAdmin = await UserService.add(dataSchoolAdmin);

    //UPDATE ADMIN FOR SCHOOL
    await SchoolService.edit({ id: params.schoolId }, { admin: newSchoolAdmin.id });
    return res.json(newSchoolAdmin);
  },
  editSchoolAdmin: async (req, res) => {
    sails.log.info("================================ AgencyController.editSchoolAdmin => START ================================");
    let params = req.allParams();
    if (!params.userName) return res.badRequest(ErrorMessages.USER_REQUIRED);
    if (params.password != params.passwordConfirm) return res.badRequest(ErrorMessages.PASSWORD_IS_NOT_MATCH);
    let data = {
      firstName: params.firstName,
      lastName: params.lastName,
      emailAddress: params.emailAddress.toLowerCase(),
      phone: params.phone,
      userName: params.userName,
      birthday: params.birthday,
      avatar: params.avatar
    };
    if (params.password && params.password != '') {
      data.password = await sails.helpers.passwords.hashPassword(params.password);
    }
    //If the phone number already exists
    let duplicatemail = await UserService.get({ id: {'!=': params.id}, emailAddress: params.emailAddress });
    if (duplicatemail)  {
      return res.badRequest(ErrorMessages.USER_IS_EXISTED);
    }
    //ALWAYS CHECK  OBJECT EXIST BEFORE UPDATE
    let user = UserService.get({ id: params.id });
    if (!user) return res.notFound(ErrorMessages.USER_NOT_FOUND);
    //UPDATE DATA
    let editObj = await UserService.edit({ id: params.id }, data);
    return res.ok(editObj);
  },
}
