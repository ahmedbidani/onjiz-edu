
/**
 * teacher/index.js
 *
 * @description :: Server-side controller action for handling incoming requests.
 * @help        :: See https://sailsjs.com/documentation/concepts/controllers
 */

module.exports = {
  inputs: {},
  exits: {
    success: {
      viewTemplatePath: 'frontend/pages/teacher/index',
    },
    redirect: {
      responseType: 'redirect'
    }
  },

  fn: async function (inputs, exits) {
    sails.log.info("================================ controllers/frontend/teacher ================================");
    
    let _default = await sails.helpers.getFeDefaultData(this.req)
      .tolerate('noSchoolFound', () => {
        throw { redirect: '/login' };
      });
 
    let limit = _default.PAGING.LIMIT;
    let count = await User.count({ status: sails.config.custom.STATUS.ACTIVE, userType: sails.config.custom.TYPE.TEACHER, school: _default.school.id });
    let numberOfPages = Math.ceil(count / limit);
    
    //redirect if user type wrong params page
    if (_default.pageActive != 1 && _default.pageActive > numberOfPages) {
      throw {redirect: '/teacher'};
    }

    let teachers = await User.find({ status: sails.config.custom.STATUS.ACTIVE, userType: sails.config.custom.TYPE.TEACHER, school: _default.school.id }).limit(limit).skip(limit * (_default.pageActive - 1));
    let sizeThumb = _default.UPLOAD.SIZES[1].name;
    let sizeMediumLarge = _default.UPLOAD.SIZES[3].name;
    for (let i = 0; i < teachers.length; i++){
      let arrClass = await Teacher_Class.find({ teacher: teachers[i].id }).populate('classObj');
      arrClass = arrClass.map((item)=>item.classObj).filter((item) => item.status == 1).map((item) => item.title);
      teachers[i].classes = arrClass;
      teachers[i].avatar = teachers[i].avatar.replace(sizeThumb, sizeMediumLarge);
    }

    _default.teachers = teachers;
    _default.numberOfPages = numberOfPages;
    return exits.success(_default);
  }
};