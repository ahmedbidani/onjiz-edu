/**
 * DashBoardController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */


//Library
const moment = require('moment');

module.exports = {

    searchSchedule: async (req, res) => {
        sails.log.info("================================ DashBoardController.searchSchedule => START ================================");
        let params = req.allParams();
        
        let classID = params.classID ? params.classID : null;
        let draw = (params.draw) ? parseInt(params.draw) : 1;
        let limit = (params.length) ? parseInt(params.length) : null;
        let skip = (params.start) ? parseInt(params.start) : null;
        let sort = (params.sort) ? JSON.parse(params.sort) : null;
        
        let dateUse = moment().format('YYYY-MM-DD');  
        let objSchedule = await ScheduleService.get({ class: classID, dateUse : dateUse });
        let resSchedules = [];
        let totalSchedule = 0;
        // PREPARE DATA FOR SCHEDULE
        if (objSchedule) {
            for (let i = 0; i < objSchedule.slotSubjects.length; i++){
                let tmpData = {};
                tmpData.time = objSchedule.slotSubjects[i].timeStart + " - " + objSchedule.slotSubjects[i].timeEnd;
                if (objSchedule.slotSubjects[i].subject.title) {
                    tmpData.subject =  objSchedule.slotSubjects[i].subject.title;
                    if(objSchedule.slotSubjects[i].topic) {
                        tmpData.subject += "<br/>" + objSchedule.slotSubjects[i].topic;
                    }
                } else {
                    tmpData.subject = '';
                }
                resSchedules.push(tmpData);
                totalSchedule++;
            }  
            return res.ok({ draw: draw, recordsTotal: totalSchedule, recordsFiltered: totalSchedule, data: resSchedules });
        } else {
            return res.ok({ draw: draw, recordsTotal: totalSchedule, recordsFiltered: totalSchedule, data: resSchedules });
        }
        // END PREPARE DATA FOR SCHEDULE
    },
    searchMenu: async (req, res) => {
        sails.log.info("================================ DashBoardController.searchMenu => START ================================");
        let params = req.allParams();
        
        let classID = params.classID ? params.classID : null;
        let draw = (params.draw) ? parseInt(params.draw) : 1;
        
        let dateUse = moment().format('YYYY-MM-DD');  
        let objMenu = await MenuService.get({ class: classID, dateUse : dateUse });
        let resMenus = [];
        let totalMenu = 0;
        // PREPARE DATA FOR MENU
        if (objMenu) {
            for (let i = 0; i < objMenu.slotFeedings.length; i++){
                let tmpData = {};
                let time = objMenu.slotFeedings[i].time;
                tmpData.time = time;
                if (objMenu.slotFeedings[i].foods.length > 0) {
                    // ADD <BR/> FOR FOOD TITLE AND PREPARE DATA TITLE FOR FOOD MENU
                    let foodTitles = [];
                    for (let y = 0; y < objMenu.slotFeedings[i].foods.length ; y++){
                        let foodObj = await FoodService.get({ id: objMenu.slotFeedings[i].foods[y] });
                        if(foodObj) {
                            foodTitles.push(foodObj.title);
                        }
                    }
                    if(foodTitles.length) {
                        tmpData.food = foodTitles.join(); //Convert ARRAY to STRING
                    } else {
                        tmpData.food = '-';
                    }
                    
                } else {
                    tmpData.food = '-';
                }
                resMenus.push(tmpData);
                totalMenu++;
            }  
            return res.ok({ draw: draw, recordsTotal: totalMenu, recordsFiltered: totalMenu, data: resMenus });
        } else {
            return res.ok({ draw: draw, recordsTotal: totalMenu, recordsFiltered: totalMenu, data: resMenus });
        }
        // END PREPARE DATA FOR MENU
    },
    searchClassSize: async (req, res) => {
        sails.log.info("================================ DashBoardController.searchClassSize => START ================================");
        let params = req.allParams();
        let draw = (params.draw) ? parseInt(params.draw) : 1;

        let arrClass = await ClassService.find({status: sails.config.custom.STATUS.ACTIVE, school: req.me.school});
        let resClass = [];
        let totalClass = 0;
        // PREPARE DATA FOR CLASS
        let totalStudentAllClass = 0;
        let totalAttendance = 0;
        let totalAbsence = 0;
        let totalPickedUp = 0;
        if (arrClass) {
            for (let i = 0; i < arrClass.length; i++){
                let attendant = await Attendent.count({ date: moment().format('YYYY-MM-DD'), classObj: arrClass[i].id, status: sails.config.custom.STATUS.ATTENDANT });
                let pickedUp = await Attendent.count({ date: moment().format('YYYY-MM-DD'), classObj: arrClass[i].id, status: sails.config.custom.STATUS.ATTENDANT, movingProcessStep: {'in' : [ 3, 4] } });
                //let pickedUp = await PickUp.count({ date: moment().format('YYYY-MM-DD'), classObj: arrClass[i].id, time: { '!=': '' }, parent: { '!=': null } });
                let tmpData = {};
                tmpData.className = arrClass[i].title;
                tmpData.total = arrClass[i].totalStudent;
                totalStudentAllClass += parseInt(arrClass[i].totalStudent);
                tmpData.attendant = attendant;
                totalAttendance += parseInt(attendant);
                tmpData.absence = arrClass[i].totalStudent - attendant;
                totalAbsence += parseInt(arrClass[i].totalStudent - attendant);
                tmpData.pickedUp = pickedUp;
                totalPickedUp += parseInt(pickedUp);
                resClass.push(tmpData);
                totalClass++;
            }  
            let tmpData = {};
            tmpData.className = '';
            tmpData.total = totalStudentAllClass;
            tmpData.attendant = totalAttendance;
            tmpData.absence = totalAbsence;
            tmpData.pickedUp = totalPickedUp;
            resClass.push(tmpData);



            return res.ok({ draw: draw, recordsTotal: totalClass, recordsFiltered: totalClass, data: resClass });
        } else {
            return res.ok({ draw: draw, recordsTotal: totalClass, recordsFiltered: totalClass, data: resClass });
        }
        // END PREPARE DATA FOR CLASS
    },
    searchUserParent: async (req, res) => {
        sails.log.info("================================ DashBoardController.searchUserParent => START ================================");
        let params = req.allParams();
        let branchId = req.session.branchId;
        let listID = [];
        let numberParent = 0;
        let totalParent = 0;
        let listSessionObj = await CourseSessionService.find({ branchOfSession: branchId });

        if (listSessionObj.length) {
            for (let sessionObj of listSessionObj) {
                //let listClassObj = await ClassService.find({ courseSession: sessionObj.id });
                let listClassObj = sessionObj.classes;
                if (listClassObj.length) {
                    for (let clas of listClassObj) {
                        let classObj = await ClassService.get({ id: clas.id }); 
                        if (classObj.students.length) {
                            for (let studentObj of classObj.students) {
                                if (studentObj) {
                                    let student = await StudentService.get({ id: studentObj.id });
                                    if (student && student.parents.length) {
                                        for (let parentObj of student.parents) {
                                            if (parentObj && !listID.includes(parentObj.id)) {
                                                totalParent++;
                                                listID.push(parentObj.id)
                                                if (parentObj.activated) numberParent++;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        
        
        let numberParentInactive = totalParent - numberParent;
        
        return res.ok({ numberParent: numberParent, numberParentInactive: numberParentInactive });
    },
};
