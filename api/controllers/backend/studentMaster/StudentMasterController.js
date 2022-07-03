/**
 * StudentController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */


//Library
const ErrorMessages = require('../../../../config/errors');
const moment = require('moment');
const Sharp = require('sharp/lib');
const accents = require('remove-accents');

module.exports = {

  add: async (req, res) => {
    // sails.log.info("================================ StudentController.add => START ================================");
    // // GET ALL PARAMS
    const params = req.allParams();

    // CHECK FULLNAME & DATEOFBIRTH & GENDER PARAMS
    // if (!params.firstName && !params.firstName.trim().length) {
    //   return res.badRequest(ErrorMessages.ERR_FULLNAME_REQUIRED);
    // } else if (!params.lastName && !params.lastName.trim().length) {
    //   return res.badRequest(ErrorMessages.ERR_FULLNAME_REQUIRED);
    // } else if (!params.gender || !params.gender.trim().length) {
    //   return res.badRequest(ErrorMessages.ERR_GENDER_REQUIRED);
    // } else if (!params.dateOfBirth) {
    //   return res.badRequest(ErrorMessages.ERR_BIRTHDAY_REQUIRED);
    // }

    if (!params.code || !params.code.trim().length) {
      return res.badRequest(ErrorMessages.STUDENT_CODE_REQUIRED);
    }

    //CHECK DUPLICATE CODE
    let code = accents.remove(params.code).replace(/\s/g, '');
    const checkCode = await Student.findOne({ code: code, school: req.me.school });
    if (checkCode) return res.badRequest(ErrorMessages.STUDENT_CODE_DUPLICATED);

    let w_h_History = [];
    let data_w_h_History = {
      height: params.height,
      weight: params.weight
    }
    w_h_History.push(data_w_h_History);

    let healthHistory = [];
    let dataHealthHistory = {
      symptom: params.symptom,
      note: params.note
    }
    healthHistory.push(dataHealthHistory);
    // PREPARE DATA STUDENT
    const newData = {
      firstName: params.firstName, //REQUIRED
      lastName: params.lastName, // REQUIRED
      code: params.code, // REQUIRED
      dateOfBirth: params.dateOfBirth, // REQUIRED
      gender: params.gender ? parseInt(params.gender) : 1, // REQUIRED
      currentAddress: params.currentAddress ? params.currentAddress : '',
      height: params.height ? parseFloat(params.height) : 0,
      weight: params.weight ? parseFloat(params.weight) : 0,
      bloodGroup: params.bloodGroup ? params.bloodGroup : '',
      allergy: params.allergy ? params.allergy : '',
      heartRate: params.heartRate ? params.heartRate : '',
      eyes: params.eyes ? params.eyes : '',
      ears: params.ears ? params.ears : '',
      notes: params.notes ? params.notes : '',
      avatar: params.thumbnail,
      status: params.status ? params.status : sails.config.custom.STATUS.DRAFT,
      createdBy: req.session.userId,
      // w_h_History: w_h_History,
      // healthHistory: healthHistory,
      classes: params.classes,
      school: req.me.school
      // parents: params.parents
    };
    // ADD NEW DATA STUDENT
    const newStudent = await StudentService.add(newData);
    //AFTER ADD SUCCES, UPDATE TOTAL STUDENT FOR CLASS
    if (newStudent) {
      for (let classIdItem of params.classes) {
        //get info class
        let classObj = await Class.findOne({ id: classIdItem });
        //count Class in table relation Student - Class
        let totalCount = await Student_Class.count({ classObj: classIdItem });
        //create new data with totalSudent updated
        classObj.totalStudent = totalCount;
        //edit info class
        let idClass = { id: classObj.id };
        await ClassService.edit(idClass, classObj)
      }
    }

    //ADD RELATION FOR FATHER + MOTHER + GUARDIANS
    if (params.mother && params.mother != "") await Student_Parent.create({ student: newStudent.id, parent: params.mother, type: 0 });
    if (params.father && params.father != "") await Student_Parent.create({ student: newStudent.id, parent: params.father, type: 1 });
    if (params.guardians && params.guardians.length > 0) {
      for (let guardianId of params.guardians) {
        await Student_Parent.create({ student: newStudent.id, parent: guardianId, type: 2 });
      }
    }

    // RETURN DATA STUDENT
    return res.ok(newStudent);
  },

  get: async (req, res) => {
    // GET ALL PARAMS
    const params = req.allParams();

    // CHECK ID PARAM
    if (!params.id) {
      return res.badRequest(ErrorMessages.STUDENT_ID_REQUIRED);
    }

    // QUERY & CHECK DATA POST
    const student = await StudentService.get({
      id: params.id
    });
    if (!student) {
      return res.badRequest(ErrorMessages.STUDENT_NOT_FOUND);
    }

    // RETURN DATA POST
    return res.json({
      data: student
    });
  },

  edit: async (req, res) => {
    sails.log.info("================================ StudentController.edit => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();
    if (!params.code || !params.code.trim().length) {
      return res.badRequest(ErrorMessages.STUDENT_CODE_REQUIRED);
    }

    //CHECK DUPLICATE CODE
    let code = accents.remove(params.code).replace(/\s/g, '');
    const checkCode = await Student.findOne({ id: { '!=': params.id }, code: code, school: req.me.school });
    if (checkCode) return res.badRequest(ErrorMessages.STUDENT_CODE_DUPLICATED);

    let healthHistory = [];
    let w_h_History = [];
    let dataHealthHistory = {
      symptom: params.symptom,
      note: params.note
    }
    let data_w_h_History = {
      height: params.height,
      weight: params.weight
    }
    const student = await StudentService.get({ id: params.id });
    if (!student) return res.notFound(ErrorMessages.STUDENT_NOT_FOUND);
    let classes = params.classes;

    // UPDATE TOTAL STUDENT IN CLASS
    if (student.classes.length > 0) {
      for (let i = 0; i < classes.length; i++) {
        let result = student.classes.some(function (el) {
          return el.id == classes[i];
        });
        if (result == false) {
          let classObj = await ClassService.get({ id: classes[i] });
          if (classObj) {
            classObj.totalStudent = classObj.totalStudent + 1;
            await ClassService.edit({ id: classObj.id }, { totalStudent: classObj.totalStudent });
          }
        }
      }
    } else {
      for (let i = 0; i < classes.length; i++) {
        let classObj = await ClassService.get({ id: classes[i] });
        if (classObj) {
          classObj.totalStudent = classObj.totalStudent + 1;
          await ClassService.edit({ id: classObj.id }, { totalStudent: classObj.totalStudent });
        }
      }
    }
    // UPDATE TOTAL STUDENT IN CLASS
    healthHistory.push(dataHealthHistory);
    w_h_History.push(data_w_h_History);
    // PREPARE DATA STUDENT
    const newData = {
      firstName: params.firstName, // REQUIRED
      lastName: params.lastName, // REQUIRED
      code: params.code,
      dateOfBirth: params.dateOfBirth, // REQUIRED
      gender: params.gender ? parseInt(params.gender) : 1, // REQUIRED
      currentAddress: params.currentAddress ? params.currentAddress : '',
      height: params.height ? parseFloat(params.height) : 0,
      weight: params.weight ? parseFloat(params.weight) : 0,
      bloodGroup: params.bloodGroup ? params.bloodGroup : '',
      allergy: params.allergy ? params.allergy : '',
      heartRate: params.heartRate ? params.heartRate : '',
      eyes: params.eyes ? params.eyes : '',
      ears: params.ears ? params.ears : '',
      notes: params.notes ? params.notes : '',
      avatar: params.thumbnail,
      status: params.status ? params.status : sails.config.custom.STATUS.DRAFT,
      createdBy: req.session.userId,
      // healthHistory: healthHistory,
      // w_h_History: w_h_History,
      // parents: params.parents
    };
    // UPDATE DATA Student
    const editObj = await StudentService.edit({ id: params.id }, newData);

    //replaceCollection
    await Student.replaceCollection(params.id, 'classes').members(classes);

    //EDIT RELATION FOR FATHER + MOTHER + GUARDIANS
    let student_parents = await Student_Parent.find({ student: params.id });
    let oldGuardians = [];

    let isHaveMother = false;
    let isHaveFather = false;
    for (let student_parent of student_parents) {
      if (student_parent.type == 0) {
        if (student_parent.parent != params.mother) {
          await Student_Parent.destroy({ id: student_parent.id });
          if (params.mother != "") await Student_Parent.create({ student: params.id, parent: params.mother, type: 0 });
        }
        isHaveMother = true;
      } else if (student_parent.type == 1) {
        if (student_parent.parent != params.father) {
          await Student_Parent.destroy({ id: student_parent.id });
          if (params.father != "") await Student_Parent.create({ student: params.id, parent: params.father, type: 1 });
        }
        isHaveFather = true;
      } else {
        oldGuardians.push(student_parent.parent);
      }
    }

    //add father and mother if not existed
    if (!isHaveMother && params.mother != "") await Student_Parent.create({ student: params.id, parent: params.mother, type: 0 });
    if (!isHaveFather && params.father != "") await Student_Parent.create({ student: params.id, parent: params.father, type: 1 });

    if (params.guardians) {
      //added guardians
      let addedGuardians = params.guardians.filter(item => !oldGuardians.includes(item));
      //removed guardians
      let removedGuardians = oldGuardians.filter(item => !params.guardians.includes(item));

      if (addedGuardians.length > 0) {
        for (let guardianId of addedGuardians) {
          await Student_Parent.create({ student: params.id, parent: guardianId, type: 2 });
        }
      }

      if (removedGuardians.length > 0) {
        for (let guardianId of removedGuardians) {
          await Student_Parent.destroy({ student: params.id, parent: guardianId, type: 2 });
        }
      }
    } else {
      await Student_Parent.destroy({ student: params.id, type: 2 });
    }

    // RETURN DATA Student
    return res.json(editObj);
  },

  trash: async (req, res) => {
    sails.log.info("================================ StudentController.trash => START ================================");
    let params = req.allParams();
    if (!params.ids) return res.badRequest(ErrorService.ERR_ID_REQUIRED);
    let ids = params.ids;
    if (params.ids.indexOf(';') != -1) {
      ids = ids.split(';');
    }
    if (typeof (ids) == 'object') {
      for (var i = 0; i < ids.length; i++) {
        let student = await StudentService.get({ id: ids[i] });
        if (student) await Student.destroy({ id: ids[i] });
      }
    } else {
      let student = await StudentService.get({ id: ids });
      if (student) await Student.destroy({ id: ids });
    }
    return res.ok();
  },

  uploadThumbnail: async (req, res) => {
    sails.log.info("================================ StudentController.uploadThumbnail => START ================================");
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
    sails.log.info("================================ StudentController.search => START ================================");
    sails.log(req.branchActive);
    let params = req.allParams();
    let webSettings = res.locals.webSettings;
    let dateFormat = webSettings.value.dateFormat;
    let keyword = params.keyword ? params.keyword : null;
    let classId = params.classId ? params.classId : '0';
    let draw = (params.draw) ? parseInt(params.draw) : 1;
    let limit = (params.length) ? parseInt(params.length) : null;
    let skip = (params.start) ? parseInt(params.start) : null;
    //let sessionId =
    let branchId = params.branchId ? params.branchId : '0';
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
    let objOrder = {};
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
          { code: { $regex: keyword, $options: 'i' } },
          { firstName: { $regex: keyword, $options: 'i' } },
          { lastName: { $regex: keyword, $options: 'i' } }
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
        return new mongo.ObjectID(std.id);
      })
    }
    //get student by all class
    else if (branchId && branchId != '0' && branchId != 'undefined' && branchId != 'null' && classId != '3') {
      let session = await CourseSession.find({ branchOfSession: branchId });
      for (let sessionObj of session) {
        let classes = await Class.find({ courseSession: sessionObj.id }).populate('students');
        for (let classObj of classes) {
          let ids = classObj.students.map((std) => {
            return new mongo.ObjectID(std.id);
          })
          studentIds = [...studentIds, ...ids];
        }
      }
    }
    //get all student
    else if (branchId && branchId != '0' && branchId != 'undefined' && branchId != 'null' && classId != '-1') {
      let studentIds1 = await Student.find({ school: req.me.school });
      let ids = studentIds1.map((std) => {
        return new mongo.ObjectID(std.id);
      })
      studentIds = [...studentIds, ...ids];
    }
    else {
      let classes = await Class.find({ school: req.me.school }).populate('students');
      for (let classObj of classes) {
        let ids = classObj.students.map((std) => {
          return new mongo.ObjectID(std.id);
        })
        studentIds = [...studentIds, ...ids];
      }
    }

    where.$and = [
      { _id: { $in: studentIds } },
      { school: new mongo.ObjectID(req.me.school) }
    ];
    if (params.gender && params.gender != 2) {
      where.$and.push({ gender: parseInt(params.gender) });
    }
    if (params.status && params.status != 0) {
      where.$and.push({ status: parseInt(params.status) });
    }


    /**SEARCH CASE_INSENSITIVE */
    const collection = Student.getDatastore().manager.collection(Student.tableName);
    let result = [];
    if (params.length && params.start) {
      result = await collection.find(where).limit(limit).skip(skip).sort(newSort);
    } else {
      result = await collection.find(where).sort(newSort);
    }
    const totalStudent = await collection.count(where);
    const dataWithObjectIds = await result.toArray();
    const arrStudent = JSON.parse(JSON.stringify(dataWithObjectIds).replace(/"_id"/g, '"id"'));


    // let arrStudent = await Student.find({ where, limit, skip, sort }).populate('parents');
    // handler to render datatable
    let resStudents = [];
    let ordinalNumber = params.start ? parseInt(params.start) + 1 : 1;
    for (let studentObj of arrStudent) {
      let student = await StudentService.get({ id: studentObj.id });
      let tmpData = {};
      // ID
      tmpData.id = '<input class="js-checkbox-item" type="checkbox" value="' + student.id + '">';
      // Ordinal Number
      tmpData.ordinalNumber = ordinalNumber;
      // CODE STUDENT
      //just get code of student (do not get code of school)
      tmpData.code = student.code;
      // AVATAR & FULLNAME
      let path = "/images/avatar2.png";
      if (student.gender == 0) path = "/images/female-kid.png";
      if (student.gender == 1) path = "/images/male-kid.png";
      let _tmpFullname = await sails.helpers.formatFullname(student.firstName, student.lastName, webSettings.value.displayName);
      if (student.avatar != "") {

        tmpData.fullName =
          `<div class="d-flex align-items-center">
            <img src="${student.avatar}" alt="profile" class="img-sm rounded-circle">
            <span> ${_tmpFullname}</span>
          </div>`;
      } else {
        tmpData.fullName =
          `<div class="d-flex align-items-center">
          <img src="${path}" alt="profile" class="img-sm rounded-circle">
          <span> ${_tmpFullname}</span>
        </div>`;
      }


      tmpData.mothers = '';
      let student_mother = await Student_Parent.find({ student: studentObj.id, type: 0 });
      if (student_mother.length) {
        for (let j in student_mother) {
          let mother = await Parent.findOne({ id: student_mother[j].parent });
          if (mother) {
            if (parseInt(j) > 0) tmpData.mothers += '<br>';
            let _tmpFullnameMother = await sails.helpers.formatFullname(mother.firstName, mother.lastName, webSettings.value.displayName);
            tmpData.mothers += '- ' + _tmpFullnameMother;
          }
        }
        // if (student_mother) {
        //   let mother = await Parent.findOne({ id: student_mother.parent });
        //   if (mother) tmpData.mothers = mother.firstName + ' ' + mother.lastName;
      } else tmpData.mothers += '- ';

      tmpData.fathers = '';
      let student_father = await Student_Parent.find({ student: studentObj.id, type: 1 });
      if (student_father.length) {
        for (let j in student_father) {
          let father = await Parent.findOne({ id: student_father[j].parent });
          if (father) {
            if (parseInt(j) > 0) tmpData.fathers += '<br>';
            let _tmpFullnameFather = await sails.helpers.formatFullname(father.firstName, father.lastName, webSettings.value.displayName);
            tmpData.fathers += '- ' + _tmpFullnameFather;
          }
        }
        // if (student_father) {
        //   let father = await Parent.findOne({ id: student_father.parent });
        //   if (father) tmpData.fathers = father.firstName + ' ' + father.lastName;
      } else tmpData.fathers += '-';
      tmpData.class = '';
      let student_class = await Student_Class.find({ student: studentObj.id });
      if (student_class.length) {
        for (let j in student_class) {
          let classname = await Class.findOne({ id: student_class[j].classObj });
          if (classname) {
            if (parseInt(j) > 0) tmpData.class += '<br>';
            tmpData.class += '- ' + classname.title;
          }
        }

        //   let classname = await Class.findOne({ id: student_class.classObj });
        //   if (classname) tmpData.class = classname.title;
      } else tmpData.class += '-';
      // BIRTHDAY
      tmpData.dateOfBirth = moment(student.dateOfBirth, "YYYY-MM-DD").format(dateFormat);
      // GENDER
      tmpData.gender = student.gender == 1 ? sails.__("Male") : sails.__("Female");
      // ADDRESS
      tmpData.currentAddress = student.currentAddress;

      tmpData.status = '<select>';
      if (isMainSchoolAdmin || isHavePermissionEdit) {
        if (student.status == 1) {
          tmpData.status += `
            <option value="1" selected>` + sails.__("Active") + `</option>
            <option value="2">` + sails.__("Reserve") + `</option>
            <option value="3">` + sails.__("Inactive") + `</option>
            <option value="4">` + sails.__("Trash") + `</option>
          </select>
          `;
        } else if (student.status == 2) {
          tmpData.status += `
            <option value="1">` + sails.__("Active") + `</option>
            <option value="2" selected>` + sails.__("Reserve") + `</option>
            <option value="3">` + sails.__("Inactive") + `</option>
            <option value="4">` + sails.__("Trash") + `</option>
          </select>
          `;
        } else if (student.status == 5) {
          tmpData.status += `
            <option value="1">` + sails.__("Active") + `</option>
            <option value="2">` + sails.__("Reserve") + `</option>
            <option value="3" selected>` + sails.__("Inactive") + `</option>
            <option value="4">` + sails.__("Trash") + `</option>
          </select>
          `;
        } else if (student.status == 6) {
          tmpData.status += `
            <option value="1">` + sails.__("Active") + `</option>
            <option value="2">` + sails.__("Reserve") + `</option>
            <option value="3">` + sails.__("Inactive") + `</option>
            <option value="4" selected>` + sails.__("Trash") + `</option>
          </select>
          `;
        }
      } else {
        if (student.status == 1) {
          tmpData.status = '<label class="badge badge-success">' + sails.__("Active") + '</label>';
        } else {
          tmpData.status = '<label class="badge badge-warning">' + sails.__("Draft") + '</label>';
        }
      }

      //URL
      student.url = "/backend/student/edit/";
      // TOOL
      tmpData.tool = await sails.helpers.renderRowAction(student, isMainSchoolAdmin, isHavePermissionEdit, isHavePermissionDelete);
      resStudents.push(tmpData);
      ordinalNumber++;
    };
    // let totalStudent = await StudentService.count(where);
    return res.ok({ draw: draw, recordsTotal: totalStudent, recordsFiltered: totalStudent, data: resStudents });

  },

  switchStatus: async (req, res) => {
    sails.log.info("================================ StudentController.switchStatus => START ================================");
    // // GET ALL PARAMS
    const params = req.allParams();
    if (!params.id) return res.badRequest(ErrorMessages.STUDENT_ID_REQUIRED);

    //CHECK OBJ IS EXISTED?
    let studentObj = await StudentService.get({ id: params.id });
    if (!studentObj) return res.badRequest(ErrorMessages.STUDENT_NOT_FOUND);

    //switch status of current obj
    if (studentObj.status == 1) studentObj = await StudentService.edit({ id: params.id }, { status: 0 });
    else studentObj = await StudentService.edit({ id: params.id }, { status: 1 });

    return res.json(studentObj);
    // END UPDATE
  },
};
