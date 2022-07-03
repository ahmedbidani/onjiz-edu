const ErrorMessages = require('../../../../config/errors');
module.exports = {
  searchStudent: async (req, res) => {
    sails.log.info("================================ FEHealthController.searchStudent => START ================================");
    let params = req.allParams();
    if (!params.classId) return res.badRequest(ErrorMessages.CLASS_ID_REQUIRED);

    let classObj = await Class.findOne({ id: params.classId }).populate('students');
    return res.ok(classObj.students);
  },
  editStudent: async (req, res) => {
    sails.log.info("================================ FEHealthController.editStudent => START ================================");
    let params = req.allParams();
    if (!params.studentId) return res.badRequest(ErrorMessages.STUDENT_ID_REQUIRED);

    let studentObj = await Student.findOne({ id: params.studentId });
    if (!studentObj) return res.badRequest(ErrorMessages.STUDENT_NOT_FOUND);

    const editData = {
      height: params.height ? parseFloat(params.height) : 0,
      weight: params.weight ? parseFloat(params.weight) : 0,
      bloodGroup: params.bloodGroup ? params.bloodGroup : '',
      allergy: params.allergy ? params.allergy : '',
      heartRate: params.heartRate ? params.heartRate : '',
      eyes: params.eyes ? params.eyes : '',
      ears: params.ears ? params.ears : '',
      notes: params.notes ? params.notes : ''
    };
    // UPDATE DATA Student
    const editObj = await StudentService.edit({ id: params.studentId }, editData);
    return res.json(editObj);
  },
  getHealthByStudentId: async (req, res) => {
    sails.log.info("================================ getHealthByStudentId.searchStudent => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();

    // CHECK ID PARAM
    if (!params.studentId) {
      return res.badRequest(ErrorMessages.STUDENT_ID_REQUIRED);
    }

    // QUERY & CHECK DATA POST
    const student = await StudentService.get({
      id: params.studentId
    });
    if (!student) {
      return res.badRequest(ErrorMessages.STUDENT_NOT_FOUND);
    }

    // RETURN DATA POST
    return res.json({
      data: student
    });
  }
};
