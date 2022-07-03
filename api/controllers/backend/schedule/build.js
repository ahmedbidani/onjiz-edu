/**
 * schedule/list.js
 *
 * @description :: Server-side controller action for handling incoming requests.
 * @help        :: See https://sailsjs.com/documentation/concepts/controllers
 */

const moment = require('moment');

module.exports = {

	friendlyName: 'Schedule Management',
	description: 'Schedule Management',
	inputs: {},
	exits: {
		success: {
			viewTemplatePath: 'backend/pages/schedule/index',
		},
		redirect: {
			responseType: 'redirect'
		}
	},

	fn: async function (inputs, exits) { 
		let listSchedules = await Schedule.find({});

		for (let schedule of listSchedules) {
			
			let _tmpSlotArr = [];
			for (let subject of schedule.slotSubjects) {
				let _tmpSubject = {};
				_tmpSubject.timeStart = subject.time;
				_tmpSubject.timeEnd = subject.time;
				_tmpSubject.topic = subject.topic;
				let _tmpObj = await Subject.findOne({id: subject.subject});
				delete _tmpObj.courseSession;
					delete _tmpObj.school;
					delete _tmpObj.createdAt;
					delete _tmpObj.updatedAt;
				delete _tmpObj.status;
				_tmpSubject.subject = _tmpObj;
				_tmpSlotArr.push(_tmpSubject);
			}
			schedule.slotSubjects = _tmpSlotArr;
			const editObj = await ScheduleService.edit({ id: schedule.id }, schedule);
		
		}
	
		return exits.success(_default);
	}

};
