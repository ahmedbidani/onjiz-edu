// /**
//  * MobileTuitionController
//  *
//  * @description :: Server-side actions for handling incoming requests.
//  * @help        :: See https://sailsjs.com/docs/concepts/actions
// */
// const ErrorMessage = require('../../../config/errors');

// module.exports = {
//   listByClass: async (req, res) => {
//     // GET ALL PARAMS
//     sails.log('listByClass')
//     const params = req.allParams();

//     // CHECK ID PARAMS
//     if (!params.classId) {
//       return res.badRequest(ErrorMessage.TUITION_ERR_ID_REQUIRED);
//     }
//     let tuitions = await Tuition_Class.find({
//       classObj: params.classId
//     }).populate('tuition');
//     let resData = [];
//     _.each(tuitions, function (tuitionItem) {
//       resData.push(tuitionItem.tuition);
//     })
//     return res.json({
//       data: resData
//     });
//   },

//   listStudentOfTuition: async (req, res) => {
//     // GET ALL PARAMS
//     const params = req.allParams();

//     // CHECK ID PARAMS
//     if (!params.id) {
//       return res.badRequest(TuitionError.TUITION_ERR_ID_REQUIRED);
//     }
//     let studentsOfTuition = await Tuition_Student.find({ tuition: params.id }).populate('student');
//     let resData = [];
//     _.each(studentsOfTuition, function (studentItem) {
//       let params = {
//         student: studentItem.student,
//         paid: studentItem.paid
//       }
//       resData.push(params)
//     })
//     return res.json({
//       data: resData
//     });
//   },

//   listTuitionOfStudent: async (req, res) => {
//     // GET ALL PARAMS
//     const params = req.allParams();
//     // CHECK ID PARAMS
//     if (!params.studentId) {
//       return res.badRequest(TuitionError.TUITION_ERR_ID_REQUIRED);
//     }
//     let arrTuitions = await Tuition_Student.find({ student: params.studentId }).populate('tuition');
//     let respData = [];
//     _.each(arrTuitions, function (tuitionItem) {
//       let params = {
//         tuition: tuitionItem.tuition,
//         paid: tuitionItem.paid
//       }
//       respData.push(params)
//     });

//     return res.json({
//       data: respData
//     });
//   }
// };
