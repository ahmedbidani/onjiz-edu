const moment = require('moment');
const Sharp = require('sharp/lib');
const ErrorMessages = require('../../../../config/errors');
const accents = require('remove-accents');

module.exports = {

  registerSA: async (req, res) => {
    sails.log.info("================================ Installation.registerSA => START ================================");
    let params = req.allParams();
    if (!params.emailAddress) return res.badRequest(ErrorMessages.USER_EMAIL_REQUIRED);
    if (!params.phone) return res.badRequest(ErrorMessages.USER_PHONE_REQUIRED);
    if (!params.password) return res.badRequest(ErrorMessages.USER_PASSWORD_REQUIRED);
    if (!params.firstName) return res.badRequest(ErrorMessages.USER_FIRST_NAME_REQUIRED);
    if (!params.lastName) return res.badRequest(ErrorMessages.USER_LAST_NAME_REQUIRED);
    // if (!params.school) return res.badRequest(ErrorMessages.SCHOOL_NAME_REQUIRED);
    
    let data = {
      firstName: params.firstName,
      lastName: params.lastName,
      emailAddress: params.emailAddress.toLowerCase(),
      password: await sails.helpers.passwords.hashPassword(params.password),
      phone: params.phone,
      birthday: params.birthday,
      isSuperAdmin: true,
      status: sails.config.custom.STATUS.ACTIVE,
      userType: sails.config.custom.TYPE.SCHOOLADMIN,
      branch: null,
      school: null
    };
    let admin = await UserService.get({ emailAddress: params.emailAddress.toLowerCase() });
    if (admin) {
      return res.badRequest(ErrorMessages.USER_IS_EXISTED);
    }
    let newObj = await UserService.add(data);
    return res.ok(newObj);
  },

  addSchool: async (req, res) => {
    sails.log.info('================================ SuperAdminController.addSchool => START ================================');

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
      website: params.website
    };
    let newSchool = await SchoolService.add(dataSchool);
    return res.json(newSchool);
  },

  editSchool: async (req, res) => {
    sails.log.info('================================ SuperAdminController.editSchool => START ================================');

    let params = req.allParams();
    // CHECK REQUIRED DATAFIELD FOR SCHOOL
    if (!params.id) return res.badRequest(ErrorMessages.SCHOOL_ID_REQUIRED);
    if (!params.code || !params.code.trim().length) return res.badRequest(ErrorMessages.SCHOOL_CODE_REQUIRED);
    if (!params.name) return res.badRequest(ErrorMessages.SCHOOL_NAME_REQUIRED);
    if (!params.emailAddress) return res.badRequest(ErrorMessages.SCHOOL_EMAIL_REQUIRED);
    if (!params.phone) return res.badRequest(ErrorMessages.SCHOOL_PHONE_REQUIRED);

    let checkPhoneExist = await SchoolService.get({ id: { '!=': params.id }, phone: params.phone });
    if (checkPhoneExist) return res.badRequest(ErrorMessages.SCHOOL_PHONE_HAS_BEEN_REGISTERED);

    let checkNameExist = await SchoolService.get({ id: { '!=': params.id }, name: params.name });
    if (checkNameExist) return res.badRequest(ErrorMessages.SCHOOL_NAME_HAS_BEEN_REGISTERED);

    let code = accents.remove(params.code).replace(/\s/g, '');
    let checkCodeExist = await SchoolService.get({ id: { '!=': params.id }, code: code });
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
      server: params.server,
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
    sails.log.info("================================ SuperAdminController.delete => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();

    /** delete all data (user, album, attendent, branch, class, courseSession, ....) of specific school */
    let deleteSchoolData = async (id) => {
      let deletedAlbum = AlbumService.del({ school: id });
      let deletedAttendent = AttendentService.del({ school: id });
      let deletedBranch = BranchService.del({ school: id });
      let deletedComment = CommentService.del({ school: id });
      let deletedCourseSession = CourseSessionService.del({ school: id });
      let deletedCurrency = CurrencyService.del({ school: id });
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
      await deletedCurrency;
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
      for (let i = 0; i < ids.length; i++) {
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

  searchSchool: async (req, res) => {
    sails.log.info("================================ SuperAdminController.searchSchool => START ================================");

    let params = req.allParams();
    let keyword = params.search ? params.search.value : null;
    let draw = (params.draw) ? parseInt(params.draw) : 1;
    let limit = (params.length) ? parseInt(params.length) : null;
    let skip = (params.start) ? parseInt(params.start) : null;

    let newSort = {};
    if (params.order) {
      let objOrder = {};
      objOrder[params.columns[params.order[0].column].data] = params.order[0].dir;
      // sort = [objOrder];
      for (var key in objOrder) {
        if (objOrder[key] == 'desc') {
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
          { code: { $regex: keyword, $options: 'i' } },
          { name: { $regex: keyword, $options: 'i' } },
        ]
      }
    }

    where.$and = [
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
          <a href="/sa/school/edit/${school.id}" data-id="${school.id}" title="Edit" class="edit btn btn-default edit-row">
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
                  <a href="/sa/school-${school.id}/admin/edit/${school.admin}">
                    <i class="mdi mdi-account"></i>Edit school admin
                  </a>
                </li>`
          :
          `<li>
                  <a href="/sa/school-${school.id}/admin/add">
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

  uploadSchoolPhoto: async (req, res) => {
    sails.log.info("================================ UserController.uploadSchoolPhoto => START ================================");
    let params = req.allParams();
    let thumbnail = {};
    if (req.file('file')) {
      let fileUploaded = await sails.helpers.uploadFile.with({
        req: req,
        file: 'thumbnail'
      });
      if (fileUploaded.length) {
        let filename = '';
        for (let file of fileUploaded) {
          filename = file.fd.replace(/^.*[\\\/]/, '');
          filename = filename.split('.');

          let uploadConfig = sails.config.custom.UPLOAD;
          thumbnail.sizes = {};
          for (let size of uploadConfig.SIZES) {
            let destFileName = filename[0] + '_' + size.name + '.' + filename[1];
            if (size.type == 'origin') {
              Sharp(file.fd).resize(size.width)
                .toFile(require('path').resolve(uploadConfig.PATH_FOLDER, 'assets/uploads/') + '/' + moment().format('YYYY/MM') + '/' + destFileName)
                .then((info) => { }).catch((err) => { sails.log(err); });
              thumbnail.path = '/uploads/' + moment().format('YYYY/MM') + '/' + destFileName;
            } else {
              let type = size.type;
              Sharp(file.fd).resize(size.width, size.height)
                .toFile(require('path').resolve(uploadConfig.PATH_FOLDER, 'assets/uploads/') + '/' + moment().format('YYYY/MM') + '/' + destFileName)
                .then((info) => { }).catch((err) => { sails.log(err); });
              thumbnail.sizes[type] = {
                width: size.width, height: size.height,
                path: '/uploads/' + moment().format('YYYY/MM') + '/' + destFileName
              };
            }
          }
        }

        let dataMedia = {
          title: filename.join('.'),
          thumbnail: thumbnail,
          status: sails.config.custom.STATUS.ACTIVE,
          type: sails.config.custom.TYPE.IMAGE,
          uploadBy: req.me.id,
          school: params.school
        }
        let mediaObj = await MediaService.add(dataMedia);
        return res.json(mediaObj.thumbnail.sizes.thumbnail.path);
      }
    }
    return res.json('');
  },

  addSchoolAdmin: async (req, res) => {
    sails.log.info('================================ SuperAdminController.addSchoolAdmin => START ================================');

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
    sails.log.info("================================ SuperAdminController.editSchoolAdmin => START ================================");
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
    let duplicatemail = await UserService.get({ id: { '!=': params.id }, emailAddress: params.emailAddress });
    if (duplicatemail) {
      return res.badRequest(ErrorMessages.USER_IS_EXISTED);
    }
    //ALWAYS CHECK  OBJECT EXIST BEFORE UPDATE
    let user = UserService.get({ id: params.id });
    if (!user) return res.notFound(ErrorMessages.USER_NOT_FOUND);
    //UPDATE DATA
    let editObj = await UserService.edit({ id: params.id }, data);
    return res.ok(editObj);
  },

  addRole: async (req, res) => {
    sails.log.info("================================ SuperAdminController.addRole => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();
    // CHECK NAME
    if (!params.name || !params.name.trim().length) return res.badRequest(ErrorMessages.ROLE_NAME_REQUIRED);

    // PREPARE DATA ROLE
    const newData = {
      name: params.name, // REQUIRED
      description: params.description
    };

    // ADD NEW DATA ROLE
    const newRole = await RoleService.add(newData);

    // RETURN DATA ROLE
    return res.ok(newRole);
  },

  getRole: async (req, res) => {
    sails.log.info("================================ SuperAdminController.getRole => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();
    if (!params.id) return res.badRequest(ErrorMessages.ROLE_ID_REQUIRED);

    // QUERY & CHECK DATA ROLE
    const role = await RoleService.get({ id: params.id });
    if (!role) return res.notFound(ErrorMessages.ROLE_NOT_FOUND);

    // RETURN DATA ROLE
    return res.ok(role);
  },

  editRole: async (req, res) => {
    sails.log.info("================================ SuperAdminController.editRole => START ================================");
    const params = req.allParams();
    if (!params.id) return res.badRequest(ErrorMessages.ROLE_ID_REQUIRED);
    // CHECK NAME
    if (!params.name || !params.name.trim().length) return res.badRequest(ErrorMessages.ROLE_NAME_REQUIRED);

    // QUERY & CHECK DATA ROLE
    const role = await RoleService.get({ id: params.id });
    if (!role) return res.notFound(ErrorMessages.ROLE_NOT_FOUND);

    let permissions = {
      album: {
        view: params.viewAlbumPermission && params.viewAlbumPermission == 'on' ? true : false,
        add: params.addAlbumPermission && params.addAlbumPermission == 'on' ? true : false,
        edit: params.editAlbumPermission && params.editAlbumPermission == 'on' ? true : false,
        delete: params.deleteAlbumPermission && params.deleteAlbumPermission == 'on' ? true : false,
      },
      attendent: {
        view: params.viewAttendentPermission && params.viewAttendentPermission == 'on' ? true : false,
        add: params.addAttendentPermission && params.addAttendentPermission == 'on' ? true : false,
        edit: params.editAttendentPermission && params.editAttendentPermission == 'on' ? true : false,
        delete: params.deleteAttendentPermission && params.deleteAttendentPermission == 'on' ? true : false,
      },
      branch: {
        view: params.viewBranchPermission && params.viewBranchPermission == 'on' ? true : false,
        add: params.addBranchPermission && params.addBranchPermission == 'on' ? true : false,
        edit: params.editBranchPermission && params.editBranchPermission == 'on' ? true : false,
        delete: params.deleteBranchPermission && params.deleteBranchPermission == 'on' ? true : false,
      },
      class: {
        view: params.viewClassPermission && params.viewClassPermission == 'on' ? true : false,
        add: params.addClassPermission && params.addClassPermission == 'on' ? true : false,
        edit: params.editClassPermission && params.editClassPermission == 'on' ? true : false,
        delete: params.deleteClassPermission && params.deleteClassPermission == 'on' ? true : false,
      },
      courseSession: {
        view: params.viewCourseSessionPermission && params.viewCourseSessionPermission == 'on' ? true : false,
        add: params.addCourseSessionPermission && params.addCourseSessionPermission == 'on' ? true : false,
        edit: params.editCourseSessionPermission && params.editCourseSessionPermission == 'on' ? true : false,
        delete: params.deleteCourseSessionPermission && params.deleteCourseSessionPermission == 'on' ? true : false,
      },
      currency: {
        view: params.viewCurrencyPermission && params.viewCurrencyPermission == 'on' ? true : false,
        add: params.addCurrencyPermission && params.addCurrencyPermission == 'on' ? true : false,
        edit: params.editCurrencyPermission && params.editCurrencyPermission == 'on' ? true : false,
        delete: params.deleteCurrencyPermission && params.deleteCurrencyPermission == 'on' ? true : false,
      },
      event: {
        view: params.viewEventPermission && params.viewEventPermission == 'on' ? true : false,
        add: params.addEventPermission && params.addEventPermission == 'on' ? true : false,
        edit: params.editEventPermission && params.editEventPermission == 'on' ? true : false,
        delete: params.deleteEventPermission && params.deleteEventPermission == 'on' ? true : false,
      },
      feeInvoice: {
        view: params.viewFeeInvoicePermission && params.viewFeeInvoicePermission == 'on' ? true : false,
        add: params.addFeeInvoicePermission && params.addFeeInvoicePermission == 'on' ? true : false,
        edit: params.editFeeInvoicePermission && params.editFeeInvoicePermission == 'on' ? true : false,
        delete: params.deleteFeeInvoicePermission && params.deleteFeeInvoicePermission == 'on' ? true : false,
      },
      feeItem: {
        view: params.viewFeeItemPermission && params.viewFeeItemPermission == 'on' ? true : false,
        add: params.addFeeItemPermission && params.addFeeItemPermission == 'on' ? true : false,
        edit: params.editFeeItemPermission && params.editFeeItemPermission == 'on' ? true : false,
        delete: params.deleteFeeItemPermission && params.deleteFeeItemPermission == 'on' ? true : false,
      },
      food: {
        view: params.viewFoodPermission && params.viewFoodPermission == 'on' ? true : false,
        add: params.addFoodPermission && params.addFoodPermission == 'on' ? true : false,
        edit: params.editFoodPermission && params.editFoodPermission == 'on' ? true : false,
        delete: params.deleteFoodPermission && params.deleteFoodPermission == 'on' ? true : false,
      },
      menu: {
        view: params.viewMenuPermission && params.viewMenuPermission == 'on' ? true : false,
        add: params.addMenuPermission && params.addMenuPermission == 'on' ? true : false,
        edit: params.editMenuPermission && params.editMenuPermission == 'on' ? true : false,
        delete: params.deleteMenuPermission && params.deleteMenuPermission == 'on' ? true : false,
      },
      notification: {
        view: params.viewNotificationPermission && params.viewNotificationPermission == 'on' ? true : false,
        add: params.addNotificationPermission && params.addNotificationPermission == 'on' ? true : false,
        edit: params.editNotificationPermission && params.editNotificationPermission == 'on' ? true : false,
        delete: params.deleteNotificationPermission && params.deleteNotificationPermission == 'on' ? true : false,
      },
      parent: {
        view: params.viewParentPermission && params.viewParentPermission == 'on' ? true : false,
        add: params.addParentPermission && params.addParentPermission == 'on' ? true : false,
        edit: params.editParentPermission && params.editParentPermission == 'on' ? true : false,
        delete: params.deleteParentPermission && params.deleteParentPermission == 'on' ? true : false,
      },
      pickUp: {
        view: params.viewPickUpPermission && params.viewPickUpPermission == 'on' ? true : false,
        add: params.addPickUpPermission && params.addPickUpPermission == 'on' ? true : false,
        edit: params.editPickUpPermission && params.editPickUpPermission == 'on' ? true : false,
        delete: params.deletePickUpPermission && params.deletePickUpPermission == 'on' ? true : false,
      },
      post: {
        view: params.viewPostPermission && params.viewPostPermission == 'on' ? true : false,
        add: params.addPostPermission && params.addPostPermission == 'on' ? true : false,
        edit: params.editPostPermission && params.editPostPermission == 'on' ? true : false,
        delete: params.deletePostPermission && params.deletePostPermission == 'on' ? true : false,
      },
      schedule: {
        view: params.viewSchedulePermission && params.viewSchedulePermission == 'on' ? true : false,
        add: params.addSchedulePermission && params.addSchedulePermission == 'on' ? true : false,
        edit: params.editSchedulePermission && params.editSchedulePermission == 'on' ? true : false,
        delete: params.deleteSchedulePermission && params.deleteSchedulePermission == 'on' ? true : false,
      },
      student: {
        view: params.viewStudentPermission && params.viewStudentPermission == 'on' ? true : false,
        add: params.addStudentPermission && params.addStudentPermission == 'on' ? true : false,
        edit: params.editStudentPermission && params.editStudentPermission == 'on' ? true : false,
        delete: params.deleteStudentPermission && params.deleteStudentPermission == 'on' ? true : false,
      },
      subject: {
        view: params.viewSubjectPermission && params.viewSubjectPermission == 'on' ? true : false,
        add: params.addSubjectPermission && params.addSubjectPermission == 'on' ? true : false,
        edit: params.editSubjectPermission && params.editSubjectPermission == 'on' ? true : false,
        delete: params.deleteSubjectPermission && params.deleteSubjectPermission == 'on' ? true : false,
      },
      taxonomy: {
        view: params.viewTaxonomyPermission && params.viewTaxonomyPermission == 'on' ? true : false,
        add: params.addTaxonomyPermission && params.addTaxonomyPermission == 'on' ? true : false,
        edit: params.editTaxonomyPermission && params.editTaxonomyPermission == 'on' ? true : false,
        delete: params.deleteTaxonomyPermission && params.deleteTaxonomyPermission == 'on' ? true : false,
      },
      user: {
        view: params.viewUserPermission && params.viewUserPermission == 'on' ? true : false,
        add: params.addUserPermission && params.addUserPermission == 'on' ? true : false,
        edit: params.editUserPermission && params.editUserPermission == 'on' ? true : false,
        delete: params.deleteUserPermission && params.deleteUserPermission == 'on' ? true : false,
      },
    };
    let editData = {
      name: params.name,
      description: params.description,
      permissions: permissions
    }
    let updatedRole = await RoleService.edit({ id: params.id }, editData);
    return res.ok(updatedRole);
  },

  deleteRole: async (req, res) => {
    sails.log.info("================================ SuperAdminController.deleteRole => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();
    if (!params.id) return res.badRequest(ErrorMessages.ROLE_ID_REQUIRED);

    // QUERY & CHECK DATA ROLE
    const role = await RoleService.get({ id: params.id });
    if (!role) return res.notFound(ErrorMessages.ROLE_NOT_FOUND);
    //remove role from user
    await User.update({ role: params.id }).set({ role: null });

    await RoleService.del({ id: params.id });

    // RETURN DATA ROLE
    return res.ok(role);
  },
  searchAgency: async (req, res) => {
    sails.log.info("================================ SuperAdminController.searchAgency => START ================================");
    // GET ALL PARAMS
    let params = req.allParams();
    let keyword = params.search ? params.search.value : null;
    let draw = (params.draw) ? parseInt(params.draw) : 1;
    let limit = (params.length) ? parseInt(params.length) : null;
    let skip = (params.start) ? parseInt(params.start) : null;
    //CREATE SORT
    let newSort = {};
    if (params.order) {
      let objOrder = {};
      objOrder[params.columns[params.order[0].column].data] = params.order[0].dir;
      // sort = [objOrder];
      for (var key in objOrder) {
        if (objOrder[key] == 'desc') {
          newSort[key] = -1;
        } else {
          newSort[key] = 1;
        }
      }
    } else {
      newSort = { createdAt: -1 };
    }
    // CREATE WHERE
    let where = {};
    if (typeof keyword === "string" && keyword.length > 0) {
      where = {
        $or: [
          { code: { $regex: keyword, $options: 'i' } },
          { name: { $regex: keyword, $options: 'i' } },
        ]
      }
    }
    /**SEARCH CASE_INSENSITIVE */
    const collection = Agency.getDatastore().manager.collection(Agency.tableName);
    let result = [];
    if (params.length && params.start) {
      result = await collection.find(where).limit(limit).skip(skip).sort(newSort);
    } else {
      result = await collection.find(where).sort(newSort);
    }
    const totalAgency = await collection.count(where);
    const dataWithObjectIds = await result.toArray();
    const arrObjAgencys = JSON.parse(JSON.stringify(dataWithObjectIds).replace(/"_id"/g, '"id"'));
    // LIST AGENCY
    let resAgencys = [];
    for (let agency of arrObjAgencys) {
      let tmpData = {};
      tmpData.id = '<input class="js-checkbox-item" type="checkbox" value="' + agency.id + '">';
      tmpData.code = agency.code;
      tmpData.name = agency.name;
      tmpData.emailAddress = agency.emailAddress;
      tmpData.address = agency.address;
      tmpData.phone = agency.phone;
      tmpData.tool =
        `<div class="btn-group-action">
          <div class="btn-group pull-right">
          <a href="/sa/agency/edit/${agency.id}" data-id="${agency.id}" title="Edit" class="edit btn btn-default edit-row">
            <i class="mdi mdi-pencil"></i>
          </a>
            <button class="btn btn-default dropdown-toggle" data-toggle="dropdown">
              <i class="icon-caret-down"></i>
            </button>
            <ul class="dropdown-menu">
              <li>
                <a href="javascript:void(0);" data-id="${agency.id}" class="remove-row">
                  <i class="mdi mdi-delete"></i>Delete
                </a>
              </li>
            </ul>
          </div>
        </div>`;
      resAgencys.push(tmpData);
    };
    // RETURN RESULT
    return res.ok({ draw: draw, recordsTotal: totalAgency, recordsFiltered: totalAgency, data: resAgencys });
  },
  addAgency: async (req, res) => {
    sails.log.info('================================ SuperAdminController.addAgency => START ================================');

    let params = req.allParams();
    // CHECK REQUIRED DATAFIELD FOR AGENCY
    if (!params.code || !params.code.trim().length) return res.badRequest(ErrorMessages.AGENCY_CODE_REQUIRED);
    if (!params.name) return res.badRequest(ErrorMessages.AGENCY_NAME_REQUIRED);
    if (!params.emailAddress) return res.badRequest(ErrorMessages.AGENCY_EMAIL_REQUIRED);
    if (!params.phone) return res.badRequest(ErrorMessages.AGENCY_PHONE_REQUIRED);
    if (!params.password) return res.badRequest(ErrorMessages.AGENCY_PASSWORD_REQUIRED);
    if (params.password != params.passwordConfirm) return res.badRequest(ErrorMessages.PASSWORD_IS_NOT_MATCH);
    // CHECK DUPLICATE
    // EMAIL
    let checkMailExist = await AgencyService.get({ emailAddress: params.emailAddress.toLowerCase() });
    if (checkMailExist) return res.badRequest(ErrorMessages.AGENCY_EMAIL_HAS_BEEN_REGISTERED);
    // PHONE
    let checkPhoneExist = await SchoolService.get({ phone: params.phone });
    if (checkPhoneExist) return res.badRequest(ErrorMessages.AGENCY_PHONE_HAS_BEEN_REGISTERED);
    // NAME
    let checkNameExist = await SchoolService.get({ name: params.name });
    if (checkNameExist) return res.badRequest(ErrorMessages.AGENCY_NAME_HAS_BEEN_REGISTERED);
    // CODE
    let code = accents.remove(params.code).replace(/\s/g, '');
    let checkCodeExist = await SchoolService.get({ code: code });
    if (checkCodeExist) return res.badRequest(ErrorMessages.AGENCY_CODE_HAS_BEEN_REGISTERED);
    // CREATE AGENCY OBJ
    let dataAgency = {
      code: code,
      name: params.name,
      emailAddress: params.emailAddress.toLowerCase(),
      phone: params.phone,
      address: params.address,
      password: await sails.helpers.passwords.hashPassword(params.password)
    };
    let newAgency = await AgencyService.add(dataAgency);
    return res.json(newAgency);
  },
  editAgency: async (req, res) => {
    sails.log.info('================================ SuperAdminController.editAgency => START ================================');
    let params = req.allParams();
    // CHECK REQUIRED DATAFIELD FOR AGENCY
    if (!params.id) return res.badRequest(ErrorMessages.AGENCY_ID_REQUIRED);
    if (!params.code || !params.code.trim().length) return res.badRequest(ErrorMessages.AGENCY_CODE_REQUIRED);
    if (!params.name) return res.badRequest(ErrorMessages.AGENCY_NAME_REQUIRED);
    if (!params.emailAddress) return res.badRequest(ErrorMessages.AGENCY_EMAIL_REQUIRED);
    if (!params.phone) return res.badRequest(ErrorMessages.AGENCY_PHONE_REQUIRED);
    if (params.password != params.passwordConfirm) return res.badRequest(ErrorMessages.PASSWORD_IS_NOT_MATCH);
    // CHECK DUPLICATE
    // EMAIL
    let checkPhoneExist = await AgencyService.get({ id: { '!=': params.id }, phone: params.phone });
    if (checkPhoneExist) return res.badRequest(ErrorMessages.AGENCY_PHONE_HAS_BEEN_REGISTERED);
    // NAME
    let checkNameExist = await AgencyService.get({ id: { '!=': params.id }, name: params.name });
    if (checkNameExist) return res.badRequest(ErrorMessages.AGENCY_NAME_HAS_BEEN_REGISTERED);
    // CODE
    let code = accents.remove(params.code).replace(/\s/g, '');
    let checkCodeExist = await AgencyService.get({ id: { '!=': params.id }, code: code });
    if (checkCodeExist) return res.badRequest(ErrorMessages.AGENCY_CODE_HAS_BEEN_REGISTERED);

    let dataAgency = {
      code: code,
      name: params.name,
      // emailAddress: params.emailAddress,
      phone: params.phone,
      address: params.address
    };
    if (params.password && params.password != '') {
      dataAgency.password = await sails.helpers.passwords.hashPassword(params.password);
    }
    //ALWAYS CHECK  OBJECT EXIST BEFORE UPDATE
    let agency = await Agency.findOne({ id: params.id });
    if (!agency) return res.notFound(ErrorMessages.AGENCY_NOT_FOUND);

    //UPDATE DATA
    let editAgency = await AgencyService.edit({ id: params.id }, dataAgency);
    return res.json(editAgency);
  },
  deleteAgency: async (req, res) => {
    sails.log.info("================================ SuperAdminController.deleteAgency => START ================================");
    // GET ALL PARAMS
    let params = req.allParams();
    if (!params.ids) return res.badRequest(ErrorMessages.SCHOOL_ID_REQUIRED);
    let ids = params.ids;
    if (params.ids.indexOf(';') != -1) {
      ids = ids.split(';');
    }
    if (typeof (ids) == 'object') {
      for (let i = 0; i < ids.length; i++) {
        let dataObj = await AgencyService.get({
          id: ids[i]
        });
        if (!dataObj) return res.badRequest(ErrorMessages.AGENCY_NOT_FOUND);
        else {
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
          let arrSchool = await School.find({ agency: ids[i] });
          for (school of arrSchool) {
            await deleteSchoolData(school.id);
            await School.destroy({ id: school.id });
          }
          await AgencyService.del(ids[i]);
        }
      }
    } else {
      //ALWAYS CHECK  OBJECT EXIST
      let dataObj = await AgencyService.get({
        id: ids
      });
      if (!dataObj) return res.badRequest(ErrorMessages.AGENCY_NOT_FOUND);
      else {
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
        let arrSchool = await School.find({ agency: ids });
        for (school of arrSchool) {
          await deleteSchoolData(school.id);
          await School.destroy({ id: school.id });
        }
        await AgencyService.del(ids);
      }
    }
    // RETURN DATA
    return res.json({ status: 1 });
  }
}
