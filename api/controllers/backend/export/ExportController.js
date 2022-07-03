/**
 * ExportController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const { TAXONOMY_ERR_UPDATE_FAIL } = require('../../../../config/errors');

module.exports = {

  students: async (req, res) => {
    sails.log.info("================================ ExportController.students => START ================================");
    let params = req.allParams();
    let gender = params.gender ? params.gender : "2";
    let keyword = params.keyword ? params.keyword : "";
    let classId = params.classId ? params.classId : null;
    let branchId = params.branchId ? params.branchId : '0';

    //check role of current logged in user
    let schoolObj = await School.findOne({ id: req.me.school });
    let isMainSchoolAdmin = 3 == req.me.userType ? true : false;
    if (!isMainSchoolAdmin && req.me.role && req.me.role.permissions && req.me.role.permissions.album) {
      isHavePermissionEdit = req.me.role.permissions.album.edit ? true : false;
      isHavePermissionDelete = req.me.role.permissions.album.delete ? true : false;
    }

    let where = {};
    if (typeof keyword === "string" && keyword.length > 0) {
      where = {
        $or: [
          { code: { $regex: keyword, $options: 'i' } },
          { firstName: { $regex: keyword, $options: 'i' } },
          { lastName: { $regex: keyword, $options: 'i' } }
        ]
      }
    }

    let mongo = require('mongodb');
    //get students form class
    let studentIds = [];
    if (classId && classId != '0' && classId != 'undefined' && classId != 'null' && classId != '-1') {
      let classObj = await Class.findOne({ id: classId, school: req.me.school }).populate('students');
      if (classObj) {
        studentIds = classObj.students.map((std) => {
          return new mongo.ObjectID(std.id);
        })
      };
    } else if (branchId && branchId != '0' && branchId != 'undefined' && branchId != 'null') {
      let session = await CourseSession.find({ branchOfSession: branchId });
      for (let sessionObj of session) {
        let classes = await Class.find({ courseSession: sessionObj.id }).populate('students');
        for (let classObj of classes) {
          let ids = classObj.students.map((std) => {
            return new mongo.ObjectID(std.id);
          })
          studentIds = [...studentIds, ...ids];
        }
      }
    } else {
      let classes = await Class.find({ school: req.me.school }).populate('students');
      for (let classObj of classes) {
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
    if (params.gender && params.gender != 2) {
      where.$and.push({ gender: parseInt(params.gender) });
    }
    if (params.status && params.status != 0) {
      where.$and.push({ status: parseInt(params.status) });
    }

    /**SEARCH CASE_INSENSITIVE */
    const collection = Student.getDatastore().manager.collection(Student.tableName);
    let result = await collection.find(where);
    const dataWithObjectIds = await result.toArray();
    // let data = dataWithObjectIds()
    let data = [];
    for (let item of dataWithObjectIds) {
      let exportObj = {
        code: item.code,
        firstName: item.firstName,
        lastName: item.lastName,
        dateOfBirth: item.dateOfBirth,
        gender: item.gender ? sails.__("Male") : sails.__("Female"),
        currentAddress: item.currentAddress
      }
      data.push(exportObj);
    }
    const listStudents = JSON.parse(JSON.stringify(data).replace(/"_id"/g, '"id"'));
    return res.ok({ listStudents: listStudents });
  },

  parents: async (req, res) => {
    sails.log.info("================================ ExportController.parents => START ================================");
    let params = req.allParams();
    let gender = params.gender ? params.gender : "2";
    let keyword = params.keyword ? params.keyword : "";
    let classId = params.classId ? params.classId : null;
    let branchId = params.branchId ? params.branchId : '0';

    //check role of current logged in user
    let schoolObj = await School.findOne({ id: req.me.school });
    let isMainSchoolAdmin = 3 == req.me.userType ? true : false;
    if (!isMainSchoolAdmin && req.me.role && req.me.role.permissions && req.me.role.permissions.album) {
      isHavePermissionEdit = req.me.role.permissions.album.edit ? true : false;
      isHavePermissionDelete = req.me.role.permissions.album.delete ? true : false;
    }

    let where = {};
    if (typeof keyword === "string" && keyword.length > 0) {
      where = {
        $or: [
          { code: { $regex: keyword, $options: 'i' } },
          { firstName: { $regex: keyword, $options: 'i' } },
          { lastName: { $regex: keyword, $options: 'i' } }
        ]
      }
    }

    let mongo = require('mongodb');
    //get students form class
    let studentIds = [];
    if (classId && classId != '0' && classId != 'undefined') {
      let classObj = await Class.findOne({ id: classId, school: req.me.school }).populate('students');
      studentIds = classObj.students.map((std) => {
        return std.id;
      })
    } else {
      let classes = await Class.find({ school: req.me.school }).populate('students');
      for (let classObj of classes) {
        let ids = classObj.students.map((std) => {
          return std.id;
        })
        studentIds = [...studentIds, ...ids];
      }
    }

    //get parents from students
    let std_par = await Student_Parent.find({ student: studentIds });
    let parIds = std_par.map((item) => {
      return item.parent;
    })

    parIds = _.union(parIds);
    parIds = parIds.map((item) => {
      return new mongo.ObjectID(item);
    })

    where.$and = [
      { _id: { $in: parIds } },
      { school: new mongo.ObjectID(req.me.school) }
    ];

    // if (params.gender && params.gender != 2) {
    //   where.$and.push({ gender: parseInt(params.gender) });
    // }
    if (params.status && params.status != 0) {
      where.$and.push({ status: parseInt(params.status) });
    }

    /**SEARCH CASE_INSENSITIVE */
    const collection = Parent.getDatastore().manager.collection(Parent.tableName);
    let result = await collection.find(where);
    const dataWithObjectIds = await result.toArray();
    // let data = dataWithObjectIds()
    let data = [];
    const parents = JSON.parse(JSON.stringify(dataWithObjectIds).replace(/"_id"/g, '"id"'));

    for (let item of parents) {
      let studentFirstName = "";
      let studentLastName = "";
      student_parent = await Student_Parent.find({ parent: item.id })

      if (student_parent.length) {
        for (let j in student_parent) {
          student = await Student.findOne({ id: student_parent[j].student })
          // exportObj.firstNameStudent = student.firstName;
        }
        studentFirstName = student.firstName;
        studentLastName = student.lastName;
      }

      let exportObj = {
        userName: item.userName,
        firstNameParent: item.firstName,
        lastNameParent: item.lastName,
        emailAddress: item.emailAddress,
        phone: item.phone,
        birthday: item.birthday,
        profession: item.profession,
        currentAddress: item.currentAddress,
        gender: item.gender == 1 ? sails.__("Male") : sails.__("Female"),
        status: item.status == 1 ? sails.__("Active") : sails.__("Draft"),
        studentFirstName: studentFirstName,
        studentLastName: studentLastName,
        avatar: item.avatar,
      }
      data.push(exportObj);
    }
    const listParents = JSON.parse(JSON.stringify(data).replace(/"_id"/g, '"id"'));

    return res.ok({ listParents: listParents });
  }
};

