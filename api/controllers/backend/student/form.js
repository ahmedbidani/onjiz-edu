/**
 * student/form.js
 *
 * @description :: Server-side controller action for handling incoming requests.
 * @help        :: See https://sailsjs.com/documentation/concepts/controllers
 */


module.exports = {
  friendlyName: 'View Edit Student',
  description: 'Display "Edit Student" page.',
  exits: {
    success: {
      viewTemplatePath: 'backend/pages/student/form',
    },
    error: {
      description: 'Error.',
      responseType: 'badRequest'
    },
		redirect: {
			responseType: 'redirect'
		}
  },
  fn: async function (inputs, exits) {
    sails.log.info("================================ controllers/backend/student/form => ================================");
    if (!this.req.me) {
      throw { redirect: '/backend/login' };
    }
		if (!this.req.me.isMainSchoolAdmin && (!this.req.me.role || !this.req.me.role.permissions || !this.req.me.role.permissions.student || (!this.req.me.role.permissions.student.add && !this.req.param('id')) || (!this.req.me.role.permissions.student.edit && this.req.param('id')))) {
			throw { redirect: '/backend/dashboard' };
		}
    let student = {};
    let _default = await sails.helpers.getDefaultData(this.req);
    _default.manner = (this.req.param('id') == undefined ? 'add' : 'edit');
    if (_default.manner == 'edit') {
      student = await StudentService.get({ id: this.req.param('id') });

      let motherOfStudent = await Student_Parent.findOne({ student: student.id, type: 0 });
      let fatherOfStudent = await Student_Parent.findOne({ student: student.id, type: 1 });
      let guardiansOfStudent = await Student_Parent.find({ student: student.id, type: 2 });
      student.mother = '';
      student.father = '';
      student.guardians = [];
      if (motherOfStudent) student.mother = motherOfStudent.parent;
      if (fatherOfStudent) student.father = fatherOfStudent.parent;
      if (guardiansOfStudent && guardiansOfStudent.length > 0) student.guardians = guardiansOfStudent.map(item => item.parent);
    } else {
      student.mother = '';
      student.father = '';
      student.guardians = [];
    }
    let listClass = await ClassService.find({ school: this.req.me.school });
    _default.listClass = listClass;

    let listMother = await ParentService.find({ gender: _default.TYPE.FEMALE, school: this.req.me.school });
    _default.listMother = listMother;
    let listFather = await ParentService.find({ gender: _default.TYPE.MALE, school: this.req.me.school });
    _default.listFather = listFather;
    let listOthers = await ParentService.find({ school: this.req.me.school });
    _default.listOthers = listOthers;
    
    _default.studentData = student;
    return exits.success(_default);
  }
};