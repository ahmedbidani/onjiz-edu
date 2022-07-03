let moment = require('moment');
const ErrorMessages = require('../../../../config/errors');
const Sharp = require('sharp/lib');
const StudentMedicalService = require('../../../services/StudentMedicalService');
const ClassService = require('../../../services/ClassService');
const accents = require('remove-accents');

module.exports = {

  search: async (req, res) => {
    sails.log.info("================================ MedicalController.search => START ================================");
    let params = req.allParams();
    let keyword = params.keyword ? params.keyword : "";
    let webSettings = res.locals.webSettings;
    params.classId = params.classId ? params.classId : null;
    let schoolObj = await School.findOne({ id: req.me.school });
    let isMainSchoolAdmin = 3 == req.me.userType ? true : false;
    let isHavePermissionEdit = false;
    let isHavePermissionDelete = false;
    if (!isMainSchoolAdmin && req.me.role && req.me.role.permissions && req.me.role.permissions.album) {
      isHavePermissionEdit = req.me.role.permissions.album.edit ? true : false;
      isHavePermissionDelete = req.me.role.permissions.album.delete ? true : false;
    }
    params.length = params.length ? parseInt(params.length) : 50;
    params.start = params.start ? parseInt(params.start) : 0;
    // if (!isMainSchoolAdmin && req.me.role && req.me.role.permissions && req.me.role.permissions.album) {
    //   isHavePermissionEdit = req.me.role.permissions.album.edit ? true : false;
    //   isHavePermissionDelete = req.me.role.permissions.album.delete ? true : false;
    // }
    let objOrder = {};
    objOrder.date = 'asc';
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
        $or: [{
            note: {
              $regex: keyword,
              $options: 'i'
            }
          }
        ]
      }
    }
    if (params.classId) {
      let classObj = await ClassService.get({ id: params.classId });
      if (classObj && classObj.id) {
        let mongo = require('mongodb');
        where.$and = [{
          classObj: new mongo.ObjectID(classObj.id)
        }];
      } 
    }
    
    /**SEARCH CASE_INSENSITIVE */
    const collection = Medical.getDatastore().manager.collection(Medical.tableName);
    let result = [];
    if (params.length && params.start) {
      result = await collection.find(where).limit(limit).skip(skip).sort(newSort);
    } else {
      result = await collection.find(where).sort(newSort);
    }
    const totalMedical = await collection.count(where);
    const dataWithObjectIds = await result.toArray();
    const arrObjMedical = JSON.parse(
      JSON.stringify(dataWithObjectIds).replace(/"_id"/g, '"id"')
    );
    let resMedical = [];
    for (let medical of arrObjMedical) {
      let tmpData = {};
      medical.url = "/backend/medical/edit/";
      let classObj = await ClassService.get({ id: medical.classObj });
      tmpData.id ='<input class="js-checkbox-item" type="checkbox" value="' + medical.id + '">';
      tmpData.tool = await sails.helpers.renderRowAction(medical, isMainSchoolAdmin, isHavePermissionEdit, isHavePermissionDelete);
      tmpData.class = classObj.title;
      //tmpData.tool = `<div><a href="` + "/backend/medical/detail/" + medical.id + `"><i class= "mdi mdi-eye"></i></a></div>` + tmpData.tool; 
      tmpData.detail = `<div class="text-right"><a href="` + "/backend/medical/detail/" + medical.id + `"><i class= "mdi mdi-eye"></i></a></div>`;
      //tmpData.detail = '-';
      tmpData.date = moment(medical.date, "YYYY-MM-DD").format(webSettings.value.dateFormat);
      if (!medical.note || medical.note == "") tmpData.note = "-";
      else tmpData.note = medical.note;
      resMedical.push(tmpData);
    }
    
    return res.ok({
      draw: 1,
      recordsTotal: totalMedical,
      recordsFiltered: totalMedical,
      data: resMedical,
      dataOriginal: arrObjMedical
    });
  },
  detailstudents: async (req, res) => {
    sails.log.info("================================ MedicalController.detailstudents => START ================================");
    let params = req.allParams();
    let medicalObj = {};
    let webSettings = res.locals.webSettings;
    let keyword = params.keyword ? params.keyword : "";
    let schoolObj = await School.findOne({ id: req.me.school });
    let isMainSchoolAdmin = 3 == req.me.userType ? true : false;
    let isHavePermissionEdit = false;
    let isHavePermissionDelete = false;
    if (!isMainSchoolAdmin && req.me.role && req.me.role.permissions && req.me.role.permissions.album) {
      isHavePermissionEdit = req.me.role.permissions.album.edit ? true : false;
      isHavePermissionDelete = req.me.role.permissions.album.delete ? true : false;
    } else if (isMainSchoolAdmin) {
      isMainSchoolAdmin = false;
      isHavePermissionDelete = false;
      isHavePermissionEdit = true;
    }
    if (params.medicalId) medicalObj = await Medical.findOne({ id: params.medicalId }); 
    let listmedicals = [];
    let medicals = [];
    if (medicalObj) listmedicals = await Student_Medical.find({ medical: medicalObj.id }).populate('student');
    if (listmedicals.length == 0) {
      let classObj = await ClassService.get({ id: medicalObj.classObj });
      if (classObj && classObj.students && classObj.students.length) {
        for (let student of classObj.students) {
          let studentMedical = await Student_Medical.create({
            student: student.id,
            medical: medicalObj.id
          }).fetch();
          if (studentMedical) {
            let studentObj = await Student.findOne({ id: student.id });
            studentMedical.student = studentObj;
            medicals.push(studentMedical); 
          }  
        }
      }
    } else {
      if (typeof keyword === "string" && keyword.length > 0) {
        for (let medical of listmedicals) {
          if (medical.student.firstName.includes(keyword) || medical.student.lastName.includes(keyword)
            || medical.student.code.includes(keyword)) medicals.push(medical);
        }
      } else medicals = listmedicals;
    }
    medicals.sort(function(a, b){
      var x = a.student.firstName.toLowerCase();
      var y = b.student.firstName.toLowerCase();
      if (x < y) {return -1;}
      if (x > y) {return 1;}
      return 0;
    });
    const totalMedical = medicals.length;
    let resMedical = [];
    for (let medical of medicals) {
      let tmpData = {};
      medical.url = "/backend/medical/editStudentMedical/";
      tmpData.code = medical.student.code;
      let fullName = await sails.helpers.formatFullname(medical.student.firstName, medical.student.lastName, webSettings.value.displayName);
      tmpData.student = fullName;
      tmpData.date = moment(medicalObj.date, "YYYY-MM-DD").format(webSettings.value.dateFormat);
      if (!medical.height || medical.height && medical.height == "") tmpData.height = "-";
      else tmpData.height = medical.height;
      
      if (!medical.weight || medical.weight && medical.weight == "") tmpData.weight = "-";
      else tmpData.weight= medical.weight;
      
      if (!medical.bloodGroup || medical.bloodGroup && medical.bloodGroup == "") tmpData.bloodGroup = "-";
      else tmpData.bloodGroup = medical.bloodGroup;
      
      if (!medical.allergy || medical.allergy && medical.allergy == "") tmpData.allergy = "-";
      else tmpData.allergy = medical.allergy;
      
      if (!medical.heartRate || medical.heartRate && medical.heartRate == "") tmpData.heartRate = "-";
      else tmpData.heartRate = medical.heartRate;
      
      if (!medical.eyes || medical.eyes && medical.eyes == "") tmpData.eyes = "-";
      else tmpData.eyes = medical.eyes;
      
      if (!medical.ears || medical.ears && medical.ears == "") tmpData.ears = "-";
      else tmpData.ears = medical.ears;

      if (!medical.notes || medical.notes && medical.notes == "") tmpData.notes = "-";
      else tmpData.notes = medical.notes;
      tmpData.id ='<input class="js-checkbox-item" type="checkbox" value="' + medical.id + '">';
      tmpData.tool = await sails.helpers.renderRowAction(medical, isMainSchoolAdmin, isHavePermissionEdit, isHavePermissionDelete);

      // tmpData.height = '<input type="text" id="height" name="height" value="' + medical.height + '">';
      // tmpData.weight= '<input type="text" id="weight" name="weight" value="'+ medical.weight +'">';
      // tmpData.bloodGroup= '<input type="text" id="bloodGroup" name="bloodGroup" value="'+ medical.bloodGroup +'">';
      // tmpData.allergy= '<input type="text" id="allergy" name="allergy" value="'+ medical.allergy +'">';
      // tmpData.heartRate= '<input type="text" id="heartRate" name="heartRate" value="'+ medical.heartRate +'">';
      // tmpData.eyes= '<input type="text" id="eyes" name="eyes" value="'+ medical.eyes +'">';
      // tmpData.ears= '<input type="text" id="ears" name="ears" value="'+ medical.ears +'">';
      // tmpData.id ='<input class="js-checkbox-item" type="checkbox" value="' + medical.id + '">';
      resMedical.push(tmpData);
    }
    return res.ok({
      draw: 1,
      recordsTotal: totalMedical,
      recordsFiltered: totalMedical,
      data: resMedical
    });
  },
  editStudent: async (req, res) => {
    sails.log.info("================================ MedicalController.editStudent => START ================================");
    let params = req.allParams();
    if (!params.id) return res.badRequest();
    let medicalStudent = {};
    medicalStudent = await StudentMedicalService.get({ id: params.id });
    if (!medicalStudent.student && !medicalStudent.student.id) return res.badRequest();
    let studentObj = await Student.findOne({ id: medicalStudent.student.id }); 
    if (!studentObj) return res.badRequest();
    if (!medicalStudent) return res.badRequest();
    medicalStudent.height =  params.height ? params.height : 0;
    medicalStudent.weight = params.weight ? params.weight : 0;
    medicalStudent.bloodGroup = params.bloodGroup ? params.bloodGroup : "";
    medicalStudent.allergy =  params.allergy ? params.allergy : "";
    medicalStudent.heartRate =  params.heartRate ? params.heartRate : "";
    medicalStudent.eyes =  params.eyes ? params.eyes : "";
    medicalStudent.ears = params.ears ? params.ears : "";
    medicalStudent.notes = params.notes ? params.notes : "";
    let createdAt = '';
    if (medicalStudent.medical.createdAt) {
      let dateCreate = medicalStudent.medical.createdAt;
      if (dateCreate) {
        let d = new Date(parseInt(dateCreate));;
        let y = d.getFullYear().toString();
        let m = parseInt((d.getMonth() + 1));
        if (m < 10) m = '0' + m;
        let dd = d.getDate().toString();
        if(y && m && dd)createdAt = y + '-' + m + '-' + dd;
      }
    }
    let data_w_h = {
      createdAt: createdAt,
      date: medicalStudent.medical.date,
      height: medicalStudent.height + '',
      weight: medicalStudent.weight + ''
    };
    // Find date in w_h_history
    var found_w_h = studentObj.w_h_History.some(el => {
      return el.date === medicalStudent.medical.date;
    });
    //let editObj = {};

    if (found_w_h == true) {
      for (let i = 0; i < studentObj.w_h_History.length; i++) {
        if (medicalStudent.medical.date == studentObj.w_h_History[i].date) {
          studentObj.w_h_History[i].height = medicalStudent.height + '';
          studentObj.w_h_History[i].weight = medicalStudent.weight + '';
          //editObj = await Student.update(idStudent)
            //.set(studentObj)
            //.fetch();
        }
      }
    } else {
      studentObj.w_h_History.push(data_w_h);
      //editObj = await Student.update(idStudent)
        //.set(studentObj)
        //.fetch();
    }

    let listMedicalStudent = await Medical.find({
      classObj: medicalStudent.medical.classObj,
      createdAt: { '>': medicalStudent.medical.createdAt }
    })
    medicalStudent.student = medicalStudent.student.id;
    medicalStudent.medical = medicalStudent.medical.id;
    
    if (listMedicalStudent.length == 0) {
      studentObj.height = medicalStudent.height;
      studentObj.weight = medicalStudent.weight;
      studentObj.bloodGroup = medicalStudent.bloodGroup;
      studentObj.allergy = medicalStudent.allergy;
      studentObj.heartRate = medicalStudent.heartRate;
      studentObj.eyes = medicalStudent.eyes;
      studentObj.ears = medicalStudent.ears;
      studentObj.notes = medicalStudent.notes;
    }
    await StudentService.edit({ id: studentObj.id }, studentObj);
    let editObj = await Student_Medical.update({ id: params.id }, medicalStudent);
    
    return res.ok({
      editObj
    });
  },
  addMedical: async (req, res) => {
    sails.log.info("================================ MedicalController.search => START ================================");
    let params = req.allParams();
    if (!params.classes) return res.badRequest();
    let classObj = await Class.findOne({ id: params.classes });
    if (!classObj) res.badRequest();
    if (!params.date) return res.badRequest();
    let medicalObj = {};
    medicalObj.classObj = classObj.id;
    medicalObj.date = params.date;
    medicalObj.note = params.note ? params.note : "";

    let medical = await Medical.create(medicalObj).fetch();;
    
    return res.ok({
      medical
    });
  },
  editMedical: async (req, res) => {
    sails.log.info("================================ MedicalController.search => START ================================");
    let params = req.allParams();
    if (!params.id) return res.badRequest();
    let medical = await Medical.findOne({ id: params.id });
    if (!medical) return res.badRequest();
    if (!params.classes) return res.badRequest();
    let classObj = await Class.findOne({ id: params.classes });
    if (!classObj) res.badRequest();
    if (!params.date) return res.badRequest();
    let medicalObj = {};
    medicalObj.classObj = classObj.id;
    medicalObj.date = params.date;
    medicalObj.note = params.note ? params.note : "";

    medical = await Medical.update({ id: params.id }, medicalObj);
    
    return res.ok({
      medical
    });
  }, 
  delete: async (req, res) => {
    sails.log.info("================================ MedicalController.search => START ================================");
    let params = req.allParams();
    if (!params.ids) return res.badRequest();
    let arrId = params.ids.split(';');
    for (let id of arrId) {
      let medical = await Medical.findOne({ id: id });
      if (medical) {
        await Medical.destroy({ id: id });
        await Student_Medical.destroy({ medical: id });
      } 
    }
    
    return res.ok();
  }, 
  exportDetailMedical:async (req, res) => {
    sails.log.info("================================ MedicalController.detailstudents => START ================================");
    let params = req.allParams();
    let medicalObj = {};
    let webSettings = res.locals.webSettings;
    let keyword = params.keyword ? params.keyword : "";
    if (params.medicalId) medicalObj = await Medical.findOne({ id: params.medicalId }).populate('classObj'); 
    let listmedicals = [];
    let medicals = [];
    if (medicalObj) listmedicals = await Student_Medical.find({ medical: medicalObj.id }).populate('student');
    if (typeof keyword === "string" && keyword.length > 0) {
      for (let medical of listmedicals) {
        if (medical.student.firstName.includes(keyword) || medical.student.lastName.includes(keyword)
          || medical.student.code.includes(keyword)) medicals.push(medical);
      }
    } else medicals = listmedicals;
    medicals.sort(function(a, b){
      var x = a.student.firstName.toLowerCase();
      var y = b.student.firstName.toLowerCase();
      if (x < y) {return -1;}
      if (x > y) {return 1;}
      return 0;
    });
    let resMedical = [];
    for (let medical of medicals) {
      let tmpData = {};
      tmpData.code = '`' + medical.student.code;
      let fullName = await sails.helpers.formatFullname(medical.student.firstName, medical.student.lastName, webSettings.value.displayName);
      tmpData.student = fullName;
      tmpData.class = medicalObj.classObj.code;
      if (!medicalObj.date) tmpData.date = '-';
      else tmpData.date = moment(medicalObj.date, "YYYY-MM-DD").format(webSettings.value.dateFormat);
    
      if (!medical.height || medical.height && medical.height == "") tmpData.height = "-";
      else tmpData.height = medical.height;
      
      if (!medical.weight || medical.weight && medical.weight == "") tmpData.weight = "-";
      else tmpData.weight= medical.weight;
      
      if (!medical.bloodGroup || medical.bloodGroup && medical.bloodGroup == "") tmpData.bloodGroup = "-";
      else tmpData.bloodGroup = medical.bloodGroup;
      
      if (!medical.allergy || medical.allergy && medical.allergy == "") tmpData.allergy = "-";
      else tmpData.allergy = medical.allergy;
      
      if (!medical.heartRate || medical.heartRate && medical.heartRate == "") tmpData.heartRate = "-";
      else tmpData.heartRate = medical.heartRate;
      
      if (!medical.eyes || medical.eyes && medical.eyes == "") tmpData.eyes = "-";
      else tmpData.eyes = medical.eyes;
      
      if (!medical.ears || medical.ears && medical.ears == "") tmpData.ears = "-";
      else tmpData.ears = medical.ears;

      if (!medical.notes || medical.notes && medical.notes == "") tmpData.notes = "-";
      else tmpData.notes = medical.notes;
      resMedical.push(tmpData);
    }
    medicals = resMedical;
    return res.ok({
      medicals: medicals
    });
  },
};

