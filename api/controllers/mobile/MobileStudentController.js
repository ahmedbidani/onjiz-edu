/**
 * StudentController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
*/
const ErrorMessage = require('../../../config/errors')
const StudentService = require('../../services/StudentService');
const MediaService = require('../../services/MediaService');
const Sharp = require('sharp/lib');
//Library
const moment = require('moment');

module.exports = {
  updateWHHistory: async (req, res) => {
    let params = req.allParams();
    let idStudent = params.idStudent;
    let date = params.date ? params.date : '';
    let height = params.height ? parseFloat(params.height) : 0;
    let weight = params.weight ? parseFloat(params.weight) : 0;
    let createdAt = moment().format('YYYY-MM-DD');

    if (idStudent == '') {
      return res.badRequest(ErrorMessage.STUDENT_ERR_ID_REQUIRED);
    }
    //update new weight, height
    let studentObj = await Student.findOne(idStudent);
    let newWH = {
      height: height,
      weight: weight
    };
    await StudentService.edit(idStudent, newWH);

    //update history
    let data_w_h = {
      createdAt: createdAt,
      date: date,
      height: height,
      weight: weight
    };
    // Find date in w_h_history
    var found_w_h = studentObj.w_h_History.some(el => {
      return el.date === date;
    });
    let editObj = {};

    if (found_w_h == true) {
      for (let i = 0; i < studentObj.w_h_History.length; i++) {
        if (date == studentObj.w_h_History[i].date) {
          studentObj.w_h_History[i].height = height;
          studentObj.w_h_History[i].weight = weight;
          editObj = await Student.update(idStudent)
            .set(studentObj)
            .fetch();
        }
      }
    } else {
      studentObj.w_h_History.push(data_w_h);
      editObj = await Student.update(idStudent)
        .set(studentObj)
        .fetch();
    }

    return res.json({
      code: 'SUCCESS_200',
      data: editObj[0]
    });
  },
  updateHealthHistory: async (req, res) => {
    let params = req.allParams();
    let idStudent = params.idStudent;
    let symptom = params.symptom ? params.symptom : '';
    let note = params.note ? params.note : '';
    let date = params.date ? params.date : '';

    if (idStudent == '') {
      return res.badRequest(ErrorMessage.STUDENT_ERR_ID_REQUIRED);
    }
    let studentObj = await Student.findOne(idStudent);

    let data_h_history = {
      date: date, //format date must be 'YYYY-MM-DD'
      symptom: symptom,
      note: note
    };
    // Find date in w_h_history

    //check date in history
    let dateExists = false;
    for (let i = 0; i < studentObj.healthHistory.length; i++) {
      if (studentObj.healthHistory[i].date === date) {
        dateExists = true;
        studentObj.healthHistory[i] = data_h_history;
      }
    }
    if (!dateExists) {
      studentObj.healthHistory.push(data_h_history);
    }

    let editObj = await Student.update(idStudent)
      .set(studentObj)
      .fetch();

    return res.json({
      code: 'SUCCESS_200',
      data: editObj[0]
    });
  },
  getStudent: async (req, res) => {
    let params = req.allParams();
    let student = await StudentService.get({ id: params.id });
    if (student.length === 0) {
      return res.badRequest(ErrorMessage.STUDENT_ERR_NOT_FOUND);
    }
    return res.json({
      code: 'SUCCESS_200',
      data: student
    });
  },
  getStudentThumb: async (req, res) => {
    let params = req.allParams();
    let sizeStudent = 10;
    let fromPosition = (params.page - 1) * sizeStudent;
    // LIST ALBUM
    let studentArr = await StudentService.find(
      { status: sails.config.custom.STATUS.ACTIVE },
      sizeStudent,
      fromPosition,
      null
    );
    if (studentArr.length === 0) {
      return res.badRequest(ErrorMessage.STUDENT_ERR_NOT_FOUND);
    }
    let listStudent = [];
    for (let i = 0; i < studentArr.length; i++) {
      let listMediaObj = [];
      let mediaId = studentArr[i].avatar;
      let mediaObj = await MediaService.get({ id: mediaId });
      listMediaObj.push(mediaObj);
      studentArr[i].avatar = listMediaObj;
      listStudent.push(studentArr[i]);
    }
    return res.json({
      code: 'SUCCESS_200',
      data: listStudent
    });
  },
  getListStudentByClassId: async (req, res) => {
    let params = req.allParams();
    if (params.classId === null || params.classId === undefined) {
      return res.json(ErrorMessage.CLASS_ERR_ID_REQUIRED);
    }
    let arrStudent = [];
    let arrRelationStudentClass = await Student_Class.find({ classObj: params.classId }).populate('student');
    _.each(arrRelationStudentClass, (relationItem) => {
      arrStudent.push(relationItem.student);
    })

    return res.json(arrStudent);
  },
  
  edit: async (req, res) => {
    sails.log.info("================================ MobileStudentController.edit => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();
    if (!params.id) return res.badRequest(ErrorMessage.STUDENT_ERR_ID_REQUIRED);
    if (!params.firstName) return res.badRequest(ErrorMessage.STUDENT_ERR_FIRSTNAME_REQUIRED);
    if (!params.lastName) return res.badRequest(ErrorMessage.STUDENT_ERR_LASTNAME_REQUIRED);
    if (!params.dateOfBirth) return res.badRequest(ErrorMessage.STUDENT_ERR_BIRTHDAY_REQUIRED);
    if (![0,1].includes(params.gender)) return res.badRequest(ErrorMessage.STUDENT_ERR_GENDER_REQUIRED);
    let currentAddress = params.currentAddress ? params.currentAddress : '';

    let student = await StudentService.get({ id: params.id });
    if (!student) return res.badRequest(ErrorMessage.STUDENT_ERR_NOT_FOUND);

    // PREPARE DATA STUDENT EDIT
    const editData = {
      firstName: params.firstName,
      lastName: params.lastName,
      dateOfBirth: params.dateOfBirth,
      gender: params.gender,
      currentAddress: currentAddress
    };
    
    // UPDATE DATA STUDENT
    const editObj = await StudentService.edit({ id: params.id }, editData);

    // RETURN DATA STUDENT
    return res.json(editObj);
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

        const editObj = await StudentService.edit({ id }, { avatar: '/uploads/' + moment().format('YYYY/MM') + '/' + destFileName });
        return res.json({
          status: 200,
          student: editObj
        }); 
      }
      return res.json({});
    }
  },
};
