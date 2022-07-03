const moment = require('moment');
module.exports = {

	friendlyName: 'Attendance Report',
	description: 'Attendance Report',
	inputs: {},
	exits: {
		success: {
			viewTemplatePath: 'backend/pages/report/attendance',
		},
		redirect: {
			responseType: 'redirect'
		}
	},

	fn: async function (inputs, exits) {
		if (!this.req.me) {
			throw { redirect: '/backend' };
		}
		if (!this.req.me.isMainSchoolAdmin && (!this.req.me.role || !this.req.me.role.permissions || !this.req.me.role.permissions.student || !this.req.me.role.permissions.student.view)) {
			throw { redirect: '/backend/dashboard' };
		}

		let _default = await sails.helpers.getDefaultData(this.req);
		let params = this.req.allParams();
		let dateEnd = params.dateEnd ? moment(params.dateEnd, "DD/MM/YYYY").format("DD-MM-YYYY") : moment().endOf('month').format("DD-MM-YYYY");
    let date = params.date ? moment(params.date, "DD/MM/YYYY").format("DD-MM-YYYY") : moment().startOf('month').format("DD-MM-YYYY");

    let setting = await Setting.findOne({ key: 'web', school: this.req.me.school });
		let weekend = setting.value && setting.value.weekend ? setting.value.weekend : []; //6,7 is saturday and sunday

    params.limit = 50;
		let page = params.page ? parseInt(params.page) : 1;
		params.skip = (parseInt(page) - 1) * params.limit;


		let dayStart = date;
    let dayEnd = dateEnd;
		_default.date = date;
		_default.dateEnd = dateEnd;

		let schoolId = this.req.me.school;
		let schoolObj = await School.findOne({ id: schoolId });

    // classId = -1 get all class
    let classId = params.classId ? params.classId : '-1';
    
    if (classId != '-1') {
      let classObj = await Class.findOne({ id: classId });
      if (!classObj) {
        throw { redirect: '/backend/report/student-attendance' };
      }
    }
    // brachId = -1 get all branch
    let branchId = this.req.session.branchId ? this.req.session.branchId : '-1';
    if (classId != '-1') {
      let branchObj = await Branch.findOne({ id: branchId });
      if (!branchObj) {
        throw { redirect: '/backend/report/student-attendance' };
      }
    }
		

		var dataListStudent = [];		

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
		let studentIds = [];
    if (classId != '-1') {
      let classObj = await Class.findOne({ id: classId, school: schoolId }).populate('students');
      studentIds = classObj.students.map((std) => {
        return new mongo.ObjectID(std.id);
      })
    } else if (branchId != '-1') {
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
      { school: new mongo.ObjectID(this.req.me.school) }
    ];
    //where.$and.push({ status: 1 });
    //{ $or: [ { quantity: { $lt: 20 } }, { price: 10 } ] }
    where.$and.push({ $or: [{ status: 1 }, { status: 2 } ] });
		
		/**SEARCH CASE_INSENSITIVE */
    const collection = Student.getDatastore().manager.collection(Student.tableName);
    let result = [];
    if (params.limit) {
      result = await collection.find(where).limit(params.limit).skip(params.skip).sort(newSort);
    } else {
      result = await collection.find(where).sort(newSort);
    }
    const totalStudent = await collection.count(where);
    const dataWithObjectIds = await result.toArray();
		const arrStudent = JSON.parse(JSON.stringify(dataWithObjectIds).replace(/"_id"/g, '"id"'));
		
		for (let studentObj of arrStudent) {
      let student = await StudentService.get({ id: studentObj.id });

      let tmpStudent = [];
			
			tmpStudent.push(student.code);
			// AVATAR & FULLNAME
      let path = "/images/avatar2.png";
      if (student.gender == 0) path = "/images/female-kid.png";
			if (student.gender == 1) path = "/images/male-kid.png";
			
      tmpStudent.push(path);
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

          let checkWeekend = moment(checkday, "YYYY-MM-DD").isoWeekday() + '';
          // CHECK WEEKEND OF SCHOOL
          if (weekend.includes(checkWeekend)) { 
						tmpStudent.push('OFF');
          } else {
            allDayOfMonth++;
            if (arrAttendentDate.includes(checkday)) {
              allDayAtClass++;
							tmpStudent.push('1');
            } else {
							tmpStudent.push('-');
            }
          }
          i++;
        }
        
        diffTime = parseInt((day2 - firstday) / (1000 * 60 * 60 * 24), 10);
        i=0;
        while(i <= diffTime){
          i++; 
          let checkday = dayEnd.split("-")[2] + '-' + dayEnd.split("-")[1];
          if (i < 10) checkday += '-0' + i;
          else checkday += '-' + i;
          let checkWeekend = moment(checkday, "YYYY-MM-DD").isoWeekday() + '';
          // CHECK WEEKEND OF SCHOOL
          if (weekend.includes(checkWeekend)) { 
						tmpStudent.push('OFF');
          } else {
            allDayOfMonth++;
            if (arrAttendentDate.includes(checkday)) {
              allDayAtClass++;
							tmpStudent.push('1');
            } else {
							tmpStudent.push('-');
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
          // CHECK WEEKEND OF SCHOOL
          if (weekend.includes(checkWeekend)) { 
						tmpStudent.push('OFF');
          } else {
            allDayOfMonth++;
            if (arrAttendentDate.includes(checkday)) {
              allDayAtClass++;
							tmpStudent.push('1');
            } else {
							tmpStudent.push('-');
            }
          }
          i++;
        }
      }

			tmpStudent.push(allDayAtClass);
			dataListStudent.push(tmpStudent);
		};

		_default.dataListStudent = dataListStudent;
		var pagination = require('pagination');
		var paginator = pagination.create('search', {prelink:`/backend/report/student-attendance/filter?date=` + dayStart + `&dateEnd=` + dayEnd + `&branchId=` + branchId + `&classId=`+ classId, current: page, rowsPerPage: params.limit, totalResult: totalStudent});

		_default.paginator = paginator;

		return exits.success(_default);
	}
};
