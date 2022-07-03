

/**
 * attendent/list.js
 *
 * @description :: Server-side controller action for handling incoming requests.
 * @help        :: See https://sailsjs.com/documentation/concepts/controllers
 */

const moment = require('moment');

module.exports = {

	friendlyName: 'Attendent Management',
	description: 'Attendent Management',
	inputs: {},
	exits: {
		success: {
			viewTemplatePath: 'backend/pages/attendent/index',
		},
		redirect: {
			responseType: 'redirect'
		}
	},

	fn: async function (inputs, exits) {
		if (!this.req.me) {
			throw { redirect: '/backend' };
		}
		//init
		let _default = await sails.helpers.getDefaultData(this.req);
		let params = this.req.allParams();
		let currentDay = moment().format('DD/MM/YYYY');
		_default.dateFormat = 'dd/mm/yyyy';
		_default.currentDay = currentDay;
		let datePicker = params.datePicker ? moment(params.datePicker,'DD/MM/YYYY').format('YYYY-MM-DD') : moment(currentDay,'DD/MM/YYYY').format('YYYY-MM-DD');
		let classID = params.classId;
		let status = (params.status) ? (params.status) : 1;
		let type = (params.type) ? (params.type) : -1;
		
		_default.selectDate = moment(datePicker,'YYYY-MM-DD').format('DD/MM/YYYY');;
		if (datePicker != undefined) {
			// CHECK EXIST IF YES RETURN ATTENDENT OBJECT BY DATE ATTENDENT ELSE CREATE NEW ONE
			let attendent = await AttendentService.get({
				dateAttendent: datePicker,
				classObj: classID
			});
			if (attendent) {
				_default.attendentDatePicker = attendent;
			} else {
				const newData = {
					dateAttendent: datePicker,
					absenceList: [],
					status: 1,
					classObj: classID
				};
				let attendentCurrent = await AttendentService.add(newData);
				_default.attendentDatePicker = attendentCurrent;
			}

			// CHECK EXIST IF YES RETURN ATTENDENT OBJECT BY DATE ATTENDENT ELSE CREATE NEW ONE
		}

		//
		let startReport = moment(params.start).format('YYYY-MM-DD');
		let endReport = moment(params.end).format('YYYY-MM-DD');
		let start = new Date(startReport).getTime();
		let end = new Date(endReport).getTime();
		let dayOfWeek = moment(params.start).format('dddd');
		let report = [];
		let days = [];
		if (startReport == endReport) {
			report = await AttendentService.find({
				dateAttendent: endReport,
				classObj: classID
			});
			if (report) {
				let tmp = {};
				let studentArr = [];
				tmp.day = dayOfWeek;
				for (let y = 0; y < report[0].absenceList.length; y++) {
					studentArr.push(report[0].absenceList[y].student);
				}
				tmp.listStudent = studentArr;
				days.push(tmp);
				_default.days = days;
				_default.reportDatePicker = report;
			}
		} else {
			report = await Attendent.find({
				updatedAt: {
					'>=': start,
					'<=': end
				},
				classObj: classID
			});

			for (let i = 0; i < report.length; i++) {
				let studentArr = [];
				let tmp = {};
				tmp.day = moment(report[i].dateAttendent).format('dddd');
				for (let y = 0; y < report[i].absenceList.length; y++) {
					studentArr.push(report[i].absenceList[y].student);
				}
				tmp.listStudent = studentArr;
				days.push(tmp)
			}

			if (report) {
				_default.reportDatePicker = report;
				_default.days = days;
			}
		}
		//
		// FILTER STATUS AND TOTAL NUMBER OF ATTENDENT SHEETS
		let totalAll = await AttendentService.count({});
		let totalDone = await AttendentService.count({status: _default.STATUS.DONE });
		let totalActive = await AttendentService.count({status: _default.STATUS.ACTIVE });
		let totalTrash = await AttendentService.count({ status: _default.STATUS.TRASH });
		_default.type = type;
		_default.status = status;
		_default.totalAll = totalAll;
		_default.totalDone = totalDone;
		_default.totalActive = totalActive;
		_default.totalTrash = totalTrash;	
		// END FILTER STATUS AND TOTAL NUMBER OF ATTENDENT SHEETS

		// PREPARE LSIT STUDENT OF CLASS THAT WILL USE FOR ATTENDENT
		let classObj = await Class.find({ id: classID }).populate("students", {sort: 'firstName ASC'});
		let listStudent = classObj[0].students;
		//GET STUDENTS HAVE STATUS = 1
		let listStudent2 = [];
		_.each(listStudent, function (student) {
			if(student.status == 1) {
				listStudent2.push(student);
			}
		});
		//END GET STUDENTS HAVE STATUS = 1
		_default.listStudent = listStudent2;
		_default.classSelect = classID;
		
		// END PREPARE LSIT STUDENT OF CLASS THAT WILL USE FOR ATTENDENT

		return exits.success(_default);
	}

};
