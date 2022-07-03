module.exports = {
  friendlyName: "Generate default web module",
  description: "Generate default web module",

  inputs: {
    req: {
      type: "ref",
      description: "The current incoming request (req).",
      required: true,
    },
  },
  exits: {
    success: {},
  },
  fn: async function (inputs, exits) {
    let _actions = [];
    let _filter = {
      search: false,
      class: false,
      gender: false,
      status: false,
      date: false,
      userType: false,
      category: false,
      tag: false,
      detailMedical: false,
    };

    let _default = {
      headline: "",
      description: "",
      url: inputs.req.options.action,
      actions: _actions,
      isFilter: false,
      filters: _filter,
    };

    let params = inputs.req.allParams();

    switch (inputs.req.options.action) {
      //---------------------SUPERADMIN SCHOOL LIST---------------------
      case "backend/superadmin/school":
        _default.headline = sails.__("School");
        _default.description = sails.__("School");
        if (inputs.req.me.isSuperAdmin) {
          _default.actions = [
            {
              title: sails.__("Add new school"),
              href: "/sa/school/add",
            },
          ];
        }
        break;

      //---------------------AGENCY INDEX---------------------
      case "backend/agency/index":
        _default.headline = sails.__("List school");
        _default.description = sails.__("List school");
        if (inputs.req.me.isAgency) {
          _default.actions = [
            {
              title: sails.__("Add new school"),
              href: "/agency/school/add",
            },
          ];
        }
        break;

      //---------------------SUPERADMIN AGENCY LIST---------------------
      case "backend/superadmin/agency":
        _default.headline = sails.__("Agency");
        _default.description = sails.__("Agency");
        if (inputs.req.me.isSuperAdmin) {
          _default.actions = [
            {
              title: sails.__("Add new agency"),
              href: "/sa/agency/add",
            },
          ];
        }
        break;

      //---------------------SUPERADMIN EDIT SCHOOL---------------------
      case "backend/superadmin/form-school":
        _default.headline = sails.__("School");
        _default.description = sails.__("School");
        break;

      //---------------------SUPERADMIN EDIT SCHOOL ADMIN---------------------
      case "backend/superadmin/form-school-admin":
        _default.headline = sails.__("School Admin");
        _default.description = sails.__("School Admin");
        break;

      //---------------------SUPERADMIN ROLE---------------------
      case "backend/superadmin/role":
        _default.headline = sails.__("Role");
        _default.description = sails.__("Role");
        if (inputs.req.me.isSuperAdmin) {
          _default.actions = [
            {
              title: sails.__("Add new role"),
              modal: "#modal-add",
            },
          ];
        }
        break;

      //---------------------DASHBOARD---------------------
      case "backend/dashboard/index":
        _default.headline = sails.__("Dashboard");
        _default.description = sails.__("Dashboard");
        break;

      //---------------------SETTING---------------------
      case "backend/setting/index":
        _default.headline = sails.__("Settings");
        _default.description = sails.__("Settings");
        break;

      //---------------------FEE COLLECTION SETTING---------------------
      case "backend/setting/fee-collection-setting":
        _default.headline = sails.__("Settings");
        _default.description = sails.__("Settings");
        break;

      //---------------------STUDENT---------------------
      case "backend/student/list":
        _default.headline = sails.__("Students");
        _default.description = sails.__("Students");
        if (
          inputs.req.me.isMainSchoolAdmin ||
          (inputs.req.me.role &&
            inputs.req.me.role.permissions &&
            inputs.req.me.role.permissions.student &&
            inputs.req.me.role.permissions.student.add)
        ) {
          _default.actions = [
            {
              title: sails.__("Add New"),
              href: "/backend/student/add",
            },
            {
              title: sails.__("Import"),
              href: "/backend/class-" + params.classId + "/importStudent",
            },
          ];
        }

        _default.isFilter = true;
        _default.filters.search = true;
        _default.filters.class = true;
        _default.filters.gender = true;
        _default.filters.status = true;

        break;
      case "backend/student/form":
        if (inputs.req.params.id) {
          _default.headline = sails.__("Edit student");
          _default.description = sails.__("Edit student");
          _default.actions = [];
        } else {
          _default.headline = sails.__("Add new student");
          _default.description = sails.__("Add new student");
          _default.actions = [];
        }
        break;

      //---------------------POST (NEWS)---------------------
      case "backend/post/form":
        if (inputs.req.params.id) {
          _default.headline = sails.__("Edit post");
          _default.description = sails.__("Edit post");
        } else {
          _default.headline = sails.__("Add new post");
          _default.description = sails.__("Add new post");
        }
        break;
      case "backend/post/list":
        _default.headline = sails.__("Posts");
        _default.description = sails.__("Posts");
        if (
          inputs.req.me.isMainSchoolAdmin ||
          (inputs.req.me.role &&
            inputs.req.me.role.permissions &&
            inputs.req.me.role.permissions.post &&
            inputs.req.me.role.permissions.post.add)
        ) {
          _default.actions = [
            {
              title: sails.__("Add new post"),
              href: "/backend/post/add",
            },
          ];
        }

        _default.isFilter = true;
        _default.filters.search = true;
        _default.filters.category = true;
        _default.filters.tag = true;
        _default.filters.status = true;

        break;

      //---------------------POST (PAGE)---------------------
      case "backend/page/form":
        if (inputs.req.params.id) {
          _default.headline = sails.__("Edit page");
          _default.description = sails.__("Edit page");
        } else {
          _default.headline = sails.__("Add new page");
          _default.description = sails.__("Add new page");
        }
        break;
      case "backend/page/list":
        _default.headline = sails.__("Pages");
        _default.description = sails.__("Pages");
        if (
          inputs.req.me.isMainSchoolAdmin ||
          (inputs.req.me.role &&
            inputs.req.me.role.permissions &&
            inputs.req.me.role.permissions.post &&
            inputs.req.me.role.permissions.post.add)
        ) {
          _default.actions = [
            {
              title: sails.__("Add new page"),
              href: "/backend/page/add",
            },
          ];
        }
        break;

      //---------------------USER---------------------
      case "backend/user/index":
        _default.headline = sails.__("Staffs");
        _default.description = sails.__("Staffs");
        if (
          inputs.req.me.isMainSchoolAdmin ||
          (inputs.req.me.role &&
            inputs.req.me.role.permissions &&
            inputs.req.me.role.permissions.student &&
            inputs.req.me.role.permissions.student.add)
        ) {
          _default.actions = [
            {
              title: sails.__("Add New"),
              href: "/backend/user/add",
            },
            {
              title: sails.__("Import"),
              href: "/backend/class-" + params.classId + "/importStudent",
            },
          ];
        }
        _default.isFilter = true;
        _default.filters.search = true;
        _default.filters.userTypeNewVersion = true;
        break;
      //---------------------USER-FORM---------------------
      case "backend/user/form":
        if (inputs.req.params.id) {
          _default.headline = sails.__("Edit staff");
          _default.description = sails.__("Edit staff");
        } else {
          _default.headline = sails.__("Add new");
          _default.description = sails.__("Add new");
        }
        break;
      //---------------------STUDENT-MASTER---------------------
      case "backend/studentmaster/index":
        _default.headline = sails.__("StudentMaster");
        _default.description = sails.__("StudentMaster");
        if (
          inputs.req.me.isMainSchoolAdmin ||
          (inputs.req.me.role &&
            inputs.req.me.role.permissions &&
            inputs.req.me.role.permissions.student &&
            inputs.req.me.role.permissions.student.add)
        ) {
          _default.actions = [
            {
              title: sails.__("Add New"),
              href: "/backend/student/add",
            },
            {
              title: sails.__("Import"),
              href: "/backend/class-" + params.classId + "/importStudent",
            },
          ];
        }

        _default.isFilter = true;
        _default.filters.search = true;
        _default.filters.class = true;
        _default.filters.gender = true;
        _default.filters.status = true;
        break;
      //---------------------LIST-STUDENT-MASTER---------------------
      case "backend/studentmaster/list":
        _default.headline = sails.__("StudentMaster");
        _default.description = sails.__("StudentMaster");

        _default.isFilter = true;
        _default.filters.search = true;
        _default.filters.class = true;
        _default.filters.gender = true;
        _default.filters.status = true;
        break;
      //---------------------COURSE-SESSION---------------------
      case "backend/coursesession/index":
        _default.headline = sails.__("Course sessions");
        _default.description = sails.__("Course sessions");
        if (
          inputs.req.me.isMainSchoolAdmin ||
          (inputs.req.me.role &&
            inputs.req.me.role.permissions &&
            inputs.req.me.role.permissions.courseSession &&
            inputs.req.me.role.permissions.courseSession.add)
        ) {
          _default.actions = [
            {
              title: sails.__("Add new"),
              modal: "#modal-edit",
            },
          ];
        }
        break;
      //---------------------SUBJECT---------------------
      case "backend/subject/index":
        _default.headline = sails.__("Subjects");
        _default.description = sails.__("Subjects");
        if (
          inputs.req.me.isMainSchoolAdmin ||
          (inputs.req.me.role &&
            inputs.req.me.role.permissions &&
            inputs.req.me.role.permissions.subject &&
            inputs.req.me.role.permissions.subject.add)
        ) {
          _default.actions = [
            {
              title: sails.__("Add new"),
              modal: "#modal-edit",
            },
            {
              title: sails.__("Import"),
              href: "/backend/importSubject",
            },
          ];
        }

        break;
      //---------------------FOOD---------------------
      case "backend/food/index":
        _default.headline = sails.__("Foods");
        _default.description = sails.__("Foods");
        if (
          inputs.req.me.isMainSchoolAdmin ||
          (inputs.req.me.role &&
            inputs.req.me.role.permissions &&
            inputs.req.me.role.permissions.food &&
            inputs.req.me.role.permissions.food.add)
        ) {
          _default.actions = [
            {
              title: sails.__("Add new"),
              modal: "#modal-edit",
            },
            {
              title: sails.__("Import"),
              href: "/backend/importFood",
            },
          ];
        }

        break;
      //---------------------BRANCH---------------------
      case "backend/branch/index":
        _default.headline = sails.__("Branches");
        _default.description = sails.__("Branches");
        if (
          inputs.req.me.isMainSchoolAdmin ||
          (inputs.req.me.role &&
            inputs.req.me.role.permissions &&
            inputs.req.me.role.permissions.branch &&
            inputs.req.me.role.permissions.branch.add)
        ) {
          _default.actions = [
            {
              title: sails.__("Add new"),
              modal: "#modal-edit",
            },
          ];
        }

        break;
      //---------------------BRANCH ACTIVITIES---------------------
      case "backend/branch/activities":
        _default.headline = sails.__("Branches");
        _default.description = sails.__("Branches");

        if (params.branchId) {
          let branchObj = await Branch.findOne({ id: params.branchId });
          _default.headline = branchObj.title;
          _default.description = branchObj.title;
        }

        break;
      //---------------------CLASS---------------------
      case "backend/class/list":
        _default.headline = sails.__("Classes");
        _default.description = sails.__("Classes");
        if (
          inputs.req.me.isMainSchoolAdmin ||
          (inputs.req.me.role &&
            inputs.req.me.role.permissions &&
            inputs.req.me.role.permissions.class &&
            inputs.req.me.role.permissions.class.add)
        ) {
          _default.actions = [
            {
              title: sails.__("Add new"),
              modal: "#modal-edit",
            },
          ];
        }

        break;

      //---------------------CLASS---------------------
      case "backend/class/change":
        _default.headline = sails.__("Change class");
        _default.description = sails.__("Change class");

        _default.isFilter = true;
        _default.filters.search = true;
        _default.filters.class = true;
        break;
      //---------------------CATEGORY---------------------
      case "backend/taxonomy/categories":
        _default.headline = sails.__("Categories");
        _default.description = sails.__("Categories");
        if (
          inputs.req.me.isMainSchoolAdmin ||
          (inputs.req.me.role &&
            inputs.req.me.role.permissions &&
            inputs.req.me.role.permissions.taxonomy &&
            inputs.req.me.role.permissions.taxonomy.add)
        ) {
          _default.actions = [
            {
              title: sails.__("Add new"),
              modal: "#modal-edit",
            },
          ];
        }

        break;
      //---------------------TAGS---------------------
      case "backend/taxonomy/tag":
        _default.headline = sails.__("Tags");
        _default.description = sails.__("Tags");
        if (
          inputs.req.me.isMainSchoolAdmin ||
          (inputs.req.me.role &&
            inputs.req.me.role.permissions &&
            inputs.req.me.role.permissions.taxonomy &&
            inputs.req.me.role.permissions.taxonomy.add)
        ) {
          _default.actions = [
            {
              title: sails.__("Add new"),
              modal: "#modal-edit",
            },
          ];
        }

        break;
      //---------------------NOTIFICATION---------------------
      case "backend/notification/list":
        _default.headline = sails.__("Notifications");
        _default.description = sails.__("Notifications");
        if (
          inputs.req.me.isMainSchoolAdmin ||
          (inputs.req.me.role &&
            inputs.req.me.role.permissions &&
            inputs.req.me.role.permissions.notification &&
            inputs.req.me.role.permissions.notification.add)
        ) {
          _default.actions = [
            {
              title: sails.__("Add new"),
              modal: "#modal-edit",
            },
          ];
        }

        break;
      //---------------------ALBUM-FORM---------------------
      case "backend/album/form":
        if (inputs.req.params.id) {
          _default.headline = sails.__("Edit album");
          _default.description = sails.__("Edit album");
        } else {
          _default.headline = sails.__("Add New");
          _default.description = sails.__("Add New");
        }
        _default.actions = [];
        break;
      //---------------------ALBUM-VIEW---------------------
      case "backend/album/view":
        _default.headline = sails.__("View album");
        _default.description = sails.__("View album");
        _default.actions = [];
        break;
      //---------------------ALBUM---------------------
      case "backend/album/list":
        _default.headline = sails.__("Albums");
        _default.description = sails.__("Albums");
        if (
          inputs.req.me.isMainSchoolAdmin ||
          (inputs.req.me.role &&
            inputs.req.me.role.permissions &&
            inputs.req.me.role.permissions.album &&
            inputs.req.me.role.permissions.album.add)
        ) {
          _default.actions = [
            {
              title: sails.__("Add New"),
              href: "/backend/album/add",
            },
          ];
        }

        break;
      //---------------------PARENT---------------------
      case "backend/parent/list":
        _default.headline = sails.__("Parent");
        _default.description = sails.__("Parent");
        if (
          inputs.req.me.isMainSchoolAdmin ||
          (inputs.req.me.role &&
            inputs.req.me.role.permissions &&
            inputs.req.me.role.permissions.parent &&
            inputs.req.me.role.permissions.parent.add)
        ) {
          _default.actions = [
            {
              title: sails.__("Add new"),
              href: "/backend/parent/add",
            },
            {
              title: sails.__("Import"),
              href: "/backend/class-" + params.classId + "/importParent",
            },
          ];
        }

        _default.isFilter = true;
        _default.filters.search = true;
        _default.filters.class = true;
        //_default.filters.status = true;

        break;
      //---------------------PARENT-FORM---------------------
      case "backend/parent/form":
        if (inputs.req.params.id) {
          _default.headline = sails.__("Edit parent");
          _default.description = sails.__("Edit parent");
        } else {
          _default.headline = sails.__("Add new");
          _default.description = sails.__("Add new");
        }
        break;
      //---------------------IMPORT-PARENT---------------------
      case "backend/import/parent":
        _default.headline = sails.__("Import parent");
        _default.description = sails.__("Import parent");
        break;
      //---------------------IMPORT-STUDENT---------------------
      case "backend/import/form":
        _default.headline = sails.__("Import students");
        _default.description = sails.__("Import students");
        break;
      //---------------------ATTENDENT---------------------
      case "backend/attendent/index":
        _default.headline = sails.__("Attendance");
        _default.description = sails.__("Attendance");

        _default.isFilter = true;
        _default.filters.search = true;
        _default.filters.class = true;
        _default.filters.date = true;
        break;
      //---------------------PICKUP---------------------
      case "backend/pickup/index":
        _default.headline = sails.__("Pickup");
        _default.description = sails.__("Pickup");

        _default.isFilter = true;
        _default.filters.search = true;
        _default.filters.class = true;
        _default.filters.date = true;
        break;
      //---------------------SCHEDULE---------------------
      case "backend/schedule/index":
        _default.headline = sails.__("Schedule");
        _default.description = sails.__("Schedule");
        if (
          inputs.req.me.isMainSchoolAdmin ||
          (inputs.req.me.role &&
            inputs.req.me.role.permissions &&
            inputs.req.me.role.permissions.schedule &&
            inputs.req.me.role.permissions.schedule.add)
        ) {
          _default.actions = [
            {
              title: sails.__("Add new"),
              modal: "#modalSchedule",
            },
            {
              title: sails.__("Import"),
              href: "/backend/importSchedule",
            },
          ];
        }
        break;
      //---------------------MENU---------------------
      case "backend/menu/index":
        _default.headline = sails.__("Menu");
        _default.description = sails.__("Menu");
        if (
          inputs.req.me.isMainSchoolAdmin ||
          (inputs.req.me.role &&
            inputs.req.me.role.permissions &&
            inputs.req.me.role.permissions.menu &&
            inputs.req.me.role.permissions.menu.add)
        ) {
          _default.actions = [
            {
              title: sails.__("Add new"),
              modal: "#modalMenu",
            },
            {
              title: sails.__("Import"),
              href: "/backend/importMenu",
            },
          ];
        }
        break;
      //---------------------MESSENGER---------------------
      case "backend/message/index":
        _default.headline = sails.__("Messengers");
        _default.description = sails.__("Messengers");
        break;
      //---------------------MESSENGER DETAILS ---------------------
      case "backend/message/detail":
        _default.headline = sails.__("Messenger");
        _default.description = sails.__("Messenger");
        break;
      //---------------------PROFILE----------------------
      case "backend/account/view-edit-profile":
        _default.headline = sails.__("Edit profile");
        _default.description = sails.__("Edit profile");

        break;

      //---------------------CURRENCY---------------------
      case "backend/currency/index":
        _default.headline = sails.__("Currency");
        _default.description = sails.__("Currency");
        if (
          inputs.req.me.isMainSchoolAdmin ||
          (inputs.req.me.role &&
            inputs.req.me.role.permissions &&
            inputs.req.me.role.permissions.currency &&
            inputs.req.me.role.permissions.currency.add)
        ) {
          _default.actions = [
            {
              title: sails.__("Add new"),
              modal: "#modal-edit",
            },
          ];
        }

        break;

      //---------------------FEE ITEM---------------------
      case "backend/feeitem/index":
        _default.headline = sails.__("Fee Items");
        _default.description = sails.__("Fee Items");
        if (
          inputs.req.me.isMainSchoolAdmin ||
          (inputs.req.me.role &&
            inputs.req.me.role.permissions &&
            inputs.req.me.role.permissions.feeItem &&
            inputs.req.me.role.permissions.feeItem.add)
        ) {
          _default.actions = [
            {
              title: sails.__("Add new"),
              modal: "#modal-edit",
            },
          ];
        }

        break;

      //---------------------FEE INVOICE---------------------
      case "backend/feeinvoice/index":
        _default.headline = sails.__("Fee Invoices");
        _default.description = sails.__("Fee Invoices");
        if (
          inputs.req.me.isMainSchoolAdmin ||
          (inputs.req.me.role &&
            inputs.req.me.role.permissions &&
            inputs.req.me.role.permissions.feeInvoice &&
            inputs.req.me.role.permissions.feeInvoice.add)
        ) {
          _default.actions = [
            {
              title: sails.__("Add new"),
              href: "/backend/feeinvoice/add",
            },
          ];
        }

        break;

      //---------------------ADD FEE INVOICE---------------------
      case "backend/feeinvoice/form":
        _default.headline = sails.__("Add Fee Invoices");
        _default.description = sails.__("Add Fee Invoices");

        break;

      //---------------------POST---------------------
      case "backend/event/form":
        if (inputs.req.params.id) {
          _default.headline = sails.__("Edit event");
          _default.description = sails.__("Edit event");
        } else {
          _default.headline = sails.__("Add new event");
          _default.description = sails.__("Add new event");
        }

        break;
      case "backend/event/list":
        _default.headline = sails.__("Events");
        _default.description = sails.__("Events");
        if (
          inputs.req.me.isMainSchoolAdmin ||
          (inputs.req.me.role &&
            inputs.req.me.role.permissions &&
            inputs.req.me.role.permissions.event &&
            inputs.req.me.role.permissions.event.add)
        ) {
          _default.actions = [
            {
              title: sails.__("Add new"),
              href: "/backend/event/add",
            },
          ];
        }

        break;

      //---------------------MEDICAL---------------------
      case "backend/medical/form":
        if (inputs.req.params.id) {
          _default.headline = sails.__("Edit medical");
          _default.description = sails.__("Edit medical");
        } else {
          _default.headline = sails.__("Add new medical");
          _default.description = sails.__("Add new medical");
        }

        break;
      case "backend/medical/edit":
        _default.headline = sails.__("Edit student medical");
        _default.description = sails.__("Edit student medical");

        break;
      case "backend/medical/list":
        _default.headline = sails.__("Medical");
        _default.description = sails.__("Medical");
        if (inputs.req.me.isMainSchoolAdmin) {
          _default.actions = [
            {
              title: sails.__("Add new"),
              href: "/backend/medical/add",
            },
          ];
        }
        _default.isFilter = true;
        _default.filters.search = true;
        _default.filters.class = true;
        break;
      case "backend/medical/detail":
        _default.headline = sails.__("Medical Student");
        _default.description = sails.__("Medical Student");
        if (inputs.req.params && inputs.req.params.id) {
          let medical = {};
          medical = await Medical.findOne({
            id: inputs.req.params.id,
          }).populate("classObj");
          if (medical && medical.classObj && medical.classObj.title) {
            _default.headline =
              sails.__("Medical Student") + ": " + medical.classObj.title;
            _default.description =
              sails.__("Medical Student") + ": " + medical.classObj.title;
          }
        }
        if (inputs.req.me.isMainSchoolAdmin) {
          _default.actions = [
            {
              title: sails.__("Import"),
              href: "/backend/importMedical?id=" + inputs.req.params.id,
            },
          ];
        }
        // if (inputs.req.me.isMainSchoolAdmin) {
        //   _default.actions = [{
        //       'title': sails.__('Add new'),
        //       'href': '/backend/medical/add'
        //     }
        //   ];
        // }
        _default.isFilter = true;
        _default.filters.search = true;
        _default.filters.detailMedical = true;
        //_default.filters.class = true;
        break;

      //---------------------FEE ITEM---------------------
      case "backend/formation/index":
        _default.headline = sails.__("Subjects");
        _default.description = sails.__("Formations");
        if (
          inputs.req.me.isMainSchoolAdmin ||
          (inputs.req.me.role &&
            inputs.req.me.role.permissions &&
            inputs.req.me.role.permissions.formation &&
            inputs.req.me.role.permissions.formation.add)
        ) {
          _default.actions = [
            {
              title: sails.__("Add new"),
              modal: "#modal-edit",
            },
          ];
        }
        break;

      case "backend/report/student-attendance":
        _default.headline = sails.__("Student Attendance");
        _default.description = sails.__("Student Attendance");

        _default.isFilter = true;
        // _default.filters.search = true;
        _default.filters.class = true;
        //_default.filters.date = true;
        _default.filters.rangeDate = true;
        break;

      //---------------------FRONTEND HOME ---------------------
      case "frontend/home/index":
        _default.headline = sails.__("Home");
        _default.description = sails.__("Home");
        break;
      //---------------------FRONTEND LOGIN ---------------------
      case "frontend/user/parent":
        _default.headline = sails.__("Login");
        _default.description = sails.__("Login");
        break;
      //---------------------FRONTEND ACCOUNT ---------------------
      case "frontend/account/profile":
        _default.headline = sails.__("Account");
        _default.description = sails.__("Account");
        break;
      //---------------------FRONTEND TEACHER ---------------------
      case "frontend/teacher/index":
        _default.headline = sails.__("Teachers");
        _default.description = sails.__("Teachers");
        break;

      //---------------------FRONTEND NEWS---------------------
      case "frontend/news/index":
        _default.headline = sails.__("News");
        _default.description = sails.__("News");
        break;

      //---------------------FRONTEND NEWS DETAIL---------------------
      case "frontend/news/detail":
        _default.headline = sails.__("News");
        _default.description = sails.__("News");
        break;

      //---------------------FRONTEND GALLERY---------------------
      case "frontend/gallery/index":
        _default.headline = sails.__("Gallery");
        _default.description = sails.__("Gallery");
        break;

      //---------------------FRONTEND GALLERY DETAIL---------------------
      case "frontend/gallery/detail":
        _default.headline = sails.__("Gallery");
        _default.description = sails.__("Gallery");
        break;

      //---------------------FRONTEND ABOUT US---------------------
      case "frontend/aboutus/index":
        _default.headline = sails.__("About Us");
        _default.description = sails.__("About Us");
        break;

      //---------------------FRONTEND CONTACT---------------------
      case "frontend/contact/index":
        _default.headline = sails.__("Contact");
        _default.description = sails.__("Contact");
        break;
      //---------------------FRONTEND NEWS ---------------------
      case "frontend/news/index":
        _default.headline = sails.__("News");
        _default.description = sails.__("News");
        break;
      //---------------------FRONTEND SUBJECT ---------------------
      case "frontend/subject/index":
        _default.headline = sails.__("Schedule");
        _default.description = sails.__("Schedule");
        break;
      //---------------------FRONTEND EVENT ---------------------
      case "frontend/event/index":
        _default.headline = sails.__("Events");
        _default.description = sails.__("Events");
        break;
      //---------------------FRONTEND EVENT ---------------------
      case "frontend/event/detail":
        _default.headline = sails.__("Event");
        _default.description = sails.__("Event");
        break;
      //---------------------FRONTEND EVENT ---------------------
      case "frontend/health/index":
        _default.headline = sails.__("Health");
        _default.description = sails.__("Health");
        break;
      //---------------------FRONTEND EVENT ---------------------
      case "frontend/menu/index":
        _default.headline = sails.__("Menu");
        _default.description = sails.__("Menu");
        break;
      //---------------------FRONTEND NOTICE ---------------------
      case "frontend/notice/index":
        _default.headline = sails.__("Notice");
        _default.description = sails.__("Notice");
        break;
    }

    return exits.success(_default);
  },
};
