
/**
 * @copyright 2017 @ ZiniMedia Team
 * @author thanhvo
 * @create 2017/10/25 10:52
 * @update 2017/10/25 10:52
 * @file api/controllers/ParentController.js
*/
const ErrorMessages = require('../../../../config/errors');
const ParentService = require('../../../services/ParentService');
const Utils = require('../../../utils');
const moment = require('moment');
const Sharp = require('sharp/lib');

var uniqEs6 = (arrArg) => {
  return arrArg.filter((elem, pos, arr) => {
    return arr.findIndex(r => r.id == elem.id) == pos;
  });
}


const BackendParentController = {

  init: async function (req, res) {
    sails.log.info("================================ ParentController.init => START ================================");
    let data = {
      firstName: "Master",
      lastName: "Admin",
      emailAddress: "admin@gmail.com",
      password: "password",
      phone: "01234",
      birthday: "1/1/2018",
      isSuperAdmin: true,
      token: req.headers.token,
      permission: {}
    };
    let admin = await ParentService.get({ emailAddress: "admin@gmail.com" });
    if (admin) {
      return res.badRequest(ErrorMessages.PARENT_IS_EXISTED);
    }
    let newObj = await ParentService.add(data);
    return res.ok(newObj);
  },

  login: async function (req, res) {
    sails.log.info("================================ ParentController.login => START ================================");
    let params = req.allParams();
    let query = {};
    if (!params.emailAddress) return res.badRequest(ErrorMessages.PARENT_USERNAME_REQUIRED);
    if (!params.password) return res.badRequest(ErrorMessages.PARENT_PASSWORD_REQUIRED);
    query.emailAddress = params.emailAddress.toLowerCase();
    query.password = await sails.helpers.passwords.hashPassword(params.password);
    let result = await ParentService.get(query);
    if (!result) return res.badRequest(ErrorMessages.PARENT_NOT_FOUND);
    result.token = req.headers.token;
    return res.ok(result);
  },

  add: async (req, res) => {
    sails.log.info("================================ ParentController.add => START ================================");
    let params = req.allParams();
    if (!params.userName) return res.badRequest(ErrorMessages.PARENT_USERNAME_REQUIRED);
    if (params.password != params.passwordConfirm) return res.badRequest(ErrorMessages.PARENT_PASSWORD_IS_NOT_MATCH);
    // Call constructor with custom options:

    let emailAddress = (params.emailAddress) ? params.emailAddress : '';
    //let userName = (params.userName) ? params.userName : '';
    let phone = (params.phone) ? params.phone : 0;
    let firstName = (params.firstName) ? params.firstName : '';
    let lastName = (params.lastName) ? params.lastName : '';
    let birthday = (params.birthday) ? params.birthday : '';
    let currentAddress = params.currentAddress ? params.currentAddress : '';
    let status = (params.status) ? parseInt(params.status) : sails.config.custom.STATUS.ACTIVE;
    let gender = (params.gender) ? parseInt(params.gender) : 0;
    if (params.metaFields && !Utils.isJsonString(params.metaFields)) return res.serverError(ErrorMessages.SYSTEM_JSON_FORMAT_FAIL);
    let data = {
      emailAddress: emailAddress,
      userName: params.userName,
      phone: phone,
      password: await sails.helpers.passwords.hashPassword(params.password),
      firstName: firstName,
      lastName: lastName,
      birthday: birthday,
      currentAddress: currentAddress,
      avatar: params.avatar,
      status: status,
      gender: gender,
      school: req.me.school
    };
    // let email = await ParentService.get({ emailAddress: params.emailAddress.toLowerCase() });
    // if (email) {
    //   return res.ok(ErrorMessages.USER_IS_EXISTED);
    // }
    let userNameParent = await ParentService.get({ userName: params.userName });
    if (userNameParent) {
      return res.badRequest(ErrorMessages.USER_IS_EXISTED);
    }
    if (emailAddress != '') {
      let emailParent = await ParentService.get({ emailAddress: emailAddress });
      if (emailParent) {
        return res.badRequest(ErrorMessages.EMAIL_IS_EXISTED);
      }
    }

    // let passwordConfirm = (params.passwordConfirm) ? passwordConfirm : '';
    // if (params.password != passwordConfirm) {
    //   return res.ok(ErrorMessages.PASSWORD_CONFIRM_NOT_MATCH);
    // }
    let newObj = await ParentService.add(data);
    // if (type) {
    //   await Parent.addToCollection(newObj.id, 'staff', type).exec(function (err) { });
    // }
    return res.ok(newObj);
    sails.log.info("================================ ParentController.add => END ================================");
  },

  get: async (req, res) => {
    sails.log.info("================================ ParentController.get => START ================================");
    let params = req.allParams();
    if (!params.id) return res.badRequest(ErrorMessages.PARENT_ID_REQUIRED);
    let parent = await ParentService.get({ id: params.id });
    if (!parent) return res.notFound(ErrorMessages.PARENT_NOT_FOUND);
    delete parent.password;
    delete parent.createdAt;
    delete parent.updatedAt;
    return res.ok(parent);
  },

  edit: async (req, res) => {
    sails.log.info("================================ ParentController.edit => START ================================");
    let params = req.allParams();
    // if (!params.emailAddress) return res.badRequest(ErrorMessages.PARENT_EMAIL_REQUIRED);
    if (params.metaFields && !Utils.isJsonString(params.metaFields)) return res.serverError(ErrorMessages.SYSTEM_JSON_FORMAT_FAIL);
    if (params.password != params.passwordConfirm) return res.badRequest(ErrorMessages.PARENT_PASSWORD_IS_NOT_MATCH);
    let emailAddress = (params.emailAddress) ? params.emailAddress : '';
    // If the phone number already exists
    // let duplicateusername = await ParentService.get({ id : { '!=': params.id }, userName: params.userName });
    // if (duplicateusername)  {
    //   return res.badRequest(ErrorMessages.USER_IS_EXISTED);
    // }
    // if (emailAddress != '')
    // {
    //   let emailParent = await ParentService.get({ emailAddress: emailAddress });
    //   if (emailParent) {
    //     return res.badRequest(ErrorMessages.EMAIL_IS_EXISTED);
    //   }
    // }

    let data = {
      emailAddress: params.emailAddress.toLowerCase(),
      userName: params.userName,
      phone: params.phone,
      firstName: params.firstName,
      lastName: params.lastName,
      birthday: params.birthday,
      currentAddress: params.currentAddress,
      isSuperAdmin: params.isSuperAdmin,
      lastSeenAt: params.lastSeenAt,
      status: parseInt(params.status),
      gender: parseInt(params.gender),
      avatar: params.avatar,
      students: params.students,
    };
    if (params.password && params.password != '') {
      data.password = await sails.helpers.passwords.hashPassword(params.password);
    }
    sails.log.info("======DATA NEW======");
    sails.log.info("data", data);
    sails.log.info("====================");
    //ALWAYS CHECK  OBJECT EXIST BEFORE UPDATE
    let parent = ParentService.get({ id: params.id });
    if (!parent) return res.notFound(ErrorMessages.PARENT_NOT_FOUND);
    //UPDATE DATA
    let editObj = await ParentService.edit({ id: params.id }, data);
    return res.ok(editObj);
  },

  trash: async (req, res) => {
    sails.log.info("================================ ParentController.trash => START ================================");
    let params = req.allParams();
    if (!params.ids) return res.badRequest(ErrorService.ERR_ID_REQUIRED);
    let ids = params.ids;
    if (params.ids.indexOf(';') != -1) {
      ids = ids.split(';');
    }
    if (typeof (ids) == 'object') {
      for (var i = 0; i < ids.length; i++) {
        let parent = await ParentService.get({ id: ids[i] });
        if (parent) ParentService.del({ id: ids[i] });
        // let parent = await ParentService.get({
        //   id: ids[i]
        // });
        // if (parent && parent.status == sails.config.custom.STATUS.TRASH) {
        //   ParentService.del({
        //     id: ids[i]
        //   });
        // } else if (parent) {
        //   await Parent.update({
        //     id: ids[i]
        //   }).set({
        //     status: sails.config.custom.STATUS.TRASH
        //   });
        // }
      }
    } else {
      let parent = await ParentService.get({ id: ids });
      if (parent) ParentService.del({ id: ids });
      // let parent = await ParentService.get({
      //   id: ids
      // });
      // if (parent && parent.status == sails.config.custom.STATUS.TRASH) {
      //   ParentService.del({
      //     id: ids
      //   });
      // } else if (parent) {
      //   await Parent.update({
      //     id: ids
      //   }).set({
      //     status: sails.config.custom.STATUS.TRASH
      //   });
      // }
    }
    return res.ok();
  },

  uploadThumbnail: async (req, res) => {
    sails.log.info("================================ ParentController.uploadThumbnail => START ================================");
    let thumbnail = {};
    if (req.file('file')) {
      let fileUploaded = await sails.helpers.uploadFile.with({
        req: req,
        file: 'thumbnail'
      });
      if (fileUploaded.length) {
        let filename = '';
        for (let file of fileUploaded) {
          // sails.log('fileUploaded', file);
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
          school: req.me.school
        }
        let mediaObj = await MediaService.add(dataMedia);
        return res.json(mediaObj.thumbnail.sizes.thumbnail.path);
      }
    }
    return res.json('');
  },

  search: async (req, res) => {
    sails.log.info("================================ ParentController.search => START ================================");
    let params = req.allParams();
    // GET WEB SETTINGS
    let webSettings = res.locals.webSettings;
    let dateFormat = webSettings.value.dateFormat;
    let keyword = params.keyword ? params.keyword : null;
    let draw = (params.draw) ? parseInt(params.draw) : 1;
    let limit = (params.length) ? parseInt(params.length) : null;
    let skip = (params.start) ? parseInt(params.start) : null;
    let classId = params.classId ? params.classId : null;

    //check role of current logged in user
    let schoolObj = await School.findOne({ id: req.me.school });
    let isMainSchoolAdmin = 3 == req.me.userType ? true : false;
    let isHavePermissionEdit = false;
    let isHavePermissionDelete = false;
    if (!isMainSchoolAdmin && req.me.role && req.me.role.permissions && req.me.role.permissions.album) {
      isHavePermissionEdit = req.me.role.permissions.album.edit ? true : false;
      isHavePermissionDelete = req.me.role.permissions.album.delete ? true : false;
    }

    //prepared order param
    let objOrder = {};// {firstName: 'asc'};
    objOrder[params.columns[params.order[0].column].data] = params.order[0].dir;
    //let sort = [objOrder];

    //get new sort for find insensitive case
    let newSort = {};
    for (var key in objOrder) {
      if (objOrder[key] == 'desc') {
        //code here
        newSort[key] = -1;
      } else {
        newSort[key] = 1;
      }
    }

    let where = {};
    if (typeof keyword === "string" && keyword.length > 0) {
      where = {
        $or: [
          { emailAddress: { $regex: keyword, $options: 'i' } },
          { firstName: { $regex: keyword, $options: 'i' } },
          { lastName: { $regex: keyword, $options: 'i' } },
        ]
      }
    }

    let mongo = require('mongodb');
    //get students form class
    let studentIds = [];
    //get student by 1 class
    if (classId && classId != '0' && classId != 'undefined' && classId != 'null' && classId != '-1' && classId != '3') {
      let classObj = await Class.findOne({ id: classId, school: req.me.school }).populate('students');
      studentIds = classObj.students.map((std) => {
        return std.id;
      })
    }
    //get student by all class
    else if (classId != '3') {
      let classes = await Class.find({ school: req.me.school }).populate('students');
      for (let classObj of classes) {
        let ids = classObj.students.map((std) => {
          return std.id;
        })
        studentIds = [...studentIds, ...ids];
      }
    }
    //get all student
    else if (classId != '-1') {
      let studentIDs1 = await Student.find({ school: req.me.school });
      let ids = studentIDs1.map((std) => {
        // return new mongo.ObjectID(std.id);
        return std.id;
      })
      studentIds = [...studentIds, ...ids];
    }

    //get parents from students
    let std_par = await Student_Parent.find({ student: studentIds });
    let parIds = std_par.map((item) => {
      return item.parent;
    })

    parIds = _.union(parIds);
    parIds = parIds.map((item) => {
      return new mongo.ObjectID(item);
    })

    where.$and = [
      { _id: { $in: parIds } },
      { school: new mongo.ObjectID(req.me.school) }
    ];

    // if (params.status && params.status != 2) {
    //   where.$and.push({ status: parseInt(params.status) });
    // }

    /**SEARCH CASE_INSENSITIVE */
    const collection = Parent.getDatastore().manager.collection(Parent.tableName);
    let result = [];
    if (params.length && params.start) {
      result = await collection.find(where).limit(limit).skip(skip).sort(newSort);
    } else {
      result = await collection.find(where).sort(newSort);
    }
    const totalParent = await collection.count(where);
    const dataWithObjectIds = await result.toArray();
    const parents = JSON.parse(JSON.stringify(dataWithObjectIds).replace(/"_id"/g, '"id"'));

    let resParents = [];
    let ordinalNumber = params.start ? parseInt(params.start) + 1 : 1;
    for (let parent of parents) {
      let tmpData = {};
      // ID
      tmpData.id = '<input class="js-checkbox-item" type="checkbox" value="' + parent.id + '">';
      // Ordinal Number
      tmpData.ordinalNumber = ordinalNumber;
      // AVATAR & FULLNAME
      let path = "/images/avatar2.png";
      if (parent.gender == 0) path = "/images/female.png";
      if (parent.gender == 1) path = "/images/male.png";
      let _tmpFullname = await sails.helpers.formatFullname(parent.firstName, parent.lastName, webSettings.value.displayName);
      tmpData.fullName =
        `<div class="d-flex align-items-center">
              <img src="${path}" alt="profile" class="img-sm rounded-circle">
              <h6>${_tmpFullname}</h6>
            </div>`;
      if (parent.avatar != "") {
        tmpData.fullName =
          `<div class="d-flex align-items-center">
              <img src="${parent.avatar}" alt="profile" class="img-sm rounded-circle">
              <h6>${_tmpFullname}</h6>
            </div>`;
      }
      // EMAIL ADDRESS
      tmpData.emailAddress = parent.emailAddress;
      // PHONE
      tmpData.phone = parent.phone;
      // NAME STUDENT
      tmpData.student = "";
      student_parent = await Student_Parent.find({ parent: parent.id })
      if (student_parent.length) {
        for (let j in student_parent) {
          student = await Student.findOne({ id: student_parent[j].student })
          if (student) {
            if (parseInt(j) > 0) tmpData.student += '<br>';
            let _tmpFullname = await sails.helpers.formatFullname(student.firstName, student.lastName, webSettings.value.displayName);
            tmpData.student += "- " + _tmpFullname;
          }
        }
      } else tmpData.student = "-";
      tmpData.activated = parent.activated ? sails.__("Yes") : sails.__("No");
      // STATUS
      tmpData.status = '';
      if (isMainSchoolAdmin || isHavePermissionEdit) {
        if (parent.status == 1) {
          tmpData.status = `
            <label class="switch">
              <input class="switchStatus" type="checkbox" data-id="${parent.id}" checked>
              <span class="slider"></span>
            </label>`;
        } else {
          tmpData.status = `
            <label class="switch">
              <input class="switchStatus" type="checkbox" data-id="${parent.id}">
              <span class="slider"></span>
            </label>`;
        }
      } else {
        if (parent.status == 1) {
          tmpData.status = '<label class="badge badge-success">' + sails.__("Active") + '</label>';
        } else {
          tmpData.status = '<label class="badge badge-warning">' + sails.__("Draft") + '</label>';
        }
      }
      //URL
      parent.url = "/backend/parent/edit/";
      // TOOL
      tmpData.tool = await sails.helpers.renderRowAction(parent, isMainSchoolAdmin, isHavePermissionEdit, isHavePermissionDelete);
      resParents.push(tmpData);
      ordinalNumber++;
    };
    // let totalParent = await ParentService.count(where);
    return res.ok({ draw: draw, recordsTotal: totalParent, recordsFiltered: totalParent, data: resParents });
  },

  readNotification: async (req, res) => {
    sails.log.info("================================ ParentController.readNotification => START ================================");
    let params = req.allParams();

    if (!params.parent) return res.badRequest(ErrorMessages.PARENT_ID_REQUIRED);
    if (!params.notification) return res.badRequest(ErrorMessages.NOTIFICATION_ID_REQUIRED);

    let noti_parent = await Notification_Parent.findOne({ parent: params.parent, notification: params.notification });
    await Notification_Parent.update({ id: noti_parent.id }, { isRead: true });

    sails.log.info("================================ ParentController.readNotification => END ================================");
    return res.ok(noti_parent);
  },

  switchStatus: async (req, res) => {
    sails.log.info("================================ ParentController.switchStatus => START ================================");
    // // GET ALL PARAMS
    const params = req.allParams();
    if (!params.id) return res.badRequest(ErrorMessages.PARENT_ID_REQUIRED);

    //CHECK OBJ IS EXISTED?
    let parentObj = await ParentService.get({ id: params.id });
    if (!parentObj) return res.badRequest(ErrorMessages.PARENT_NOT_FOUND);

    //switch status of current obj
    if (parentObj.status == 1) parentObj = await ParentService.edit({ id: params.id }, { status: 0 });
    else parentObj = await ParentService.edit({ id: params.id }, { status: 1 });

    return res.json(parentObj);
    // END UPDATE
  },
};
module.exports = BackendParentController;
