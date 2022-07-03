module.exports = {
  exits: {
    success: {
      viewTemplatePath: 'frontend/pages/home/index',
      description: 'Display the dashboard for authenticated users.'
    },
    redirect: {
      responseType: 'redirect'
    }
  },
  fn: async function (inputs, exits) {
    // if (!this.req.me) {
    //   sails.log('Not have this.req.me');
    //   throw { redirect: '/frontend/login' };
    // }
    // sails.log('Have this.req.me');
    let adminSchool = await User.find({ userType: 3 });
    if (adminSchool.length == 0) {
      throw { redirect: '/sa/register' };
    }
    let _default = await sails.helpers.getFeDefaultData(this.req)
      .tolerate('noSchoolFound', () => {
        throw { redirect: '/login' };
      });
   
    let sizeThumb = _default.UPLOAD.SIZES[1].name;
    let sizeMediumLarge = _default.UPLOAD.SIZES[3].name;
    
    let teachers = await UserService.find({ status: sails.config.custom.STATUS.ACTIVE, userType: sails.config.custom.TYPE.TEACHER, school: _default.school.id });
    for (let i = 0; i < teachers.length; i++){
      let arrClass = await Teacher_Class.find({ teacher: teachers[i].id }).populate('classObj');
      arrClass = arrClass.map((item)=>item.classObj).filter((item) => item.status == 1).map((item) => item.title);
      teachers[i].classes = arrClass;
      teachers[i].avatar = teachers[i].avatar.replace(sizeThumb, sizeMediumLarge);
    }
    
    let news = await PostService.find({ status: sails.config.custom.STATUS.ACTIVE, type: sails.config.custom.TYPE.NEWS, school: _default.school.id }, 3, 0, 'createAt DESC');


    _default.teachers = teachers;
    _default.news = news;

    return exits.success(_default);

  }
};
