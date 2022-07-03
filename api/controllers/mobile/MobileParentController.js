/**
 * ParentController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
*/
const ErrorMessage = require('../../../config/errors');
const ParentService = require('../../services/ParentService');
const UserService = require('../../services/UserService');
//Library
const moment = require('moment');
const Sharp = require('sharp/lib');

module.exports = {
  get: async (req, res) => {
    // GET ALL PARAMS
    const params = req.allParams();

    // CHECK ID PARAM
    if (!params.id) {
      return res.badRequest(ErrorMessage.PARENT_ERR_ID_REQUIRED);
    }

    // QUERY & CHECK DATA PARENT
    const parent = await ParentService.get({
      id: params.id
    }).populate('classObj');
    if (!parent) {
      return res.notFound(ErrorMessage.PARENT_ERR_NOT_FOUND);
    }

    // RETURN DATA PARENT
    return res.json({
      data: parent
    });
  },

  edit: async (req, res) => {
    sails.log.info(
      '================================ ParentController.edit => START ================================'
    );
    // GET ALL PARAMS
    const params = req.allParams();

    // ================================================================
    // CHECK FULLNAME & USERNAME PARAMS

    if (!params.firstName && !params.firstName.trim().length) {
      return res.badRequest(ErrorMessage.PARENT_ERR_FULLNAME_REQUIRED);
    } else if (!params.lastName && !params.lastName.trim().length) {
      return res.badRequest(ErrorMessage.PARENT_ERR_FULLNAME_REQUIRED);
    }
    // else if (!params.emailAddress || !params.emailAddress.trim().length) {
    //   return res.badRequest(ErrorMessage.PARENT_ERR_EMAILADDRESS_REQUIRED);
    // }
    else if (!params.userName) {
      return res.badRequest(ErrorMessage.PARENT_ERR_USERNAME_REQUIRED);
    }
    // CHECK EMAIL & USER EXIST WITH USER
    // ***************** Fix bug edit for parent 
    // const foundUserName = await ParentService.find({
    //   userName: params.userName
    // });
    // const foundEmailUser = await ParentService.find({
    //   emailAddress: params.emailAddress.toLowerCase()
    // });
    
    // if (foundEmailUser.length) {
    //   return res.badRequest(ErrorMessage.PARENT_ERR_EMAIL_PARENT_EXISTED);
    // } else if (foundUserName.length) {
    //   return res.badRequest(ErrorMessage.PARENT_ERR_USERNAME_PARENT_EXISTED);
    // }
    // ******************

    // CHECK DATA PARENT
    let parent = await ParentService.get({ id: params.id });
    if (!parent) {
      return res.notFound(ErrorMessage.PARENT_ERR_NOT_FOUND);
    }

    //check email and username exists
    let foundOtherParent = await ParentService.find({
      id: {
        '!=': [params.id]
      },
      or: [
        {
          emailAddress: params.emailAddress.toLowerCase()
        },
        {
          userName: params.userName
        }
      ]
    });
    if (!foundOtherParent.length) {
      const newData = {
        firstName: params.firstName, // REQUIRED
        lastName: params.lastName, // REQUIRED
        emailAddress: params.emailAddress.toLowerCase(), // REQUIRED
        userName: params.userName, // REQUIRED
        currentAddress: params.currentAddress ? params.currentAddress : '',
        allowNotification: params.allowNotification,
      };
      const editObj = await ParentService.edit(
        {
          id: params.id
        },
        newData
      );
      return res.json({
        code: 'SUCCESS_200',
        data: editObj
      });
    } else {
      return res.badRequest(ErrorMessage.PARENT_ERR_USERNAME_PARENT_EXISTED);
    }
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

    if (tempToken === false) {
      return res.badRequest(ErrorMessage.AUTH_ERR_SYSTEM_TOKEN_REQUIRE);
    }
    // PREAPARE BODY PARAMS
    const bodyParams = {
      filter:
        params.filter && params.filter.trim().length
          ? JSON.parse(params.filter)
          : null,
      limit: params.limit ? Number(params.limit) : null,
      offset: params.offset ? Number(params.offset) : null,
      sort:
        params.sort && params.sort.trim().length
          ? JSON.parse(params.sort)
          : null
    };

    let where = {};
    if (bodyParams.filter.status) {
      where = {
        status:
          bodyParams.filter.status === sails.config.custom.STATUS.ALL
            ? {
              '>=': sails.config.custom.STATUS.ALL
            }
            : bodyParams.filter.status
      };
    } else if (bodyParams.filter.rangeDate.active) {
      where = {
        createdAt: {
          '>=': moment(bodyParams.filter.rangeDate.begin).valueOf(),
          '<=': moment(bodyParams.filter.rangeDate.end).valueOf()
        }
      };
    } else if (
      typeof bodyParams.filter.keyWord === 'string' &&
      bodyParams.filter.keyWord.trim().length
    ) {
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
      };
    } else {
      // nothing to do
    }

    let condition;
    if (params.condition && !Utils.isJsonString(params.condition)) {
      return res.serverError(ErrorService.SYSTEM_JSON_FORMAT_FAIL);
    } else {
      condition = params.condition ? JSON.parse(params.condition) : null;
    }

    if (condition) {
      where = condition;
    }

    // QUERY DATA PARENT
    const parents = await ParentService.find(
      where,
      bodyParams.limit,
      bodyParams.offset,
      bodyParams.sort
    ),
      total = await ParentService.count({
        status: {
          '>=': sails.config.custom.STATUS.ALL
        }
      }),
      trash = await ParentService.count({
        status: sails.config.custom.STATUS.TRASH
      }),
      publish = await ParentService.count({
        status: sails.config.custom.STATUS.ACTIVE
      });

    // RETURN DATA PARENTS
    return res.json({
      recordsTotal: total,
      recordsTrash: trash,
      recordsPublish: publish,
      data: parents
    });
  },
  upload: async (req, res) => {
    //let params = req.allParams();
    //let id = params.id;
    const paramsString = req.url.split('?')[1];
    const eachParamArray = paramsString.split('&');
    let params = {};
    eachParamArray.forEach(param => {
      const key = param.split('=')[0];
      const value = param.split('=')[1];
      Object.assign(params, { [key]: value });
    });
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
        let filename = file.fd.replace(/^.*[\\\/]/, '');
        filename = filename.split('.');
        let uploadConfig = sails.config.custom.UPLOAD;
        let destFileName = filename[0] + '_150x150.' + filename[1];
        Sharp(file.fd).resize(150, 150)
          .toFile(require('path').resolve(uploadConfig.PATH_FOLDER, 'assets/uploads/') + '/' + moment().format('YYYY/MM') + '/' + destFileName)
          .then((info) => { }).catch((err) => { sails.log(err); });

        const editObj = await ParentService.edit({ id }, { avatar: '/uploads/' + moment().format('YYYY/MM') + '/' + destFileName });
        let parentObj = await Parent.findOne({ id: editObj.id }).populate('students');
        let classObj = [];
        for (let student of parentObj.students) {
          let tmpClass = await Student_Class.find({ student: student.id });
          if (tmpClass.length > 0) {
            for (let classO of tmpClass) {
              let tmp = await Class.findOne({ id: classO.classObj }).populate('students')
              classObj = classObj.concat(tmp);
            }
          }
        }
        parentObj.classes = classObj;
        return res.json({
          status: 200,
          user: parentObj
        }); 
      }
      return res.json({});
    }
  },

  addExpoToken: async (req, res) => {
    let params = req.allParams();
    console.log('params', params);

    let parentFound = null;
    if (params.emailAddress) {
      parentFound = await ParentService.get({
        emailAddress: params.emailAddress.toLowerCase()
      });
    } else {
      return res.json(ErrorMessage.ERR_EDIT_FAIL);
    }
    if (parentFound) {
      let _token =
        parentFound.expoToken === '' ||
          parentFound.expoToken === undefined ||
          parentFound.expoToken === null
          ? ''
          : parentFound.expoToken;
      if (_token != '' && _token.indexOf(params.token) == -1) {
        _token += ';' + params.token;
      } else if (_token === '') {
        _token += params.token;
      }
      sails.log('_token', _token);
      let updated = await ParentService.edit(
        { id: parentFound.id },
        { expoToken: _token }
      );

      return res.json(updated);
    } else {
      return res.json(ErrorMessage.PARENT_ERR_NOT_FOUND);
    }
  },

  getParentsFromClass: async (req, res) => {
    let params = req.allParams();
    console.log('params', params);

    if (!params.classId) {
      return res.json(ErrorMessage.PARENT_ERR_ID_REQUIRED);
    }

    let arrStudentId = [], arrParent = [];
    let arrRelationStudentClass = await Student_Class.find({ classObj: params.classId });
    _.each(arrRelationStudentClass, (relationItem) => {
      arrStudentId.push(relationItem.student);
    });
    let arrRelationStudentParent = await Student_Parent.find({ student: arrStudentId }).populate('parent').populate('student');
    _.each(arrRelationStudentParent, (relationItem) => {
      let parentObj = relationItem.parent;
      let arrStudentObj = [];
      arrStudentObj.push(relationItem.student);
      parentObj.students = arrStudentObj;
      if(parentObj.students[0] && parentObj.students.length) arrParent.push(parentObj);
    });
    // Filter Unique object parent
    let data = arrParent.filter((parentItem, index) => {
      return arrParent.findIndex(f => f.id == parentItem.id) >= index;
    })

    return res.json(data);
  }
};
