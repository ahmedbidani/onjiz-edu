const makeDir = require('make-dir');
const fs = require('fs');
const moment = require('moment');
const ErrorMessages = require('../../../../config/errors');
module.exports = {

  importStudentExcel: async (req, res) => {
    sails.log.info("================================ ImportController.Import => START ================================");
    // GET ALL PARAMS
    let params = req.allParams();
    let year = moment().format('YYYY');
    let month = moment().format('MM');
    let currentPath = 'assets/excel/' + year + '/' + month;
    let originFolder = '';
    const excelToJson = require('convert-excel-to-json');

    if (fs.existsSync(currentPath)) {
      originFolder = require('path').resolve(sails.config.appPath, currentPath)
    } else {
      currentPath = await makeDir(currentPath);
      originFolder = currentPath;
    }

    req.file('file').upload({
      dirname: originFolder
    }, async (err, file) => {
      if (err) {
        return res.badRequest(err);
      } else {
        if (file.length == 0) {
          return res.badRequest({ code: 'STUDENT_ERROR_IMPORT', message: "File could not upload. Please try again" });
        }
        console.log(file[0].fd);
        const result = excelToJson({
          sourceFile: file[0].fd
        });

        var obj = Object.values(result);
        //arr of line which have error
        let arrErrorLine = [];
        for (let i = 1; i < obj[0].length; i++) {
          let tab = obj[0][i];

          //CHECK LINE DATA IS VALID
          if ((!tab.A) || (!tab.B) || (!tab.C) || (!tab.D) || !moment(tab.D, 'YYYY-MM-DD', true).isValid() || (!tab.E) || (tab.G && !parseFloat(tab.G) == true) || (tab.H && !parseFloat(tab.H) == true) || (tab.L && !parseInt(tab.L) == true) || !parseInt(tab.O) == true || ![0, 1].includes(parseInt(tab.O))) {
            //return res.badRequest(ErrorMessages.STUDENT_ERROR_IMPORT);
            arrErrorLine.push(i + 1);
          } else {
            let tmpObj = {};
            let _gender;
            if (tab.E == 'O') {
              _gender = 0;
            } else {
              _gender = 1;
            }
            let code = '';
            code = tab.C,
              tmpObj = {
                code: code, // REQUIRED
                firstName: tab.A,// REQUIRED
                lastName: tab.B,// REQUIRED
                dateOfBirth: tab.D, // REQUIRED
                gender: _gender, // REQUIRED
                currentAddress: tab.F,
                height: tab.G ? parseInt(tab.G) : 0,
                weight: tab.H ? parseInt(tab.H) : 0,
                bloodGroup: tab.I,
                allergy: tab.J,
                heartRate: tab.K ? tab.K : '',
                eyes: tab.L ? parseInt(tab.L) : 0,
                ears: tab.M ? parseInt(tab.M) : 0,
                notes: tab.N,
                status: tab.O,
                school: req.me.school
              }
            //CHECK STUDENT WITH CODE IS EXISTED?
            let student = await StudentService.get({ code: code, school: req.me.school });
            // IF STUDENT IS EXISTED? => UPDATE INFO STUDENT
            if (student) {
              await StudentService.edit({ id: student.id }, tmpObj);

              //CHECK RELATION IS EXIST?
              let student_class = await Student_Class.findOne({ student: student.id, classObj: params.classObj });
              // ADD RELATION IF NOT EXIST
              if (!student_class) await Student.addToCollection(student.id, 'classes').members([params.classObj]);
            } else {
              // ADD NEW DATA STUDENT
              let studentObj = await StudentService.add(tmpObj);

              //ADD RELATION WITH CLASS
              await Student.addToCollection(studentObj.id, 'classes').members([params.classObj]);
              let dateToday = moment().format("YYYY-MM-DD");
              let todayAttendent = await Attendent.find({ where: { date: dateToday, classObj: params.classObj, school: req.me.school } });
              let checkExsits = await Attendent.find({ date: dateToday, classObj: params.classObj, school: req.me.school, student: studentObj.id });
              if (todayAttendent.length && !checkExsits.length) {
                let attendentRecord = {
                  student: newStudent.id,
                  date: dateToday,
                  classObj: todayAttendent[0].classObj,
                  school: req.me.school
                };
                await AttendentService.add(attendentRecord);
              }

            }
          }
        }
        //IF errors -> DO NOTHING
        if (arrErrorLine.length) {
          let STUDENT_ERROR_IMPORT = { code: 'STUDENT_ERROR_IMPORT', message: "Cannot import data at line: " + arrErrorLine.join(', ') };
          return res.badRequest(STUDENT_ERROR_IMPORT);
        }
        //End if ERRORS
        //UPDATE TOTAL STUDENT FOR CLASS OBJ
        //count Class in table relation Student - Class
        let totalCount = await Student_Class.count({ classObj: params.classObj });
        //Update TOTAL STUDENT
        await Class.update({ id: params.classObj }).set({ totalStudent: totalCount });

        return res.ok({
          status: 200
        })
      }
    });
  },
  importFoodExcel: async (req, res) => {
    sails.log.info("================================ ImportController.Import => START ================================");
    let year = moment().format('YYYY');
    let month = moment().format('MM');
    let currentPath = 'assets/excel/' + year + '/' + month;
    let originFolder = '';

    if (fs.existsSync(currentPath)) {
      originFolder = require('path').resolve(sails.config.appPath, currentPath)
    } else {
      currentPath = await makeDir(currentPath);
      originFolder = currentPath;
    }
    const excelToJson = require('convert-excel-to-json');

    req.file('file').upload({
      dirname: originFolder
    }, async (err, file) => {
      if (err) {
        return res.badRequest(err);
      } else {
        if (file.length == 0) {
          return res.badRequest({ code: 'FOOD_ERROR_IMPORT', message: "File could not upload. Please try again" });
        }
        console.log(file[0].fd);
        const result = excelToJson({
          sourceFile: file[0].fd
        });
        var obj = Object.values(result);

        //arr of line which have error data
        let arrErrorLine = []
        for (let i = 1; i < obj[0].length; i++) {
          let tab = obj[0][i];

          //CHECK LINE DATA IS VALID
          if ((!tab.A) || (!tab.B) || (!tab.C) || (!tab.D) || ![0, 1].includes(parseInt(tab.E)) || (!tab.F)) {
            //return res.badRequest(ErrorMessages.STUDENT_ERROR_IMPORT);
            arrErrorLine.push(i + 1);
          } else {
            let tmpObj = {};

            let code = '';
            code = tab.B,
              tmpObj = {
                title: tab.A,// REQUIRED
                code: code, // REQUIRED
                description: tab.C,// REQUIRED
                nutrition: tab.D, // REQUIRED
                status: tab.E, // REQUIRED
                thumbnail: tab.F,
                school: req.me.school
              }
            //CHECK FOOD WITH CODE IS EXISTED?
            let food = await FoodService.get({ code: code, school: req.me.school });
            // IF STUDENT IS EXISTED? => UPDATE INFO FOOD
            if (food) {
              await FoodService.edit({ code: food.code }, tmpObj);

            } else {
              // ADD NEW DATA FOOD
              await FoodService.add(tmpObj);
            }
          }
        }

        if (arrErrorLine.length) {
          let FOOD_ERROR_IMPORT = { code: 'FOOD_ERROR_IMPORT', message: "Cannot import data at line: " + arrErrorLine.join(', ') };
          return res.badRequest(FOOD_ERROR_IMPORT);
        }

        return res.ok({
          status: 200
        })
      }
    });
  },
  importSubjectExcel: async (req, res) => {
    sails.log.info("================================ ImportController.Import => START ================================");
    let year = moment().format('YYYY');
    let month = moment().format('MM');
    let currentPath = 'assets/excel/' + year + '/' + month;
    let originFolder = '';

    if (fs.existsSync(currentPath)) {
      originFolder = require('path').resolve(sails.config.appPath, currentPath)
    } else {
      currentPath = await makeDir(currentPath);
      originFolder = currentPath;
    }
    const excelToJson = require('convert-excel-to-json');

    req.file('file').upload({
      dirname: originFolder
    }, async (err, file) => {
      if (err) {
        return res.badRequest(err);
      } else {
        if (file.length == 0) {
          return res.badRequest({ code: 'SUBJECT_ERROR_IMPORT', message: "File could not upload. Please try again" });
        }
        console.log(file[0].fd);
        const result = excelToJson({
          sourceFile: file[0].fd
        });
        var obj = Object.values(result);
        //arr of line which have error data
        let arrErrorLine = [];
        for (let i = 1; i < obj[0].length; i++) {
          let tab = obj[0][i];

          //CHECK LINE DATA IS VALID
          if ((!tab.A) || (!tab.B) || (!tab.C) || ![0, 1].includes(parseInt(tab.D))) {
            //return res.badRequest(ErrorMessages.STUDENT_ERROR_IMPORT);
            arrErrorLine.push(i + 1);
          } else {
            let tmpObj = {};
            let code = '';
            code = tab.B,
              tmpObj = {
                title: tab.A,// REQUIRED
                code: code, // REQUIRED
                description: tab.C,// REQUIRED
                status: tab.D, // REQUIRED
                school: req.me.school
              }
            //CHECK SUBJECT WITH CODE IS EXISTED?
            let subject = await SubjectService.get({ code: code, school: req.me.school });
            // IF STUDENT IS EXISTED? => UPDATE INFO SUBJECT
            if (subject) {
              await SubjectService.edit({ code: subject.code }, tmpObj);

            } else {
              // ADD NEW DATA SUBJECT
              await SubjectService.add(tmpObj);
            }
          }
        }

        if (arrErrorLine.length) {
          let SUBJECT_ERROR_IMPORT = { code: 'SUBJECT_ERROR_IMPORT', message: "Cannot import data at line: " + arrErrorLine.join(', ') };
          return res.badRequest(SUBJECT_ERROR_IMPORT);
        }

        return res.ok({
          status: 200
        })
      }
    });
  },

  // importScheduleExcel: async (req, res) => {
  //   sails.log.info("================================ ImportController.Import => START ================================");
  //   let year = moment().format('YYYY');
  //   let month = moment().format('MM');
  //   let currentPath = 'assets/excel/' + year + '/' + month;
  //   let originFolder = '';

  //   if (fs.existsSync(currentPath)) {
  //     originFolder = require('path').resolve(sails.config.appPath, currentPath)
  //   } else {
  //     currentPath = await makeDir(currentPath);
  //     originFolder = currentPath;
  //   }
  //   const excelToJson = require('convert-excel-to-json');

  //   req.file('file').upload({
  //     dirname: originFolder
  //   }, async (err, file) => {
  //     if (err) {
  //       return res.badRequest(err);
  //     } else {
  //       console.log(file[0].fd);
  //       function removeAttribute(subject) {
  //         delete subject.createdAt;
  //         delete subject.updatedAt;
  //         delete subject.status;
  //         delete subject.school;
  //       }
  //       const result = excelToJson({
  //         sourceFile: file[0].fd,
  //         includeEmptyLines: true
  //       });


  //       var obj = Object.values(result);

  //       //arr of line which have error data
  //       if (!obj[0][2].C) {
  //         let SCHEDULE_ERROR_IMPORT = { code: 'SCHEDULE_ERROR_IMPORT', message: "Cannot import data: empty class code" };
  //         return res.badRequest(SCHEDULE_ERROR_IMPORT);
  //       }
  //       var listClasses = obj[0][2].C.split(";");
  //       for (let j in listClasses) {
  //         classObj = await Class.findOne({ code: listClasses[j], school: req.me.school });
  //         if (!classObj) {
  //           let SCHEDULE_ERROR_IMPORT = { code: 'SCHEDULE_ERROR_IMPORT', message: "Cannot import data: error class code" };
  //           return res.badRequest(SCHEDULE_ERROR_IMPORT);
  //         }
  //       }
  //       function DMYToMDY(date) {
  //         let arrDate = date.split("-");
  //         let newFormatDate = arrDate[1] + '-' + arrDate[0] + '-' + arrDate[2];
  //         return newFormatDate;
  //       }
  //       checkDate2 = DMYToMDY(obj[0][4].C);
  //       checkDate3 = DMYToMDY(obj[0][4].D);
  //       checkDate4 = DMYToMDY(obj[0][4].E);
  //       checkDate5 = DMYToMDY(obj[0][4].F);
  //       checkDate6 = DMYToMDY(obj[0][4].G);
  //       checkDate7 = DMYToMDY(obj[0][4].H);

  //       if (!Date.parse(checkDate2) || !Date.parse(checkDate3) || !Date.parse(checkDate4) || !Date.parse(checkDate5) || !Date.parse(checkDate6) || !Date.parse(checkDate7)) {
  //         let SCHEDULE_ERROR_IMPORT = { code: 'SCHEDULE_ERROR_IMPORT', message: "Cannot import data: error day of week" };
  //         return res.badRequest(SCHEDULE_ERROR_IMPORT);
  //       }

  //       let arrErrorLine = [];

  //       let obj2 = {};
  //       let obj3 = {};
  //       let obj4 = {};
  //       let obj5 = {};
  //       let obj6 = {};
  //       let obj7 = {};

  //       let lotSub2 = {};
  //       let lotSub3 = {};
  //       let lotSub4 = {};
  //       let lotSub5 = {};
  //       let lotSub6 = {};
  //       let lotSub7 = {};

  //       let arr2sub = [];
  //       let arr3sub = [];
  //       let arr4sub = [];
  //       let arr5sub = [];
  //       let arr6sub = [];
  //       let arr7sub = [];

  //       for (let i = 5; i < obj[0].length; i += 3) {

  //         let tab1 = obj[0][i];
  //         let tab2 = obj[0][i + 1];
  //         let tab3 = obj[0][i + 2];

  //         let hoursTimeStart = tab1.A.getHours() < 10 ? '0' + tab1.A.getHours() : tab1.A.getHours();
  //         let minTimeStart = tab1.A.getMinutes() < 10 ? '0' + tab1.A.getMinutes() : tab1.A.getMinutes();

  //         let hoursTimeEnd = tab1.B.getHours() < 10 ? '0' + tab1.B.getHours() : tab1.B.getHours();
  //         let minTimeEnd = tab1.B.getMinutes() < 10 ? '0' + tab1.B.getMinutes() : tab1.B.getMinutes();

  //         let timeStart = hoursTimeStart + ':' + minTimeStart;
  //         let timeEnd = hoursTimeEnd + ':' + minTimeEnd;


  //         // Monday
  //         if (tab2.C != '') {
  //           let sub2 = await Subject.findOne({ code: tab2.C, school: req.me.school });
  //           // CHECK EXIST SUBJECT
  //           if (!sub2) {
  //             const newData = {
  //               title: tab1.C,
  //               code: tab2.C,
  //               description: '',
  //               status: sails.config.custom.STATUS.ACTIVE,
  //               school: req.me.school
  //             };

  //             // ADD NEW DATA SUBJECT
  //             await SubjectService.add(newData);
  //             sub2 = await Subject.findOne({ code: tab2.C, school: req.me.school });
  //           }
  //           removeAttribute(sub2);

  //           lotSub2.timeStart = timeStart;
  //           lotSub2.timeEnd = timeEnd;
  //           lotSub2.subject = sub2;
  //           if (!tab3) lotSub2.topic = "";
  //           else lotSub2.topic = tab3.C ? tab3.C : "";

  //           arr2sub.push(lotSub2);
  //           lotSub2 = {};
  //         }
  //         if (tab2.D != '') {
  //           // tuesday
  //           let sub3 = await Subject.findOne({ code: tab2.D, school: req.me.school });
  //           // CHECK EXIST SUBJECT
  //           if (!sub3) {
  //             const newData = {
  //               title: tab1.D,
  //               code: tab2.D,
  //               description: '',
  //               status: sails.config.custom.STATUS.ACTIVE,
  //               school: req.me.school
  //             };

  //             // ADD NEW DATA SUBJECT
  //             await SubjectService.add(newData);
  //             sub3 = await Subject.findOne({ code: tab2.D, school: req.me.school });
  //           }
  //           removeAttribute(sub3);

  //           lotSub3.timeStart = timeStart;
  //           lotSub3.timeEnd = timeEnd;
  //           lotSub3.subject = sub3;
  //           if (!tab3) lotSub3.topic = "";
  //           else lotSub3.topic = tab3.D ? tab3.D : "";

  //           arr3sub.push(lotSub3);
  //           lotSub3 = {};
  //         }
  //         if (tab2.E != '') {
  //           //Wednesday
  //           let sub4 = await Subject.findOne({ code: tab2.E, school: req.me.school });
  //           // CHECK EXIST SUBJECT
  //           if (!sub4) {
  //             const newData = {
  //               title: tab1.E,
  //               code: tab2.E,
  //               description: '',
  //               status: sails.config.custom.STATUS.ACTIVE,
  //               school: req.me.school
  //             };

  //             // ADD NEW DATA SUBJECT
  //             await SubjectService.add(newData);
  //             sub4 = await Subject.findOne({ code: tab2.E, school: req.me.school });
  //           }
  //           removeAttribute(sub4);

  //           lotSub4.timeStart = timeStart;
  //           lotSub4.timeEnd = timeEnd;
  //           lotSub4.subject = sub4;
  //           if (!tab3) lotSub4.topic = "";
  //           else lotSub4.topic = tab3.E ? tab3.E : "";

  //           arr4sub.push(lotSub4);
  //           lotSub4 = {};
  //         }
  //         if (tab2.F != '') {
  //           //Thursday
  //           let sub5 = await Subject.findOne({ code: tab2.F, school: req.me.school });
  //           // CHECK EXIST SUBJECT
  //           if (!sub5) {
  //             const newData = {
  //               title: tab1.F,
  //               code: tab2.F,
  //               description: '',
  //               status: sails.config.custom.STATUS.ACTIVE,
  //               school: req.me.school
  //             };

  //             // ADD NEW DATA SUBJECT
  //             await SubjectService.add(newData);
  //             sub5 = await Subject.findOne({ code: tab2.F, school: req.me.school });
  //           }
  //           removeAttribute(sub5);

  //           lotSub5.timeStart = timeStart;
  //           lotSub5.timeEnd = timeEnd;
  //           lotSub5.subject = sub5;
  //           if (!tab3) lotSub5.topic = "";
  //           else lotSub5.topic = tab3.F ? tab3.F : "";

  //           arr5sub.push(lotSub5);
  //           lotSub5 = {};
  //         }
  //         if (tab2.G) {
  //           //Friday
  //           let sub6 = await Subject.findOne({ code: tab2.G, school: req.me.school });
  //           // CHECK EXIST SUBJECT
  //           if (!sub6) {
  //             const newData = {
  //               title: tab1.G,
  //               code: tab2.G,
  //               description: '',
  //               status: sails.config.custom.STATUS.ACTIVE,
  //               school: req.me.school
  //             };

  //             // ADD NEW DATA SUBJECT
  //             await SubjectService.add(newData);
  //             sub6 = await Subject.findOne({ code: tab2.G, school: req.me.school });
  //           }
  //           removeAttribute(sub6);

  //           lotSub6.timeStart = timeStart;
  //           lotSub6.timeEnd = timeEnd;
  //           lotSub6.subject = sub6;
  //           if (!tab3) lotSub6.topic = "";
  //           else lotSub6.topic = tab3.G ? tab3.G : "";

  //           arr6sub.push(lotSub6);
  //           lotSub6 = {};
  //         }
  //         if (tab2.H != '') {
  //           // Saturday
  //           let sub7 = await Subject.findOne({ code: tab2.H, school: req.me.school });
  //           // CHECK EXIST SUBJECT
  //           if (!sub7) {
  //             const newData = {
  //               title: tab1.H,
  //               code: tab2.H,
  //               description: '',
  //               status: sails.config.custom.STATUS.ACTIVE,
  //               school: req.me.school
  //             };

  //             // ADD NEW DATA SUBJECT
  //             await SubjectService.add(newData);
  //             sub7 = await Subject.findOne({ code: tab2.H, school: req.me.school });
  //           }

  //           removeAttribute(sub7);

  //           lotSub7.timeStart = timeStart;
  //           lotSub7.timeEnd = timeEnd;
  //           lotSub7.subject = sub7;
  //           if (!tab3) lotSub7.topic = "";
  //           else lotSub7.topic = tab3.H ? tab3.H : "";

  //           arr7sub.push(lotSub7);
  //           lotSub7 = {};
  //         }

  //       }

  //       for (let j in listClasses) {
  //         classObj = await Class.findOne({ code: listClasses[j], school: req.me.school });

  //         // Monday
  //         dataUse2 = moment(obj[0][4].C, "DD/MM/YYYY").format("YYYY-MM-DD");
  //         // check exist date at schedule
  //         let checkDay2Schedule = await Schedule.findOne({ class: classObj.id, dateUse: dataUse2, school: req.me.school });
  //         //else dataUse2.reverse();

  //         obj2 = {
  //           slotSubjects: arr2sub,
  //           status: 1,
  //           dateUse: dataUse2,
  //           class: classObj.id,
  //           school: req.me.school
  //         }
  //         if (checkDay2Schedule) await ScheduleService.edit({ id: checkDay2Schedule.id }, obj2);
  //         else await ScheduleService.add(obj2);
  //         // Tuesday
  //         dataUse3 = moment(obj[0][4].D, "DD/MM/YYYY").format("YYYY-MM-DD");

  //         // check exist date at schedule
  //         checkDay3Schedule = await Schedule.findOne({ class: classObj.id, dateUse: dataUse3, school: req.me.school });

  //         obj3 = {
  //           slotSubjects: arr3sub,
  //           status: 1,
  //           dateUse: dataUse3,
  //           class: classObj.id,
  //           school: req.me.school
  //         }
  //         if (checkDay3Schedule) await ScheduleService.edit({ id: checkDay3Schedule.id }, obj3);
  //         else await ScheduleService.add(obj3);
  //         // wednesday
  //         dataUse4 = moment(obj[0][4].E, "DD/MM/YYYY").format("YYYY-MM-DD");

  //         // check exist date at schedule
  //         checkDay4Schedule = await Schedule.findOne({ class: classObj.id, dateUse: dataUse4, school: req.me.school });

  //         obj4 = {
  //           slotSubjects: arr4sub,
  //           status: 1,
  //           dateUse: dataUse4,
  //           class: classObj.id,
  //           school: req.me.school
  //         }
  //         if (checkDay4Schedule) await ScheduleService.edit({ id: checkDay4Schedule.id }, obj4);
  //         else await ScheduleService.add(obj4);
  //         // thursday
  //         dataUse5 = moment(obj[0][4].F, "DD/MM/YYYY").format("YYYY-MM-DD");
  //         // check exist date at schedule
  //         checkDay5Schedule = await Schedule.findOne({ class: classObj.id, dateUse: dataUse5, school: req.me.school });

  //         obj5 = {
  //           slotSubjects: arr5sub,
  //           status: 1,
  //           dateUse: dataUse5,
  //           class: classObj.id,
  //           school: req.me.school
  //         }
  //         if (checkDay5Schedule) await ScheduleService.edit({ id: checkDay5Schedule.id }, obj5);
  //         else await ScheduleService.add(obj5);
  //         // Friday
  //         dataUse6 = moment(obj[0][4].G, "DD/MM/YYYY").format("YYYY-MM-DD");
  //         // check exist date at schedule
  //         checkDay6Schedule = await Schedule.findOne({ class: classObj.id, dateUse: dataUse6, school: req.me.school });

  //         obj6 = {
  //           slotSubjects: arr6sub,
  //           status: 1,
  //           dateUse: dataUse6,
  //           class: classObj.id,
  //           school: req.me.school
  //         }
  //         if (checkDay6Schedule) await ScheduleService.edit({ id: checkDay6Schedule.id }, obj6);
  //         else await ScheduleService.add(obj6);
  //         // Saturday
  //         dataUse7 = moment(obj[0][4].H, "DD/MM/YYYY").format("YYYY-MM-DD");
  //         // check exist date at schedule
  //         checkDay7Schedule = await Schedule.findOne({ class: classObj.id, dateUse: dataUse7, school: req.me.school });

  //         obj7 = {
  //           slotSubjects: arr7sub,
  //           status: 1,
  //           dateUse: dataUse7,
  //           class: classObj.id,
  //           school: req.me.school
  //         }
  //         if (checkDay7Schedule) await ScheduleService.edit({ id: checkDay7Schedule.id }, obj7);
  //         else await ScheduleService.add(obj7);
  //       }

  //       return res.ok({
  //         status: 200,
  //       })
  //     }
  //   });
  // },

  importScheduleExcel: async (req, res) => {
    sails.log.info("================================ ImportController.Import => START ================================");
    let year = moment().format('YYYY');
    let month = moment().format('MM');
    let currentPath = 'assets/excel/' + year + '/' + month;
    let originFolder = '';

    if (fs.existsSync(currentPath)) {
      originFolder = require('path').resolve(sails.config.appPath, currentPath)
    } else {
      currentPath = await makeDir(currentPath);
      originFolder = currentPath;
    }

    const excelToJson = require('convert-excel-to-json');

    req.file('file').upload({
      dirname: originFolder
    }, async (err, file) => {
      if (err) {
        return res.badRequest(err);
      } else {
        function removeAttribute(subject) {
          delete subject.createdAt;
          delete subject.updatedAt;
          delete subject.status;
          delete subject.school;
        }
        const result = excelToJson({
          sourceFile: file[0].fd,
          includeEmptyLines: true
        });

        var obj = Object.values(result);

        //arr of line which have error data
        if (!obj[0][2].C) {
          let SCHEDULE_ERROR_IMPORT = { code: 'SCHEDULE_ERROR_IMPORT', message: "Cannot import data: empty class code" };
          return res.badRequest(SCHEDULE_ERROR_IMPORT);
        }
        var listClasses = obj[0][2].C.split(";");
        for (let j in listClasses) {
          classObj = await Class.findOne({ code: listClasses[j], school: req.me.school });
          if (!classObj) {
            let SCHEDULE_ERROR_IMPORT = { code: 'SCHEDULE_ERROR_IMPORT', message: "Cannot import data: error class code" };
            return res.badRequest(SCHEDULE_ERROR_IMPORT);
          }
        }
        function DMYToMDY(date) {
          let arrDate = date.toString().split("-");
          let newFormatDate = arrDate[1] + '-' + arrDate[2] + '-' + arrDate[0];
          return newFormatDate;
        }

        let setting = await Setting.findOne({ key: 'web', school: req.me.school });
        let existOffWeekend = setting.value.weekend;

        //Check exist off weekend Saturday
        function _isContains(json, value) {
          let contains = false;
          Object.keys(json).some(key => {
            contains = typeof json[key] === 'object' ? _isContains(json[key], value) : json[key] === value;
            return contains;
          });
          return contains;
        }
        let existOffSaturday = _isContains(existOffWeekend, "6")

        //Import menu for case school off weekend Saturday & Sunday
        if (existOffSaturday == false) {
          let arrDateExcel = ['C', 'D', 'E', 'F', 'G', 'H'];
          for (let day of arrDateExcel) {
            checkDate = DMYToMDY(obj[0][4][day]);
          }

          if (!Date.parse(checkDate)) {
            let SCHEDULE_ERROR_IMPORT = { code: 'SCHEDULE_ERROR_IMPORT', message: "Cannot import: date format is not valid [YYYY-MM-DD]." };
            return res.badRequest(SCHEDULE_ERROR_IMPORT);
          }
          //End check

          let objSchedule = {};
          let lotSub = {};

          for (let cls of listClasses) {
            // let clsObj = await Class.findOne({ code: cls, school: req.me.school });
            let clsObj = await Class.findOne({ code: cls, school: req.me.school });
            if (clsObj) {
              //From Column C-H: MonDay-Sarturday
              let arrDateExcel = ['C', 'D', 'E', 'F', 'G', 'H'];
              for (let day of arrDateExcel) {
                let arrSub = [];
                for (let i = 5; i < obj[0].length; i += 3) {
                  //Column A: time = 3 rows mege with other column (from 5 loop above)
                  let row0 = obj[0][i];
                  let hoursTimeStart = row0.A.getHours() < 10 ? '0' + row0.A.getHours() : row0.A.getHours();
                  let minTimeStart = row0.A.getMinutes() < 10 ? '0' + row0.A.getMinutes() : row0.A.getMinutes();

                  let hoursTimeEnd = row0.B.getHours() < 10 ? '0' + row0.B.getHours() : row0.B.getHours();
                  let minTimeEnd = row0.B.getMinutes() < 10 ? '0' + row0.B.getMinutes() : row0.B.getMinutes();

                  let timeStart = hoursTimeStart + ':' + minTimeStart;
                  let timeEnd = hoursTimeEnd + ':' + minTimeEnd;

                  let rowDataTitle = obj[0][i];
                  let rowDataCode = obj[0][i + 1];
                  let rowDataTopic = obj[0][i + 2];
                  if (rowDataCode && rowDataCode[day] != '' && rowDataTitle && rowDataTitle != '') {
                    let sub = await Subject.findOne({ code: rowDataCode[day], school: req.me.school });
                    if (!sub) {
                      //If have no subject -> add
                      const newData = {
                        title: rowDataTitle[day],
                        code: rowDataCode[day],
                        description: '',
                        status: sails.config.custom.STATUS.ACTIVE,
                        school: req.me.school
                      };

                      //ADD NEW DATA SUBJECT
                      await SubjectService.add(newData);
                      sub = await Subject.findOne({ code: rowDataCode[day], school: req.me.school });
                    }
                    removeAttribute(sub);

                    lotSub.timeStart = timeStart;
                    lotSub.timeEnd = timeEnd;
                    lotSub.subject = sub;
                    if (!rowDataTopic) lotSub.topic = "";
                    else lotSub.topic = rowDataTopic[day] ? rowDataTopic[day] : "";

                    arrSub.push(lotSub);
                    lotSub = {};
                  }
                }
                //Process data after DONE set SlotScheduling
                //Add Schedule for one day, if Menu is existed => update Schedule
                let _tmpDateUse = moment(obj[0][4][day], "YYYY/MM/DD").format("YYYY-MM-DD"); //[day] mean column C, D, E, F, G, H from Monday - Saturday

                let schedule = await Schedule.findOne({
                  class: clsObj.id,
                  dateUse: _tmpDateUse,
                  school: req.me.school
                });
                objSchedule = {
                  slotSubjects: arrSub,
                  dateUse: _tmpDateUse,
                  status: 1,
                  class: clsObj.id,
                  school: req.me.school
                };
                if (schedule) { //if Schedule is existed -> Update Schedule
                  await ScheduleService.edit({ id: schedule.id }, objSchedule);
                } else {
                  await ScheduleService.add(objSchedule);
                }
              }
            }
          }
        }
        //Import menu for case school off weekend Sunday
        else if (existOffSaturday == true) {
          let arrDateExcel = ['C', 'D', 'E', 'F', 'G'];
          for (let day of arrDateExcel) {
            checkDate = DMYToMDY(obj[0][4][day]);
          }

          if (!Date.parse(checkDate)) {
            let SCHEDULE_ERROR_IMPORT = { code: 'SCHEDULE_ERROR_IMPORT', message: "Cannot import: date format is not valid [YYYY-MM-DD]." };
            return res.badRequest(SCHEDULE_ERROR_IMPORT);
          }
          //End check

          let objSchedule = {};
          let lotSub = {};

          for (let cls of listClasses) {
            // let clsObj = await Class.findOne({ code: cls, school: req.me.school });
            let clsObj = await Class.findOne({ code: cls, school: req.me.school });
            if (clsObj) {
              //From Column C-H: MonDay-Sarturday
              let arrDateExcel = ['C', 'D', 'E', 'F', 'G'];
              for (let day of arrDateExcel) {
                let arrSub = [];
                
                for (let i = 5; i < obj[0].length; i += 3) {
                  //Column A: time = 3 rows mege with other column (from 5 loop above)
                  let row0 = obj[0][i];

                  console.log('obj', row0);
                  
                  let hoursTimeStart = row0.A.getHours() < 10 ? '0' + row0.A.getHours() : row0.A.getHours();
                  let minTimeStart = row0.A.getMinutes() < 10 ? '0' + row0.A.getMinutes() : row0.A.getMinutes();

                  

                  let hoursTimeEnd = row0.B.getHours() < 10 ? '0' + row0.B.getHours() : row0.B.getHours();
                  let minTimeEnd = row0.B.getMinutes() < 10 ? '0' + row0.B.getMinutes() : row0.B.getMinutes();

                  let timeStart = hoursTimeStart + ':' + minTimeStart;
                  let timeEnd = hoursTimeEnd + ':' + minTimeEnd;

                  let rowDataTitle = obj[0][i];
                  let rowDataCode = obj[0][i + 1];
                  let rowDataTopic = obj[0][i + 2];
                  if (rowDataCode && rowDataCode[day] != '' && rowDataTitle && rowDataTitle != '') {
                    let sub = await Subject.findOne({ code: rowDataCode[day], school: req.me.school });
                    if (!sub) {
                      //If have no subject -> add
                      const newData = {
                        title: rowDataTitle[day],
                        code: rowDataCode[day],
                        description: '',
                        status: sails.config.custom.STATUS.ACTIVE,
                        school: req.me.school
                      };

                      //ADD NEW DATA SUBJECT
                      await SubjectService.add(newData);
                      sub = await Subject.findOne({ code: rowDataCode[day], school: req.me.school });
                    }
                    removeAttribute(sub);

                    lotSub.timeStart = timeStart;
                    lotSub.timeEnd = timeEnd;
                    lotSub.subject = sub;
                    if (!rowDataTopic) lotSub.topic = "";
                    else lotSub.topic = rowDataTopic[day] ? rowDataTopic[day] : "";

                    arrSub.push(lotSub);
                    lotSub = {};
                  }
                }
                //Process data after DONE set SlotScheduling
                //Add Schedule for one day, if Menu is existed => update Schedule
                let _tmpDateUse = moment(obj[0][4][day], "YYYY/MM/DD").format("YYYY-MM-DD"); //[day] mean column C, D, E, F, G, H from Monday - Saturday

                let schedule = await Schedule.findOne({
                  class: clsObj.id,
                  dateUse: _tmpDateUse,
                  school: req.me.school
                });
                objSchedule = {
                  slotSubjects: arrSub,
                  dateUse: _tmpDateUse,
                  status: 1,
                  class: clsObj.id,
                  school: req.me.school
                };
                if (schedule) { //if Schedule is existed -> Update Schedule
                  await ScheduleService.edit({ id: schedule.id }, objSchedule);
                } else {
                  await ScheduleService.add(objSchedule);
                }
              }
            }
          }
        }
      }
      return res.ok({ status: true });
    });
  },

  importMenuExcel: async (req, res) => {
    sails.log.info("================================ ImportController.Menu => START ================================");
    let year = moment().format('YYYY');
    let month = moment().format('MM');
    let currentPath = 'assets/excel/' + year + '/' + month;
    let originFolder = '';

    if (fs.existsSync(currentPath)) {
      originFolder = require('path').resolve(sails.config.appPath, currentPath)
    } else {
      currentPath = await makeDir(currentPath);
      originFolder = currentPath;
    }
    const excelToJson = require('convert-excel-to-json');

    req.file('file').upload({
      dirname: originFolder
    }, async (err, file) => {
      if (err) {
        return res.badRequest(err);
      } else {
        console.log(file[0].fd);
        function removeAttribute(subject) {
          delete subject.createdAt;
          delete subject.updatedAt;
          delete subject.status;
          delete subject.school;
        }
        const result = excelToJson({
          sourceFile: file[0].fd,
          includeEmptyLines: true
        });

        const obj = Object.values(result);
        let arrErrorLines = [];
        //arr of line which have error data
        if (!obj[0][2].B) {
          arrErrorLines.push({ code: 'CLASS_CODE_EMPTY', message: sails.__("Cannot import: class code empty.") });
          return res.badRequest(arrErrorLines);
        }
        var listClasses = obj[0][2].B.split(";");
        for (let j in listClasses) {
          let classObj = await Class.findOne({ code: listClasses[j], school: req.me.school });
          if (!classObj) {
            arrErrorLines.push({ code: 'CLASS_CODE_NOT_FOUND', message: sails.__("Cannot import: class code %s is not found.", listClasses[j]) });
          }
        }

        let setting = await Setting.findOne({ key: 'web', school: req.me.school });
        let existOffWeekend = setting.value.weekend;

        //Check exist off weekend Saturday
        function _isContains(json, value) {
          let contains = false;
          Object.keys(json).some(key => {
            contains = typeof json[key] === 'object' ? _isContains(json[key], value) : json[key] === value;
            return contains;
          });
          return contains;
        }
        let existOffSaturday = _isContains(existOffWeekend, "6")

        //Import menu for case school off weekend Saturday & Sunday
        if (existOffSaturday == false) {
          // Check format datatime is valid
          if (!Date.parse(obj[0][4].B) || !Date.parse(obj[0][4].C) || !Date.parse(obj[0][4].D) || !Date.parse(obj[0][4].E) || !Date.parse(obj[0][4].F) || !Date.parse(obj[0][4].G)) {
            arrErrorLines.push({ code: 'FORMAT_DATE_INVALID', message: sails.__("Cannot import: date format is not valid [YYYY-MM-DD].") });
          }
          if (arrErrorLines.length) {
            return res.badRequest(arrErrorLines);
          }
          //End check
          for (let cls of listClasses) {
            let clsObj = await Class.findOne({ code: cls, school: req.me.school });
            if (clsObj) {
              //From COLLUMN B-G: Monday-Saturday
              let arrDateExcel = ['B', 'C', 'D', 'E', 'F', 'G'];
              for (let day of arrDateExcel) {
                let arrSlotFeedings = [];
                for (let i = 5; i < obj[0].length; i += 5) {
                  //Column A: time = 5 rows merge with other columns (from 5 loop above)
                  let row0 = obj[0][i];
                  let hoursTimeStart = row0.A.getHours() < 10 ? '0' + row0.A.getHours() : row0.A.getHours();
                  let minTimeStart = row0.A.getMinutes() < 10 ? '0' + row0.A.getMinutes() : row0.A.getMinutes();
                  let timeStart = hoursTimeStart + ':' + minTimeStart;

                  let slotFeedingItem = {
                    time: timeStart,
                    foods: []
                  }
                  for (let j = 0; j < 5; j++) {
                    let rowData = obj[0][i + j];
                    if (rowData && rowData[day] != '') {
                      let foodArr = await Food.find({ title: rowData[day], school: req.me.school });
                      if (foodArr.length == 0) {
                        //If have no foood -> add
                        const _foodData = {
                          title: rowData[day],
                          description: '',
                          status: sails.config.custom.STATUS.ACTIVE,
                          school: req.me.school
                        };
                        // ADD NEW DATA SUBJECT
                        let foodObj = await FoodService.add(_foodData);
                        slotFeedingItem.foods.push(foodObj.id);
                      } else {
                        let foodObj = foodArr[0];
                        slotFeedingItem.foods.push(foodObj.id);
                      }
                    }
                  }
                  arrSlotFeedings.push(slotFeedingItem);
                }
                //Process data after DONE set SlotFeeding
                //Add Menu for one day, if Menu is existed => update Menu
                let _tmpDateUse = obj[0][4][day]; //[day] mean column B,C,D,E,F,G from Monday - Saturday
                const menu = await Menu.findOne({
                  dateUse: _tmpDateUse,
                  class: clsObj.id
                });
                const menuData = {
                  slotFeedings: arrSlotFeedings,
                  dateUse: _tmpDateUse,
                  status: 1,
                  class: clsObj.id,
                  school: req.me.school
                };
                if (menu) { //if Menu is existed => update Menu
                  await MenuService.edit({ id: menu.id }, menuData);
                } else {
                  await MenuService.add(menuData);
                }
              }
            }
          }
        }
        //Import menu for case school off weekend Sunday
        else if (existOffSaturday == true) {
          // Check format datatime is valid
          if (!Date.parse(obj[0][4].B) || !Date.parse(obj[0][4].C) || !Date.parse(obj[0][4].D) || !Date.parse(obj[0][4].E) || !Date.parse(obj[0][4].F)) {
            arrErrorLines.push({ code: 'FORMAT_DATE_INVALID', message: sails.__("Cannot import: date format is not valid [YYYY-MM-DD].") });
          }
          if (arrErrorLines.length) {
            return res.badRequest(arrErrorLines);
          }
          //End check
          for (let cls of listClasses) {
            let clsObj = await Class.findOne({ code: cls, school: req.me.school });
            if (clsObj) {
              //From COLLUMN B-G: Monday-Saturday
              let arrDateExcel = ['B', 'C', 'D', 'E', 'F'];
              for (let day of arrDateExcel) {
                let arrSlotFeedings = [];
                for (let i = 5; i < obj[0].length; i += 5) {
                  //Column A: time = 5 rows merge with other columns (from 5 loop above)
                  let row0 = obj[0][i];
                  let hoursTimeStart = row0.A.getHours() < 10 ? '0' + row0.A.getHours() : row0.A.getHours();
                  let minTimeStart = row0.A.getMinutes() < 10 ? '0' + row0.A.getMinutes() : row0.A.getMinutes();
                  let timeStart = hoursTimeStart + ':' + minTimeStart;

                  let slotFeedingItem = {
                    time: timeStart,
                    foods: []
                  }
                  for (let j = 0; j < 5; j++) {
                    let rowData = obj[0][i + j];
                    if (rowData && rowData[day] != '') {
                      let foodArr = await Food.find({ title: rowData[day], school: req.me.school });
                      if (foodArr.length == 0) {
                        //If have no foood -> add
                        const _foodData = {
                          title: rowData[day],
                          description: '',
                          status: sails.config.custom.STATUS.ACTIVE,
                          school: req.me.school
                        };
                        // ADD NEW DATA SUBJECT
                        let foodObj = await FoodService.add(_foodData);
                        slotFeedingItem.foods.push(foodObj.id);
                      } else {
                        let foodObj = foodArr[0];
                        slotFeedingItem.foods.push(foodObj.id);
                      }
                    }
                  }
                  arrSlotFeedings.push(slotFeedingItem);
                }
                //Process data after DONE set SlotFeeding
                //Add Menu for one day, if Menu is existed => update Menu
                let _tmpDateUse = obj[0][4][day]; //[day] mean column B,C,D,E,F,G from Monday - Saturday
                const menu = await Menu.findOne({
                  dateUse: _tmpDateUse,
                  class: clsObj.id
                });
                const menuData = {
                  slotFeedings: arrSlotFeedings,
                  dateUse: _tmpDateUse,
                  status: 1,
                  class: clsObj.id,
                  school: req.me.school
                };
                if (menu) { //if Menu is existed => update Menu
                  await MenuService.edit({ id: menu.id }, menuData);
                } else {
                  await MenuService.add(menuData);
                }
              }
            }
          }
        }
      }
      return res.ok({ status: true });
    });
  },

  importParentExcel: async (req, res) => {
    sails.log.info("================================ ParentController.Import => START ================================");
    let year = moment().format('YYYY');
    let month = moment().format('MM');
    let currentPath = 'assets/excel/' + year + '/' + month;
    let originFolder = '';

    if (fs.existsSync(currentPath)) {
      originFolder = require('path').resolve(sails.config.appPath, currentPath)
    } else {
      currentPath = await makeDir(currentPath);
      originFolder = currentPath;
    }
    const excelToJson = require('convert-excel-to-json');

    req.file('file').upload({
      dirname: originFolder
    }, async (err, file) => {
      if (err) {
        return res.badRequest(err);
      } else {
        if (!file.length) {
          return res.badRequest({ code: 'PARENT_ERROR_IMPORT', message: "Error when uploading, pleas try again." });
        }

        console.log(file[0].fd);
        const result = excelToJson({
          sourceFile: file[0].fd
        });

        //function check email format
        const validateEmail = (email) => {
          const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return re.test(String(email).toLowerCase());
        }

        const obj = Object.values(result);
        //arr of line which have error data
        let arrErrorLine = [];
        for (let i = 1; i < obj[0].length; i++) {
          let tab = obj[0][i];

          let code = '';
          code = tab.A;
          //GET STUDENT FOR UPDATE RELATION
          let student = await Student.findOne({ code: code, school: req.me.school });

          if (!student) { //CHECK STUDENT CODE IS VALID?
            sails.log("=============================== Student with code not found: ================================");
            arrErrorLine.push(i + 1);
          } else if ((!tab.B) || (!tab.C) || (!tab.G) || (!tab.K) || !moment(tab.F, 'YYYY-MM-DD', true).isValid() || !parseInt(tab.M) == true || ![0, 1].includes(parseInt(tab.M))) { //CHECK LINE DATA IS VALID
            sails.log("=============================== Invalid data input: ================================");
            arrErrorLine.push(i + 1);
          } else {
            if (tab.H && !validateEmail(tab.H)) {
              arrErrorLine.push("Line: " + i + 1 + ' "' + tab.H + '" is not valid e-mail.');
            }
            let userNameParent = await Parent.findOne({ userName: tab.G });
            // END CHECK PARENT UNIQUE
            if (userNameParent) {
              arrErrorLine.push("Line: " + i + 1 + ' "' + tab.G + '" username is existed.');
            } else {
              //PREPARE DATA
              let tmpObj = {
                firstName: tab.B,
                lastName: tab.C,
                emailAddress: tab.H ? tab.H.toLowerCase() : '',
                userName: tab.G,
                phone: tab.J,
                password: await sails.helpers.passwords.hashPassword(tab.K),
                birthday: tab.F,
                profession: tab.I,
                currentAddress: tab.L,
                gender: tab.D == 'X' ? 1 : 0,
                status: tab.M,
                school: req.me.school
              }

              //RELATION WITH STUDENT
              let typeRelation = 2;
              if (tab.D == 'X' && tab.E == 'X') {
                typeRelation = 1;
              } else if (tab.D == 'O' && tab.E == 'X') {
                typeRelation = 0;
              }

              //CHECK MOTHER OR FATHER IS EXISTED => IF EXIST => UPDATE TO GUARDIAN
              if (typeRelation == 0 || typeRelation == 1) {
                let student_parent = await Student_Parent.findOne({ student: student.id, type: typeRelation });
                if (student_parent) await Student_Parent.update({ id: student_parent.id }).set({ type: 2 });
              }

              if (userNameParent) {
                let parentId = userNameParent.id

                // UPDATE DATA
                await ParentService.edit({ id: parentId }, tmpObj);

                //ADD RELATION IF NOT EXIST
                let exist = await Student_Parent.findOne({ student: student.id, parent: parentId });
                if (!exist) {
                  await Student_Parent.create({ student: student.id, parent: parentId, type: typeRelation });
                } else { //UPDATE TYPE IF EXISTED
                  await Student_Parent.update({ id: exist.id }).set({ type: typeRelation });
                }
              } else {
                // ADD NEW DATA PARENT
                let parentObj = await ParentService.add(tmpObj);
                //ADD RELATION WITH STUDENT
                await Student_Parent.create({ student: student.id, parent: parentObj.id, type: typeRelation });
              }
            }
          }
        }
        // END ADD PARENT

        if (arrErrorLine.length) {
          let PARENT_ERROR_IMPORT = { code: 'PARENT_ERROR_IMPORT', message: "Can not import data at line(s): " + arrErrorLine.join(', ') };
          return res.badRequest(PARENT_ERROR_IMPORT);
        }

        return res.ok({
          status: 200
        })
      }
    });
  },
  importMedicalExcel: async (req, res) => {
    sails.log.info("================================ ImportController.importMedicalExcel => START ================================");
    let params = req.allParams();
    if (!params.id) return res.badRequest();
    let idMedical = params.id;
    let medicalObj = await Medical.findOne({ id: idMedical });
    if (!medicalObj) return res.badRequest();
    let year = moment().format('YYYY');
    let month = moment().format('MM');
    let currentPath = 'assets/excel/' + year + '/' + month;
    let originFolder = '';

    if (fs.existsSync(currentPath)) {
      originFolder = require('path').resolve(sails.config.appPath, currentPath)
    } else {
      currentPath = await makeDir(currentPath);
      originFolder = currentPath;
    }
    const excelToJson = require('convert-excel-to-json');

    req.file('file').upload({
      dirname: originFolder
    }, async (err, file) => {
      if (err) {
        return res.badRequest(err);
      } else {
        console.log(file[0].fd);

        //const data = fs.readdirSync(originFolder, { encoding: 'utf-8' })
        //
        console.log(originFolder);
        const result = excelToJson({
          sourceFile: file[0].fd
        });
        var obj = Object.values(result);
        if (!obj[0].length) {
          let MEDICAL_ERROR_IMPORT = { code: 'MEDICAL_ERROR_IMPORT', message: sails.__("File empty") };
          return res.badRequest(MEDICAL_ERROR_IMPORT);
        }
        //arr of line which have error data
        let arrErrorLine = []
        let medical = await Medical.findOne({ id: idMedical });
        if (!medical) {
          let MEDICAL_ERROR_IMPORT = { code: 'MEDICAL_ERROR_IMPORT', message: sails.__("Medical not exist") };
          return res.badRequest(MEDICAL_ERROR_IMPORT);
        } else {
          await Student_Medical.destroy({ medical: idMedical });
          for (let i = 1; i < obj[0].length; i++) {
            let tab = obj[0][i];
            let code = '';
            code = tab.A + '';
            if (code.includes('`')) code = code.replace('`', '');
            let student = await Student.findOne({ code: code, school: req.me.school });

            if (!student) { //CHECK STUDENT CODE IS VALID?
              sails.log("=============================== Student with code not found: ================================");
              arrErrorLine.push(i + 1);
            } else {
              let checkData = true;
              let studentMedical = {};
              studentMedical.student = student.id;
              studentMedical.medical = idMedical;
              if (tab.E && tab.E != '-' && (tab.E > 120 || tab.E < 50)) {
                arrErrorLine.push(i + 1);
                checkData = false;
              }
              studentMedical.height = tab.E && tab.E != '-' ? tab.E : 0;
              if (tab.F && tab.F != '-' && (tab.F > 30 || tab.F < 8)) {
                arrErrorLine.push(i + 1);
                checkData = false;
              }
              studentMedical.weight = tab.F && tab.F != '-' ? tab.F : 0;
              let listBoodGroup = ["O+", "A-", "A+", "B-", "B+", "AB-", "AB+", "-"];
              if (!listBoodGroup.includes(tab.G)) {
                arrErrorLine.push(i + 1);
                checkData = false;
              }
              studentMedical.bloodGroup = tab.G && tab.G != '-' ? tab.G : '';
              studentMedical.allergy = tab.H && tab.H != '-' ? tab.H : '';
              if (tab.I && tab.I != '-' && (tab.I > 120 || tab.I < 40)) {
                arrErrorLine.push(i + 1);
                checkData = false;
              }
              studentMedical.heartRate = tab.I && tab.I != '-' ? tab.I : '';
              if (tab.J && tab.J != '-' && (tab.J > 12 || tab.J < 0)) {
                arrErrorLine.push(i + 1);
                checkData = false;
              }
              studentMedical.eyes = tab.J && tab.J != '-' ? tab.J : '';
              if (tab.K && tab.K != '-' && (tab.K > 10 || tab.K < 0)) {
                arrErrorLine.push(i + 1);
                checkData = false;
              }
              studentMedical.ears = tab.K && tab.K != '-' ? tab.K : '';
              studentMedical.notes = tab.L && tab.L != '-' ? tab.L : '';
              if (checkData) {
                let createdAt = '';
                let d = new Date();
                let y = d.getFullYear().toString();
                let m = parseInt((d.getMonth() + 1));
                if (m < 10) m = '0' + m;
                let dd = d.getDate().toString();
                if (y && m && dd) createdAt = y + '-' + m + '-' + dd;

                let data_w_h = {
                  createdAt: createdAt,
                  date: medical.date,
                  height: studentMedical.height + '',
                  weight: studentMedical.weight + ''
                };
                // Find date in w_h_history
                var found_w_h = student.w_h_History.some(el => {
                  return el.date === medical.date;
                });
                //let editObj = {};

                if (found_w_h == true) {
                  for (let i = 0; i < student.w_h_History.length; i++) {
                    if (medical.date == student.w_h_History[i].date) {
                      student.w_h_History[i].height = studentMedical.height + '';
                      student.w_h_History[i].weight = studentMedical.weight + '';
                    }
                  }
                } else {
                  student.w_h_History.push(data_w_h);
                }

                let listMedicalStudent = await Medical.find({
                  classObj: medical.classObj,
                  createdAt: { '>': medical.createdAt }
                })
                if (listMedicalStudent.length == 0) {
                  student.height = studentMedical.height;
                  student.weight = studentMedical.weight;
                  student.bloodGroup = studentMedical.bloodGroup;
                  student.allergy = studentMedical.allergy;
                  student.heartRate = studentMedical.heartRate;
                  student.eyes = studentMedical.eyes;
                  student.ears = studentMedical.ears;
                  student.notes = studentMedical.notes;
                }
                await StudentService.edit({ id: student.id }, student);
                await Student_Medical.create(studentMedical).fetch();
              } else {
                let studentMedicalError = {};
                studentMedicalError.student = student.id;
                studentMedicalError.medical = idMedical;
                await Student_Medical.create(studentMedicalError).fetch();
              }
            }
          }
        }
        originFolder = require('path').resolve(originFolder, file[0].fd);
        fs.unlinkSync(originFolder); //REMOVE FILE EXCEL AFTER IMPORT

        if (arrErrorLine.length) {
          let MEDICAL_ERROR_IMPORT = { code: 'MEDICAL_ERROR_IMPORT', message: sails.__("Cannot import data at line: ") + arrErrorLine.join(', ') };
          return res.badRequest(MEDICAL_ERROR_IMPORT);
        }

        return res.ok()
      }
    });
  },
};

