/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const ErrorMessage = require('../../../config/errors');
const UserService = require('../../services/UserService');
const Sharp = require('sharp/lib');
const moment = require('moment');

module.exports = {

  get: async (req, res) => {
    // GET ALL PARAMS
    const params = req.allParams();
    let tempToken = true;
    let now = Date.now();
    let token = await AuthService.find(params.token);
    let checkToken = false;

    if (token.token === params.tokens) {
      checkToken = true;
    }

    if (tempToken === false) return res.badRequest(ErrorMessage.AUTH_ERR_SYSTEM_TOKEN_REQUIRE);
    // CHECK ID PARAM
    if (!params.id) {
      return res.badRequest(ErrorMessage.USER_ERR_ID_REQUIRED);
    }
    // QUERY & CHECK DATA USER
    const user = await UserService.get({
      id: params.id
    });
    if (!user) {
      return res.notFound(ErrorMessage.USER_ERR_NOT_FOUND);
    }
    // RETURN DATA USER
    return res.json({
      data: user
    });
  },

  edit: async (req, res) => {
    sails.log.info("================================ MobileUserController.edit => START ================================");
    let params = req.allParams();

    if (!params.firstName && !params.firstName.trim().length) {
      return res.badRequest(ErrorMessage.USER_ERR_USER_FULLNAME_REQUIRED);
    } else if (!params.lastName && !params.lastName.trim().length) {
      return res.badRequest(ErrorMessage.USER_ERR_USER_FULLNAME_REQUIRED);
    } else if (!params.userName) {
      return res.badRequest(ErrorMessage.USER_ERR_USER_PHONE_REQUIRED);
    }
    // else if (!params.emailAddress || !params.emailAddress.trim().length) {
    //   return res.badRequest(ErrorMessage.USER_ERR_USER_EMAIL_REQUIRED);
    // } else if (!params.phone) {
    //   return res.badRequest(ErrorMessage.USER_ERR_USER_PHONE_REQUIRED);
    // }
    if (!params.school) return res.badRequest(ErrorMessage.SCHOOL_ID_REQUIRED);

    let a = {
      id: { '!=': params.id },
      // or: [
      //   { emailAddress: params.emailAddress.toLowerCase() },
      //   { userName: params.userName }
      // ],

      userName: params.userName,
      
      school: params.school
    }
    if (params.emailAddress) a.emailAddress = params.emailAddress

    //check email and phone exists
    let foundUser = await UserService.find(a);

    if (foundUser.length) return res.badRequest(ErrorMessage.USER_ERR_EMAIL_PHONE_EXISTED);

    let newData = {
      emailAddress: params.emailAddress ? params.emailAddress.toLowerCase() : '',
      phone: params.phone,
      userName: params.userName, //REQUIRED
      firstName: params.firstName, // REQUIRED
      lastName: params.lastName, // REQUIRED
      birthday: params.birthday,
      address: params.address,
      allowNotification: params.allowNotification,
    }
    const editObj = await UserService.edit({ id: params.id }, newData);
    return res.json({
      code: 'SUCCESS_200',
      data: editObj
    });
  },

  search: async (req, res) => {
    // GET ALL PARAMS
    const params = req.allParams();
    let tempToken = true;
    let token = await AuthService.find(params.token);
    let checkToken = false;

    if (token.token === params.tokens) {
      checkToken = true;
    }

    if (tempToken === false) return res.badRequest(ErrorMessage.AUTH_ERR_SYSTEM_TOKEN_REQUIRE);
    // PREAPARE BODY PARAMS
    const bodyParams = {
      filter: (params.filter && params.filter.trim().length) ? JSON.parse(params.filter) : null,
      limit: params.limit ? Number(params.limit) : null,
      offset: params.offset ? Number(params.offset) : null,
      sort: (params.sort && params.sort.trim().length) ? JSON.parse(params.sort) : null
    };

    let where = {};
    if (bodyParams.filter.status) {
      where = {
        status: bodyParams.filter.status === sails.config.custom.STATUS.ALL ? {
          '>=': sails.config.custom.STATUS.ALL
        } : bodyParams.filter.status
      }
    } else if (bodyParams.filter.rangeDate.active) {
      where = {
        createdAt: {
          '>=': moment(bodyParams.filter.rangeDate.begin).valueOf(),
          '<=': moment(bodyParams.filter.rangeDate.end).valueOf()
        }
      }
    } else if (typeof bodyParams.filter.keyWord === "string" && bodyParams.filter.keyWord.trim().length) {
      where = {
        or: [
          {
            firstName: {
              contains: bodyParams.filter.keyWord
            }
          },
          {
            lastName: {
              contains: bodyParams.filter.keyWord
            }
          },
          {
            emailAddress: {
              contains: bodyParams.filter.keyWord
            }
          }
        ]
      }
    } else {
      // nothing to do
    }

    let condition;
    if (params.condition && !Utils.isJsonString(params.condition)) {
      return res.serverError(ErrorService.SYSTEM_JSON_FORMAT_FAIL);
    } else {
      condition = (params.condition) ? JSON.parse(params.condition) : null;
    }

    if (condition) {
      where = condition;
    }

    // QUERY DATA USER
    const users = await UserService.find(where, bodyParams.limit, bodyParams.offset, bodyParams.sort),
      total = await UserService.count({
        status: {
          '>=': sails.config.custom.STATUS.ALL
        }
      }),
      trash = await UserService.count({ status: sails.config.custom.STATUS.TRASH }),
      publish = await UserService.count({ status: sails.config.custom.STATUS.ACTIVE });

    // RETURN DATA USERS
    return res.json({
      recordsTotal: total,
      recordsTrash: trash,
      recordsPublish: publish,
      data: users
    });
  },

  upload: async (req, res) => {
    //let params = req.allParams();
    //let id = params.id;
    const paramsString = req.url.split('?')[1];
    const eachParamArray = paramsString.split('&');
    let params = {};
    eachParamArray.forEach((param) => {
      const key = param.split('=')[0];
      const value = param.split('=')[1];
      Object.assign(params, { [key]: value });
    });
    sails.log(params)
    let id = params.id;
    if (id == undefined) {
      return res.badRequest('ID MISSING');
    } 
 
    if (req.file('file')) {
      let fileUploaded = await sails.helpers.uploadFile.with({
        req: req,
        file: 'file'
      });
      if (fileUploaded.length) {  
        let file = fileUploaded[0];
        // sails.log('fileUploaded', file);
        let filename = file.fd.replace(/^.*[\\\/]/, '');
        filename = filename.split('.');
        let uploadConfig = sails.config.custom.UPLOAD;
        let destFileName = filename[0] + '_150x150.' + filename[1];
        Sharp(file.fd).resize(150, 150)
          .toFile(require('path').resolve(uploadConfig.PATH_FOLDER, 'assets/uploads/') + '/' + moment().format('YYYY/MM') + '/' + destFileName)
          .then((info) => { }).catch((err) => { sails.log(err); });

        const editObj = await UserService.edit({ id }, { avatar: '/uploads/' + moment().format('YYYY/MM') + '/' + destFileName });
        return res.json({
          status: 200,
          user: editObj
        }); 
      }
      return res.json({});
    }
  },

  addExpoToken: async (req, res) => {
    let params = req.allParams();
    console.log('params', params);

    let userFound = null;
    if (params.emailAddress) {
      userFound = await UserService.get({
        emailAddress: params.emailAddress.toLowerCase()
      });
    } else {
      return res.json(ErrorMessage.USER_ERR_EDIT_FAIL);
    }
    if (userFound) {
      let _token =
        userFound.expoToken === '' ||
          userFound.expoToken === undefined ||
          userFound.expoToken === null
          ? ''
          : userFound.expoToken;
      if (_token != '' && _token.indexOf(params.token) == -1) {
        _token += ';' + params.token;
      } else if (_token === '') {
        _token += params.token;
      }
      let updated = await UserService.edit({ id: userFound.id }, { expoToken: _token });

      return res.json(updated);
    } else {
      return res.json(ErrorMessage.USER_ERR_NOT_FOUND);
    }
  },

  getListTeacherByClassId: async (req, res) => {
    let params = req.allParams();
    if (params.classId === null || params.classId === undefined) {
      return res.json(ErrorMessage.CLASS_ERR_ID_REQUIRED);
    }
    let arrTeacherId = [];
    let arrRelationTeacherClass = await Teacher_Class.find({ classObj: params.classId }).populate('teacher');
    _.each(arrRelationTeacherClass, (relationItem) => {
      arrTeacherId.push(relationItem.teacher);
    })

    return res.json(arrTeacherId);
  }

};
