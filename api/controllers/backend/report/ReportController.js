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


  export: async (req, res) => {
    sails.log.info("================================ StudentController.export => START ================================");
    sails.log(req.branchActive);
    let params = req.allParams();
    let classId = params.classId ? params.classId : null;
    let branchId = params.branchId ? params.branchId : '-1';
    let dayStart = params.date;
    let dayEnd = params.dateEnd;

    let setting = await Setting.findOne({ key: 'web', school: req.me.school });
		let weekend = setting.value && setting.value.weekend ? setting.value.weekend : []; //6,7 is saturday and sunday

    //prepared order param
    let objOrder = {};
    objOrder['firstName'] = "DESC";
    //let sort = [objOrder];

    //get new sort for find insensitive case
    let newSort = {};
    for(var key in objOrder){
      if(objOrder[key] == 'desc'){
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
          { code: { $regex: keyword, $options: 'i' }},
          { firstName: { $regex: keyword, $options: 'i' }},
          { lastName: { $regex: keyword, $options: 'i' } }
        ]
      } 
    }

    let mongo = require('mongodb');
    
    //get students form class 
    let studentIds = [];
    if (classId && classId != '0' && classId != 'undefined' && classId != 'null' && classId != '-1') {
      let classObj = await Class.findOne({ id: classId, school: req.me.school }).populate('students');
      studentIds = classObj.students.map((std) => {
        return new mongo.ObjectID(std.id);
      })
    } else if (branchId && branchId != '0' && branchId != 'undefined' && branchId != 'null') {
      let session = await CourseSession.find({ branchOfSession: branchId });
      for (let sessionObj of session) {
        let classes = await Class.find({courseSession: sessionObj.id}).populate('students');
        for (let classObj of classes){
          let ids = classObj.students.map((std) => {
            return new mongo.ObjectID(std.id);
          })
          studentIds = [...studentIds, ...ids];
        }
      }
    } else {
      let classes = await Class.find({ school: req.me.school }).populate('students');
      for (let classObj of classes){
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
    where.$and.push({ $or: [{ status: 1 }, { status: 2 } ] });

    /**SEARCH CASE_INSENSITIVE */
    const collection = Student.getDatastore().manager.collection(Student.tableName);
    let result = [];
      result = await collection.find(where).sort(newSort);;
    
    const totalStudent = await collection.count(where);
    const dataWithObjectIds = await result.toArray();
    const arrStudent = JSON.parse(JSON.stringify(dataWithObjectIds).replace(/"_id"/g, '"id"'));


    let headerExcel = ["#", "FullName"];
    var dataListStudent = [];	
    let checkHeader = 0;
		for (let studentObj of arrStudent) {
      let student = await StudentService.get({ id: studentObj.id });

      let tmpStudent = [];
			
			tmpStudent.push("'" + student.code);
      //FULLNAME
      
      // GET DISPLAY NAME
      let displayName = setting.value.displayName ? setting.value.displayName : 'firstlast';

      let _tmpFullname = await sails.helpers.formatFullname(student.firstName, student.lastName, displayName);

			tmpStudent.push(_tmpFullname);
			

      let allDayOfMonth = 0;
      let allDayAtClass = 0;
      // WHEN DAYSTART AND DAYEND DIFFRENT MONTH
      if(parseInt(dayEnd.split("-")[1]) > parseInt(dayStart.split("-")[1])) {
        var day1 = new Date(dayStart.split("-").reverse().join("-"));
        var day2 = new Date(dayEnd.split("-").reverse().join("-"));

        var firstday = new Date(dayEnd.split("-")[2] + '-' + dayEnd.split("-")[1] + '-' + '01');
        var diffTime = parseInt((firstday - day1) / (1000 * 60 * 60 * 24), 10);
        
        let arrAttendent = await Attendent.find({ status: 1, student: student.id, date: { '>=': day1, '<=': day2 } });
        let arrAttendentDate = [];

        // ARRAY GET DAYS AT SCHOOL
        if (arrAttendent.length) {
          for(let j in arrAttendent)
            arrAttendentDate.push(arrAttendent[j].date);
        }


        let i = 0;
        while(i < diffTime){ 
          dataDay = day1.getDate() + i; 
          
          let checkday = dayStart.split("-")[2] + '-' + dayStart.split("-")[1];
          if (dataDay < 10) checkday += '-0' + dataDay;
          else checkday += '-' + dataDay;
          //var d = new Date(checkday);
          let checkWeekend = moment(checkday, "YYYY-MM-DD").isoWeekday() + '';
          if (weekend.includes(checkWeekend)) { 
            tmpStudent.push('OFF');
            if (checkHeader == 0) headerExcel.push(dataDay);
          } else {
            allDayOfMonth++;
            if (arrAttendentDate.includes(checkday)) {
              allDayAtClass++;
              tmpStudent.push('1');
              if (checkHeader == 0) headerExcel.push(dataDay);
            } else {
              tmpStudent.push('-');
              if (checkHeader == 0) headerExcel.push(dataDay);
            }
          }
          i++;
        }
        
        diffTime = parseInt((day2 - firstday) / (1000 * 60 * 60 * 24), 10);
        i=0;
        while(i <= diffTime){
          i++; 
          let tmpcolumn = 'last' + i;
          let checkday = dayEnd.split("-")[2] + '-' + dayEnd.split("-")[1];
          if (i < 10) checkday += '-0' + i;
          else checkday += '-' + i;
          let checkWeekend = moment(checkday, "YYYY-MM-DD").isoWeekday() + '';
          if (weekend.includes(checkWeekend)) { 
            tmpStudent.push('OFF');
            if (checkHeader == 0) headerExcel.push(i);
          } else {
            allDayOfMonth++;
            if (arrAttendentDate.includes(checkday)) {
              allDayAtClass++;
              tmpStudent.push('1');
              if (checkHeader == 0) headerExcel.push(i);
            } else {
              tmpStudent.push('-');
              if (checkHeader == 0) headerExcel.push(i);
            }
          }
        }
      } else { // WHEN DAYSTART AND DAYEND SAME MONTH
        var day1 = new Date(dayStart.split("-").reverse().join("-"));
        var day2 = new Date(dayEnd.split("-").reverse().join("-"));

        var diffTime = parseInt((day2 - day1) / (1000 * 60 * 60 * 24), 10);

				let arrAttendent = await Attendent.find({ status: 1, student: student.id, date: { '>=': day1, '<=': day2 } });
        let arrAttendentDate = [];
        
        // ARRAY GET DAYS AT SCHOOL
        if (arrAttendent.length) {
          for(let j in arrAttendent)
            arrAttendentDate.push(arrAttendent[j].date);
        }
        let i = 0;
        while(i <= diffTime){ 
					dataDay = day1.getDate() + i; 
					
					let checkday = dayEnd.split("-")[2] + '-' + dayEnd.split("-")[1];
          if (dataDay < 10) checkday += '-0' + dataDay;
          else checkday += '-' + dataDay;
          let checkWeekend = moment(checkday, "YYYY-MM-DD").isoWeekday() + '';
          if (weekend.includes(checkWeekend)) { 
            tmpStudent.push('OFF');
            if (checkHeader == 0) headerExcel.push(dataDay);
          } else {
            allDayOfMonth++;
            if (arrAttendentDate.includes(checkday)) {
              allDayAtClass++;
              tmpStudent.push('1');
              if (checkHeader == 0) headerExcel.push(dataDay);
            } else {
              tmpStudent.push('-');
              if (checkHeader == 0) headerExcel.push(dataDay);
            }
          }
          i++;
        }
      }

      tmpStudent.push(allDayAtClass);
      if (checkHeader == 0) headerExcel.push("Total");
      if (checkHeader == 0) dataListStudent.push(headerExcel);
      checkHeader++;
			dataListStudent.push(tmpStudent);
    };
    return res.ok({ dataListStudent: dataListStudent });

    
  },
  
};