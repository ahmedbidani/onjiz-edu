/**
 * LoginController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const ErrorMessage = require('../../../config/errors');
const UserService = require('../../services/UserService');
const ParentService = require('../../services/ParentService');

module.exports = {

  login: async (req, res) => {
    let params = req.allParams();
    //validate username, password
    if (!params.username && !params.password) {
      return res.badRequest(ErrorMessage.USER_ERR_USER_INPUT_REQUIRED);
    }

    let teacherObj = null, parentObj = null, driverObj = null;
    //JWTToken
    let token = '';

    let type = params.type;
    let objParam = {};
    if (params.username.indexOf('@') != -1) {
      objParam.emailAddress = params.username.toLowerCase();
    } else  {
      objParam.userName = params.username
    }

    if (!_.isEmpty(objParam)) {
      if (type == 'parent') {
        parentObj = await Parent.findOne(objParam).populate('students');
        if (!parentObj) {
          return res.badRequest(ErrorMessage.USER_ERR_NOT_FOUND);
        }
        if (!parentObj.activated) {
          parentObj.activated = true;
          let parentUpdate = await Parent.findOne({ id: parentObj.id });
          parentUpdate.activated = true;
          await ParentService.edit({ id: parentObj.id }, parentUpdate);
        }
        if (parentObj.students.length == 0) {
          return res.badRequest(ErrorMessage.USER_ERR_STUDENT_NOT_FOUND);
        }
        for (let i = 0; i < parentObj.students.length; i++) {
          let parent_student = await Student_Parent.findOne({ parent: parentObj.id, student: parentObj.students[i].id });
          if (parent_student) parentObj.students[i].relationType = parent_student.type;
        }

        let classObj = [];
        for (let student of parentObj.students) {
          let tmpClass = await Student_Class.find({ student: student.id });
          if (tmpClass.length > 0) {
            for (let classO of tmpClass) {
              let tmp = await Class.findOne({ id: classO.classObj }).populate('students')
              classObj = classObj.concat(tmp);
            }
          }
        }
        parentObj.classes = classObj;

      } else if (type == 'teacher') {
        teacherObj = await User.findOne(objParam).populate("classes");
        if (!teacherObj) {
          return res.badRequest(ErrorMessage.USER_ERR_NOT_FOUND);
        }
      } else if (type == 'driver') {
        driverObj = await User.findOne(objParam).populate("classes");
        if (!driverObj) {
          return res.badRequest(ErrorMessage.USER_ERR_NOT_FOUND);
        }
      }
    } else {
      return res.badRequest(ErrorMessage.USER_ERR_NOT_FOUND);
    }
    //check password
    if (teacherObj) {
      try {
        await sails.helpers.passwords.checkPassword(params.password, teacherObj.password).intercept('incorrect', 'badCombo');
      } catch (err) {
        if (err) {
          return res.badRequest(ErrorMessage.USER_ERR_PASSWORD_WRONG);
        }
      }
      // Check teacher IF ASSIGNED TO A specific class
      let checkRelationTeacherClass = await Teacher_Class.find({ teacher: teacherObj.id });
      if (checkRelationTeacherClass.length == 0) {
        return res.badRequest(ErrorMessage.AUTH_ERR_ACCOUNT_NOTREADY);
      }

      //add token Firebase into user if token is not exist
      if (params.fcmToken) {
        if (params.platform == 'ios') {
          let fcmTokeniOS = [];
          if (teacherObj.hasOwnProperty('fcmTokeniOS')) {
            if (!teacherObj.fcmTokeniOS.includes(params.fcmToken)) {
              teacherObj.fcmTokeniOS.push(params.fcmToken);
            }
          } else {
            teacherObj.fcmTokeniOS = [];
            teacherObj.fcmTokeniOS.push(params.fcmToken);

          }
          fcmTokeniOS = teacherObj.fcmTokeniOS;
          await UserService.edit({ id: teacherObj.id }, { fcmTokeniOS });
        }

        if (params.platform == 'android') {
          let fcmTokenAndroid = [];
          if (teacherObj.hasOwnProperty('fcmTokenAndroid')) {
            if (!teacherObj.fcmTokenAndroid.includes(params.fcmToken)) {
              teacherObj.fcmTokenAndroid.push(params.fcmToken);
            }
          } else {
            teacherObj.fcmTokenAndroid = [];
            teacherObj.fcmTokenAndroid.push(params.fcmToken);

          }
          fcmTokenAndroid = teacherObj.fcmTokenAndroid;
          await UserService.edit({ id: teacherObj.id }, { fcmTokenAndroid });
        }
      }
      token = JwtService.sign({ id: teacherObj.id });

      //get schoolObj
      if (!teacherObj.school) return res.badRequest(ErrorMessage.SCHOOL_ID_REQUIRED);
      let school = await School.findOne({ id: teacherObj.school });
      if (!school) return res.badRequest(ErrorMessage.SCHOOL_NOT_FOUND);

      return res.json({ code: 200, data: teacherObj, token: token, school: school });
    } else if (driverObj) {
      try {
        await sails.helpers.passwords.checkPassword(params.password, driverObj.password).intercept('incorrect', 'badCombo');
      } catch (err) {
        if (err) {
          return res.badRequest(ErrorMessage.USER_ERR_PASSWORD_WRONG);
        }
      }
      // Check teacher IF ASSIGNED TO A specific class
      let checkRelationDriverClass = await Teacher_Class.find({ teacher: driverObj.id });
      if (checkRelationDriverClass.length == 0) {
        return res.badRequest(ErrorMessage.AUTH_ERR_ACCOUNT_NOTREADY);
      }
      token = JwtService.sign({ id: driverObj.id });

      //get schoolObj
      if (!driverObj.school) return res.badRequest(ErrorMessage.SCHOOL_ID_REQUIRED);
      let school = await School.findOne({ id: driverObj.school });
      if (!school) return res.badRequest(ErrorMessage.SCHOOL_NOT_FOUND);

      return res.json({ code: 200, data: driverObj, token: token, school: school });
      
    } else if (parentObj) {
      try {
        await sails.helpers.passwords.checkPassword(params.password, parentObj.password).intercept('incorrect', 'badCombo');
      } catch (err) {
        if (err) {
          return res.badRequest(ErrorMessage.USER_ERR_PASSWORD_WRONG);
        }
      }
      let checkRelationStudentParent = await Student_Parent.find({ parent: parentObj.id });
      if (checkRelationStudentParent.length == 0) {
        return res.badRequest(ErrorMessage.AUTH_ERR_ACCOUNT_NOTREADY);
      }

      //add token Firebase into user if token is not exist
      if (params.fcmToken) {
        if (params.platform == 'ios') {
          let fcmTokeniOS = [];
          if (parentObj.hasOwnProperty('fcmTokeniOS')) {
            if (!parentObj.fcmTokeniOS.includes(params.fcmToken)) {
              parentObj.fcmTokeniOS.push(params.fcmToken);
            }
          } else {
            parentObj.fcmTokeniOS = [];
            parentObj.fcmTokeniOS.push(params.fcmToken);

          }
          fcmTokeniOS = parentObj.fcmTokeniOS;
          await ParentService.edit({ id: parentObj.id }, { fcmTokeniOS });
        }

        if (params.platform == 'android') {
          let fcmTokenAndroid = [];
          if (parentObj.hasOwnProperty('fcmTokenAndroid')) {
            if (!parentObj.fcmTokenAndroid.includes(params.fcmToken)) {
              parentObj.fcmTokenAndroid.push(params.fcmToken);
            }
          } else {
            parentObj.fcmTokenAndroid = [];
            parentObj.fcmTokenAndroid.push(params.fcmToken);

          }
          fcmTokenAndroid = parentObj.fcmTokenAndroid;
          await ParentService.edit({ id: parentObj.id }, { fcmTokenAndroid });
        }
      }
      //sign token 
      token = JwtService.sign({ id: parentObj.id });

      //get schoolObj
      if (!parentObj.school) return res.badRequest(ErrorMessage.SCHOOL_ID_REQUIRED);
      let school = await School.findOne({ id: parentObj.school });
      if (!school) return res.badRequest(ErrorMessage.SCHOOL_NOT_FOUND);

      return res.json({ code: 200, data: parentObj, token: token, school: school });
    }
  },

  logout: async (req, res) => {
    // GET ALL PARAMS
    const params = req.allParams();

    if (!params.id) return res.badRequest(ErrorMessage.USER_ERR_ID_REQUIRED);

    let type = 'teacher';
    let user = await User.findOne({ id: params.id });
    if (!user) {
      user = await Parent.findOne({ id: params.id });
      type = 'parent';
    }

    if (!user) return res.badRequest(ErrorMessage.USER_ERR_NOT_FOUND);

    // Clear tokenFirebase attribute from user logout
    if (params.fcmToken && params.platform) {

      let fcmToken = [];
      if (params.platform == 'ios') fcmToken = user.fcmTokeniOS;
      if (params.platform == 'android') fcmToken = user.fcmTokenAndroid;

      let find = await fcmToken.findIndex(f => f === params.fcmToken);
      if (find != -1) fcmToken.splice(find, 1);

      if (type == 'teacher') {
        if (params.platform == 'ios') await UserService.edit({ id: params.id }, { fcmTokeniOS: fcmToken });
        if (params.platform == 'android') await UserService.edit({ id: params.id }, { fcmTokenAndroid: fcmToken });
      } else if (type == 'parent') {
        if (params.platform == 'ios') await ParentService.edit({ id: params.id }, { fcmTokeniOS: fcmToken });
        if (params.platform == 'android') await ParentService.edit({ id: params.id }, { fcmTokenAndroid: fcmToken });
      }
    }

    return res.ok({ code: 200 });
  },

  checkExpiredToken: async (req, res) => {
    return res.ok({ message: 'ok' });
  }

};
