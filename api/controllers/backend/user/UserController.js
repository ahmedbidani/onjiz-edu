/**
 * @copyright 2017 @ ZiniMedia Team
 * @author thanhvo
 * @create 2017/10/25 10:52
 * @update 2017/10/25 10:52
 * @file api/controllers/UserController.js
 */
const ErrorMessages = require('../../../../config/errors');
const UserService = require('../../../services/UserService');
const Utils = require('../../../utils');
const Sharp = require('sharp/lib');
const moment = require('moment');


const BackendUserController = {
  /**
   @api {put} /User/add 01. Add a new User
   @apiName add
   @apiVersion 1.0.0
   @apiGroup User

   @apiHeader {String} token  is required.

   @apiParam {String} title is required.
   @apiParam {String} alias
   @apiParam {String} description
   @apiParam {String} parent
   @apiParam {String} metaFields Thuoc tinh khac neu co.

   @apiSuccessExample {json} Success-Response:
   HTTP/1.1 200 OK
   {

   }


   @apiErrorExample Error-Response:
   HTTP/1.1 500 Internal Server Error
   {
     code: "SYS001",
     message: "Error system"
   }
   {
      code: 'SYS008',
      message: "JSON format is not valid"
   }
   HTTP/1.1 400 Bad Request
   {
     code: "PT001",
     message: "Add error"
   }
   {
     code: "PT006",
     message: "Title is required"
   }
  */
  init: async function (req, res) {
    sails.log.info("================================ UserController.init => START ================================");
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
    let admin = await UserService.get({
      emailAddress: "admin@gmail.com"
    });
    if (admin) {
      return res.badRequest(ErrorMessages.USER_IS_EXISTED);
    }
    let newObj = await UserService.add(data);
    return res.ok(newObj);
  },
  login: async function (req, res) {
    sails.log.info("================================ UserController.login => START ================================");
    let params = req.allParams();
    let query = {};
    if (!params.emailAddress) return res.badRequest(ErrorMessages.USER_EMAIL_REQUIRED);
    if (!params.password) return res.badRequest(ErrorMessages.USER_PASSWORD_REQUIRED);
    query.emailAddress = params.emailAddress.toLowerCase();
    query.password = await sails.helpers.passwords.hashPassword(params.password);
    let result = await UserService.get(query);
    if (!result) return res.badRequest(ErrorMessages.USER_NOT_FOUND);
    if (!result.isSuperAdmin && result.userType != 3) return res.badRequest(ErrorMessages.USER_NOT_FOUND);
    result.token = req.headers.token;
    return res.ok(result);
  },
  add: async (req, res) => {
    sails.log.info("================================ UserController.add => START ================================");
    let params = req.allParams();

    //If the email is the same
    if (!params.userName) return res.badRequest(ErrorMessages.USER_REQUIRED);

    //If the password is different passwordConfirm
    if (params.password != params.passwordConfirm) return res.badRequest(ErrorMessages.PASSWORD_IS_NOT_MATCH);
    // Call constructor with custom options:
    let emailAddress = (params.emailAddress) ? params.emailAddress.toLowerCase() : '';
    let phone = (params.phone) ? params.phone : '';
    let firstName = (params.firstName) ? params.firstName : '';
    let lastName = (params.lastName) ? params.lastName : '';
    let birthday = (params.dateOfBirth) ? params.dateOfBirth : '';
    let address = (params.address) ? params.address : '';
    let status = (params.status) ? parseInt(params.status) : sails.config.custom.STATUS.ACTIVE;
    let userType = (params.userType) ? parseInt(params.userType) : 2;
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
      address: address,
      avatar: params.avatar,
      status: status,
      gender: gender,
      classes: params.classes,
      formations: params.subjects,
      userType: parseInt(userType),
      description: params.description,
      //role: params.role ? params.role : null,
      branch: req.session.branchId,
      //school: req.me.school
    };
    if (req.me && req.me.school) data.school = req.me.school;
    if (data.userType == 3) {
      let school = await School.find({});
      if (school.length) {
        data.school = school[0].id;
      }
    }
    let userName = await UserService.get({
      userName: params.userName
    });
    if (userName) {
      return res.badRequest(ErrorMessages.USER_IS_EXISTED);
    }

    //If the phone number is the same
    // let phoneNumber = await UserService.get({ phone: params.phone });
    // if (phoneNumber) {
    //   return res.ok(ErrorMessages.PHONE_IS_EXISTED);
    // }

    const newObj = await UserService.add(data);
    if (params.role && params.role.length) {
      for (let role of params.role) {
        let checkRole = await RoleService.get({ id: role });
        if (checkRole) await User_Role.create({ user: newObj.id, role: role });
      }
    }
    return res.ok(newObj);
    sails.log.info("================================ UserController.add => END ================================");
  },
  /**
   @api {put} /User/get 02. Get detail a User
   @apiName get
   @apiVersion 1.0.0
   @apiGroup User

   @apiHeader {String} token  required
   @apiParam {String} emailAddress     required
   @apiParam {String} phone     required
   @apiParam {String} password     required
   @apiParam {String} fullName     required


   @apiSuccessExample {json} Success-Response:
   HTTP/1.1 200 OK
   {
       "createdAt": 1525773005371,
      "updatedAt": 1525773059760,
      "id": "5af172cd94dbfd06a1fbfe29",
      "emailAddress": "bao@gmail.com",
      "phone": "1297812570",
      "password": "123456",
      "fullName": "baobao",
      "birthday": 0,
      "isSuperAdmin": false,
      "lastSeenAt": 0,
      "status": 1,
      "avatar": null
   }


   @apiErrorExample Error-Response:
   HTTP/1.1 500 Internal Server Error
   {
     code: "SYS001",
     message: "Error system"
   }
   HTTP/1.1 400 Bad Request
   {
     code: "PT005",
     message: "Title is required"
   }
   HTTP/1.1 404 Not Found
   {
     code: "PT004",
     message: "User is not found"
   }
   */
  get: async (req, res) => {
    sails.log.info("================================ UserController.get => START ================================");
    let params = req.allParams();
    if (!params.id) return res.badRequest(ErrorMessages.USER_ID_REQUIRED);
    let user = await UserService.get({
      id: params.id
    });
    if (!user) return res.notFound(ErrorMessages.USER_NOT_FOUND);
    delete user.password;
    delete user.createdAt;
    delete user.updatedAt;
    return res.ok(user);
  },
  /**
   @api {put} /User/edit 04. Edit a User
   @apiName edit
   @apiVersion 1.0.0
   @apiGroup User

   @apiHeader {String} token  required.

   @apiParam {String} title
   @apiParam {String} description
   @apiParam {String} totalLike
   @apiParam {String} totalComment

   @apiSuccessExample {json} Success-Response:
   HTTP/1.1 200 OK
   {
       "createdAt": 1525773005371,
      "updatedAt": 1525773059760,
      "id": "5af172cd94dbfd06a1fbfe29",
      "emailAddress": "bao@gmail.com",
      "phone": "1297812570",
      "password": "123456",
      "fullName": "baobao",
      "birthday": 0,
      "isSuperAdmin": false,
      "lastSeenAt": 0,
      "status": 1,
      "avatar": null
   }


   @apiErrorExample Error-Response:
   HTTP/1.1 500 Internal Server Error
   {
     code: "SYS001",
     message: "System error"
   }
   HTTP/1.1 400 Bad Request
   {
     code: "PT002",
     message: "Update failed"
   }
   {
     code: "PT005",
     message: "User id is requied"
   }
   {
      code: 'SYS008',
      message: "JSON format is not valid"
   }
   HTTP/1.1 404 Not Found
   {
     code: "PT004",
     message: "User is not found"
   }
   */
  edit: async (req, res) => {
    sails.log.info("================================ UserController.edit => START ================================");
    let params = req.allParams();
    // if (!params.userName) return res.badRequest(ErrorMessages.USER_REQUIRED);
    // if (!params.branch) return res.badRequest(ErrorMessages.BRANCH_ID_REQUIRED);
    if (params.metaFields && !Utils.isJsonString(params.metaFields)) return res.serverError(ErrorMessages.SYSTEM_JSON_FORMAT_FAIL);
    if (params.password != params.passwordConfirm) return res.badRequest(ErrorMessages.PASSWORD_IS_NOT_MATCH);
    let classes = (params.classes) ? params.classes : [];
    let formations = (params.subjects) ? params.subjects : [];

    let data = {
      emailAddress: params.emailAddress.toLowerCase(),
      userName: params.userName,
      phone: params.phone,
      firstName: params.firstName,
      lastName: params.lastName,
      birthday: params.dateOfBirth,
      address: params.address,
      isSuperAdmin: params.isSuperAdmin,
      lastSeenAt: params.lastSeenAt,
      status: params.status,
      avatar: params.avatar,
      userType: params.userType,
      description: params.description,
      classes: classes,
      formations: formations
      //role: params.role ? params.role : null,
      // branch: params.branch
    };

    console.log('params',data)
    if (params.password && params.password != '') {
      data.password = await sails.helpers.passwords.hashPassword(params.password);
    }

    //If the email address already exists
    if (params.emailAddress != '') {
      let duplicateEmail = await UserService.get({
        id: {
          '!=': params.id
        },
        emailAddress: params.emailAddress.toLowerCase()
      });
      if (duplicateEmail) {
        return res.badRequest(ErrorMessages.USER_ERR_EMAIL_EXISTED);
      }
    }
    //If the username number already exists

    // let duplicateuser = await UserService.get({ id : { '!=': params.id }, userName: params.userName });
    // if (duplicateuser)  {
    //   return res.badRequest(ErrorMessages.USER_ERR_USERNAME_EXISTED);
    // }

    //ALWAYS CHECK  OBJECT EXIST BEFORE UPDATE
    let user = UserService.get({
      id: params.id
    });
    if (!user) return res.notFound(ErrorMessages.USER_NOT_FOUND);
    //UPDATE DATA
    let editObj = await UserService.edit({ id: params.id }, data);

    await User_Role.destroy({ user: params.id });

    if (params.role && params.role.length) {
      for (let role of params.role) {
        let checkRole = await RoleService.get({ id: role });
        if (checkRole) await User_Role.create({ user: params.id, role: role });
      }
    }
    return res.ok(editObj);
  },
  /**
   @api {put} /User/trash 04. Edit a User
   @apiName edit
   @apiVersion 1.0.0
   @apiGroup User

   @apiHeader {String} token  required.

   @apiParam {String} password

   @apiSuccessExample {json} Success-Response:
   HTTP/1.1 200 OK
   {
      "createdAt": 1525773005371,
      "updatedAt": 1525773059760,
      "id": "5af172cd94dbfd06a1fbfe29",
      "emailAddress": "bao@gmail.com",
      "phone": "1297812570",
      "password": "1234567",
      "fullName": "baobao",
      "birthday": 0,
      "isSuperAdmin": false,
      "lastSeenAt": 0,
      "status": 1,
      "avatar": null
   }
   @apiErrorExample Error-Response:
   HTTP/1.1 500 Internal Server Error
   {
     code: "SYS001",
     message: "System error"
   }
   HTTP/1.1 400 Bad Request
   {
     code: "PT002",
     message: "Update failed"
   }
   {
     code: "PT005",
     message: "User id is requied"
   }
   {
      code: 'SYS008',
      message: "JSON format is not valid"
   }
   HTTP/1.1 404 Not Found
   {
     code: "PT004",
     message: "User is not found"
   }
   */
  trash: async (req, res) => {
    sails.log.info("================================ UserController.trash => START ================================");
    let params = req.allParams();
    if (!params.ids) return res.badRequest(ErrorMessages.USER_ID_REQUIRED);
    // Call constructor with custom options:
    //data 1 used when click button trash
    let data1 = {
      status: sails.config.custom.STATUS.DRAFT
    };
    //data 2 used when click button xóa delete
    let data2 = {
      status: sails.config.custom.STATUS.TRASH
    };
    let ids = params.ids;
    if (params.ids.indexOf(';') != -1) {
      ids = ids.split(';');
    }
    sails.log.info("================================ FoodController.trash => IDS ================================");
    sails.log.info(ids);

    if (typeof (ids) == 'object') {
      for (var i = 0; i < ids.length; i++) {
        let userObj = await UserService.get({
          id: ids[i]
        });
        if (userObj) await User.destroy({
          id: ids[i]
        });
        // let userObj = await UserService.get({ id: ids[i] });
        // if (!userObj) return res.notFound(ErrorMessages.COURSESESSION_OBJECT_NOT_FOUND);
        // //If status Class == 3 => Delete Class
        // if (userObj.status == 0) {
        //   await User.update(ids[i]).set(data2);
        // } else {
        //   await User.update(ids[i]).set(data1);
        // }
      }
    } else {
      let userObj = await UserService.get({
        id: ids
      });
      if (userObj) await User.destroy({
        id: ids
      });
      //ALWAYS CHECK  OBJECT EXIST
      //  let userObj = await UserService.get({ id: ids });
      //  if (!userObj) return res.notFound(ErrorMessages.COURSESESSION_OBJECT_NOT_FOUND);
      //  //If status Class == 3 => Delete Class
      //  if (userObj.status == 0) {
      //   await User.update(ids).set(data2);
      //  } else {
      //   await User.update(ids).set(data1);
      //  }
    }
    return res.ok();
  },

  /**
   @api {put} /User/delete 03. Delete a User
   @apiName delete
   @apiVersion 1.0.0
   @apiGroup User

   @apiHeader {String} token  required
   @apiParam {String} id      required

   @apiSuccessExample {json} Success-Response:
   HTTP/1.1 200 OK
   {
   }

   @apiErrorExample Error-Response:
   HTTP/1.1 500 Internal Server Error
   {
     code: "SYS001",
     message: "Error System"
   }
   HTTP/1.1 400 Bad Request
   {
     code: "PT005",
     message: "User id is required"
   }
   {
     code: "PT003",
     message: "Delete failed"
   }
   HTTP/1.1 404 Not Found
   {
     code: "PT004",
     message: "User is not found"
   }
   */
  delete: async (req, res) => {
    sails.log.info("================================ UserController.del => START ================================");
    let params = req.allParams();
    if (!params.id) return res.badRequest(ErrorMessages.USER_ID_REQUIRED);
    let user = await UserService.get({
      id: params.id
    });
    if (!user) return res.notFound(ErrorMessages.USER_NOT_FOUND);
    UserService.del({
      id: params.id
    });
    return res.ok();
  },

  uploadThumbnail: async (req, res) => {
    sails.log.info("================================ UserController.uploadThumbnail => START ================================");
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
                .then((info) => { }).catch((err) => {
                  sails.log(err);
                });
              thumbnail.path = '/uploads/' + moment().format('YYYY/MM') + '/' + destFileName;
            } else {
              let type = size.type;
              Sharp(file.fd).resize(size.width, size.height)
                .toFile(require('path').resolve(uploadConfig.PATH_FOLDER, 'assets/uploads/') + '/' + moment().format('YYYY/MM') + '/' + destFileName)
                .then((info) => { }).catch((err) => {
                  sails.log(err);
                });
              thumbnail.sizes[type] = {
                width: size.width,
                height: size.height,
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
    return res.json({});
  },
  /**
   @api {put} /User/search 05. Search user
   @apiName search
   @apiVersion 1.0.0
   @apiGroup User

   @apiHeader {String} token  token is required

   @apiParam {String} keyword String of search text is optional.
   @apiParam {String} condition String of search text is optional. Ex: {"or": [{"status": "ACTIVE", "teachers": 0}]}
   @apiParam {Integer} limit Number of limit records return. Default: 10;
   @apiParam {Integer} skip Number of skip records return. Default: 0;
   @apiParam {String} sort String of sort fields. Default: { "updateAt": 1};

   @apiSuccessExample {json} Success-Response:
   HTTP/1.1 200 OK
   {
      "total": 1,
      "rows": [
          {
              "createAt": 1508907091297,
              "updateAt": 1508907091297,
              "id": "59f018536416d103ee28f254"
          }
      ]
   }


   @apiErrorExample Error-Response:
   HTTP/1.1 500 Internal Server Error
   HTTP/1.1 500 Internal Server Error
   {
     code: "SYS001",
     message: "Error System"
   }
   {
     code: "PT003",
     message: "Delete failed"
   }
   HTTP/1.1 404 Not Found
   {
     code: "PT004",
     message: "User is not found"
   }
   */
  search: async (req, res) => {
    sails.log.info("================================ UserController.search => START ================================");
    let params = req.allParams();
    let keyword = params.keyword ? params.keyword : "";
    let draw = (params.draw) ? parseInt(params.draw) : 1;
    let limit = (params.length) ? parseInt(params.length) : null;
    let skip = (params.start) ? parseInt(params.start) : null;


    //check role of current logged in user
    let schoolObj = await School.findOne({
      id: req.me.school
    });
    let isMainSchoolAdmin = 3 == req.me.userType ? true : false;
    let isHavePermissionEdit = false;
    let isHavePermissionDelete = false;
    if (!isMainSchoolAdmin && req.me.role && req.me.role.permissions && req.me.role.permissions.album) {
      isHavePermissionEdit = req.me.role.permissions.album.edit ? true : false;
      isHavePermissionDelete = req.me.role.permissions.album.delete ? true : false;
    }

    //let sort = (params.sort) ? JSON.parse(params.sort) : null;
    // let sort = null;
    // if(params.order)
    // {
    //   let objOrder = {};
    //   objOrder[params.columns[params.order[0].column].data] = params.order[0].dir ;
    //   sort = [objOrder];
    // }
    let objOrder = {};
    objOrder[params.columns[params.order[0].column].data] = params.order[0].dir;

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

    //DATE FORMAT FORM SETTING
    let webSettings = res.locals.webSettings;
    let dateFormat = webSettings.value.dateFormat;

    let where = {};
    if (typeof keyword === "string" && keyword.length > 0) {
      where = {
        $or: [{
          firstName: {
            $regex: keyword,
            $options: 'i'
          }
        },
        {
          lastName: {
            $regex: keyword,
            $options: 'i'
          }
        },
        ]
      }
    }

    let mongo = require('mongodb');
    where.$and = [{
      school: new mongo.ObjectID(req.me.school)
    }];

    if (params.status) {
      where.$and.push({
        status: parseInt(params.status)
      })
    }

    if (params.userType && params.userType != '-1') {
      where.$and.push({
        userType: parseInt(params.userType)
      })
    }

    /**SEARCH CASE_INSENSITIVE */
    const collection = User.getDatastore().manager.collection(User.tableName);
    let result = [];
    if (params.length && params.start) {
      result = await collection.find(where).limit(limit).skip(skip).sort(newSort);
    } else {
      result = await collection.find(where).sort(newSort);
    }
    const totalUser = await collection.count(where);
    const dataWithObjectIds = await result.toArray();
    const arrObjUser = JSON.parse(JSON.stringify(dataWithObjectIds).replace(/"_id"/g, '"id"'));

    // let arrObjUser = await UserService.find(where, limit, skip, sort);
    let resUsers = [];
    let ordinalNumber = params.start ? parseInt(params.start) + 1 : 1;
    for (let userObj of arrObjUser) {
      let user = await UserService.get({
        id: userObj.id
      });
      let tmpData = {};
      tmpData.id = '<input class="js-checkbox-item" type="checkbox" value="' + user.id + '">';
      let path = "/images/avatar2.png";
      // Ordinal Number
      tmpData.ordinalNumber = ordinalNumber;
      // UserName
      let userName = user.userName ? user.userName : '';
      tmpData.userName =
        `<div class="d-flex align-items-center">
              <h6>${userName}</h6>
            </div>`;
      let _tmpFullname = await sails.helpers.formatFullname(user.firstName, user.lastName, webSettings.value.displayName);
      tmpData.fullName =
        `<div class="d-flex align-items-center">
              <img src="${path}" alt="profile" class="img-sm rounded-circle">
              <h6>${_tmpFullname}</h6>
            </div>`;
      if (user.avatar) {
        tmpData.fullName =
          `<div class="d-flex align-items-center">
              <img src="${user.avatar}" width="50px"  class="img-sm rounded-circle">
              <h6>${_tmpFullname}</h6>
            </div>`;
      }
      tmpData.emailAddress = user.emailAddress;
      tmpData.status = '';
      if (isMainSchoolAdmin || isHavePermissionEdit) {
        if (user.status == 1) {
          tmpData.status = `
            <label class="switch">
              <input class="switchStatus" type="checkbox" data-id="${user.id}" checked>
              <span class="slider"></span>
            </label>`;
        } else {
          tmpData.status = `
            <label class="switch">
              <input class="switchStatus" type="checkbox" data-id="${user.id}">
              <span class="slider"></span>
            </label>`;
        }
      } else {
        if (user.status == 1) {
          tmpData.status = '<label class="badge badge-success">' + sails.__("Active") + '</label>';
        } else {
          tmpData.status = '<label class="badge badge-warning">' + sails.__("Draft") + '</label>';
        }
      }
      //USER LIST OF CLASSES
      let listClass = "";
      if (user.classes.length == 0) {
        listClass = "-";
      } else {
        for (var i = 0; i < user.classes.length; i++) {
          if (i == user.classes.length - 1) {
            listClass += user.classes[i].title;
          } else {
            listClass += user.classes[i].title + ", ";
          }
        }
      }
      tmpData.classes = listClass;
      tmpData.userType = user.userType;
      tmpData.phone = user.phone;
      tmpData.birthday = moment(user.birthday, "YYYY-MM-DD").format(dateFormat);
      tmpData.avatar = '';
      if (user.avatar) {
        tmpData.avatar = '<image width="50px" src="' + user.avatar + '">';
      }
      user.url = '/backend/user/edit/';
      // If user is not school administrator
      if (user.userType != 3) {
        tmpData.tool = await sails.helpers.renderRowAction(user, isMainSchoolAdmin, isHavePermissionEdit, isHavePermissionDelete);
        //   tmpData.tool = `<div class="btn-group-action">
        //   <div class="btn-group pull-right">
        //     <a href="${user.url ? user.url + user.id : 'javascript:void(0);'}" data-id="${user.id}" title="Edit" class="edit btn btn-default edit-row">
        //       <i class="mdi mdi-pencil"></i>
        //     </a>
        //     <button class="btn btn-default dropdown-toggle" data-toggle="dropdown">
        //       <i class="icon-caret-down"></i>
        //     </button>
        //     <ul class="dropdown-menu">
        //       <li>
        //         <a href="javascript:void(0);" data-id="${user.id}" class="remove-row">
        //           <i class="mdi mdi-delete"></i> Delete
        //         </a>
        //       </li>
        //     </ul>
        //   </div>
        // </div>`;
      } else {
        tmpData.tool = `<div class="btn-group-action">
        <div class="btn-group pull-right">
          <a class="btn disabled" href="${user.url ? user.url + user.id : 'javascript:void(0);'}" data-id="${user.id}" title="Edit" class="edit btn btn-default edit-row" data-id="${user.id}" >
            <i class="mdi mdi-pencil"></i>
          </a>
          <button class="btn btn-default dropdown-toggle" data-toggle="dropdown" disabled="disabled">
            <i class="icon-caret-down"></i>
          </button>
        </div>
      </div>`;
      }
      resUsers.push(tmpData);
      ordinalNumber++;
    };

    // let totalUser = await UserService.count(where);
    return res.ok({
      draw: draw,
      recordsTotal: totalUser,
      recordsFiltered: totalUser,
      data: resUsers
    });
  },

  switchStatus: async (req, res) => {
    sails.log.info("================================ UserController.switchStatus => START ================================");
    // // GET ALL PARAMS
    const params = req.allParams();
    if (!params.id) return res.badRequest(ErrorMessages.USER_ID_REQUIRED);

    //CHECK OBJ IS EXISTED?
    let userObj = await UserService.get({
      id: params.id
    });
    if (!userObj) return res.badRequest(ErrorMessages.USER_NOT_FOUND);

    //switch status of current obj
    if (userObj.status == 1) userObj = await UserService.edit({
      id: params.id
    }, {
      status: 0
    });
    else userObj = await UserService.edit({
      id: params.id
    }, {
      status: 1
    });

    return res.json(userObj);
    // END UPDATE
  },
};
module.exports = BackendUserController;
