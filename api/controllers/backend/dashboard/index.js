let moment = require('moment');

module.exports = {
  exits: {
    success: {
      viewTemplatePath: 'backend/pages/dashboard/index',
      description: 'Display the dashboard for authenticated users.'
    },
    redirect: {
      responseType: 'redirect'
    }
  },
  fn: async function (inputs, exits) {
    if (!this.req.me) {
      throw {
        redirect: '/backend/login'
      };
    }

    let settings = await Setting.find({
      school: this.req.me.school
    });
    if (!settings.length) {
      throw {
        redirect: '/installation/setting'
      }
    }
    let _default = await sails.helpers.getDefaultData(this.req);
    let curDate = moment().format('YYYY-MM-DD');
    //Post
    let totalPosts = await Post.count({
      school: this.req.me.school
    });
    let listPosts = await PostService.find({
      school: this.req.me.school
    });
    let totalPostsThisMonth = 0;
    for (var i = 0; i < listPosts.length; i++) {
      let month = moment().format('MM');
      if (moment(listPosts[i].updatedAt).format('MM') === month) {
        totalPostsThisMonth = totalPostsThisMonth + 1;
      }
    }
    //Album
    let totalAlbums = await Album.count({
      school: this.req.me.school
    });
    //User
    let totalUsers = await User.count({
      status: sails.config.custom.STATUS.ACTIVE,
      school: this.req.me.school
    });
    let totalParents = await Parent.count({
      school: this.req.me.school
    });
    //Menu & Classes
    let arrClass = await ClassService.find({
      status: sails.config.custom.STATUS.ACTIVE,
      school: this.req.me.school
    });
    // Notifications
    let notifications = await Notifications.find({
      status: sails.config.custom.STATUS.ACTIVE,
      type: {
        in: [sails.config.custom.TYPE.NEWS_PARENT, sails.config.custom.TYPE.NEWS_ALL, sails.config.custom.TYPE.NEWS_TEACHER]
      },
      school: this.req.me.school
    }).limit(10).sort([{
      createdAt: 'DESC'
    }]);
    // Post
    let posts = await PostService.find({
      status: sails.config.custom.STATUS.ACTIVE,
      type: sails.config.custom.TYPE.NEWS,
      school: this.req.me.school
    }, null, null, [{
      createdAt: 'DESC'
    }]);
    // Birthday by Month
    let curMonth = moment().format('MM');
    // webSettings
    let webSettings = this.res.locals.webSettings;
    // FILTER STUDENTS HAVE BIRTHDAY INTO CURRENT MONTH
    let listClassStudent = [...arrClass];
    if (listClassStudent.length > 0) {
      for (let i = 0; i < listClassStudent.length; i++) {
        if (listClassStudent[i].students) {
          let studentArr = [];
          for (let y = 0; y < listClassStudent[i].students.length; y++) {
            let month = moment(listClassStudent[i].students[y].dateOfBirth).format('MM');
            if (month == curMonth) {
              studentArr.push(listClassStudent[i].students[y]);
            }
          }
          listClassStudent[i].students = studentArr;
        }
      }
    }
    // END FILTER STUDENTS HAVE BIRTHDAY INTO CURRENT MONTH 

    // Album
    let listAlbum = await Album.find({
      where: {
        status: 1,
        school: this.req.me.school
      },
      limit: 10,
      sort: [{
        createdAt: 'DESC'
      }],
    });
    for (let i = 0; i < listAlbum.length; i++) {
      let numberOfPhoto = 0;
      let firstPhoto = '';
      if (listAlbum[i].photos && listAlbum[i].photos.length > 0) {
        numberOfPhoto = listAlbum[i].photos.length;
        let photo = await Media.findOne({
          id: listAlbum[i].photos[0]
        });
        if (photo) firstPhoto = photo.thumbnail.sizes.thumbnail.path;
      }
      listAlbum[i].numberOfPhoto = numberOfPhoto;
      listAlbum[i].firstPhoto = firstPhoto;
    }

    sails.log('===========rangeTime========');

    //Set to _default
    _default.totalPosts = totalPosts;
    _default.totalPostsThisWeek = 4;
    _default.totalPostsThisMonth = totalPostsThisMonth;
    _default.listPosts = listPosts;
    _default.listTrendings = listPosts;

    _default.totalUsers = totalUsers;
    _default.totalParents = totalParents;

    // _default.arrMenuList = arrMenuList;
    _default.arrClass = arrClass;

    _default.totalAlbums = totalAlbums;

    _default.notifications = notifications;

    _default.posts = posts;

    _default.listStudent = listClassStudent;

    _default.listAlbum = listAlbum;

    _default.webSettings = webSettings;

    //http://oskarhane.com/create-a-nested-array-recursively-in-javascript/
    return exits.success(_default);

  }
};
