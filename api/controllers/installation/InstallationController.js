const moment = require('moment');
const ErrorMessages = require('../../../config/errors');

module.exports = {

  addSetting: async (req, res) => {
    const params = req.allParams();

    //Get school object to get school's email
    let schoolObj = await School.findOne({ id: req.me.school });

    //GENERAL SETTING
    let rangeTimeMenu = params.rangeTimeMenu ? params.rangeTimeMenu : [];
    let weekend = params.weekend ? params.weekend : [];
    let maximumUploadSize = params.maximumUploadSize ? params.maximumUploadSize : 20;
    let allowShuttlePersonInfo = params.allowShuttlePersonInfo == 1 ? true : false;
    let allowShuttleBus = params.allowShuttleBus == 1 ? true : false;

    // PREPARE DATA FOR WEB SETTINGS
    let webName = params.webName ? params.webName : '';
    let webDescription = params.webDescription ? params.webDescription : '';
    let webVersion = params.webVersion ? params.webVersion : '1.0';
    let webLanguage = params.webLanguage ? params.webLanguage : 'en';
    let webDisplayName = params.webDisplayName ? params.webDisplayName : 'firstlast';
    let webDateFormat = params.webDateFormat ? params.webDateFormat : 'DD/MM/YYYY';
    let webPhoneTechnical = params.webPhoneTechnical ? params.webPhoneTechnical : '';
    let webMailTechnical = params.webMailTechnical ? params.webMailTechnical : '';
    let webAddress = params.webAddress ? params.webAddress : '';
    let webUrl = params.webUrl ? params.webUrl : '';
    let webMapIframe = params.webMapIframe ? params.webMapIframe : ''; 
    //let webFooterDescription = params.webFooterDescription ? params.webFooterDescription : '';
    let socialNetwork = {
      facebook : params.facebook ? params.facebook : '',
      instagram : params.instagram ? params.instagram : '',
      google : params.google ? params.google : '',
      youtube : params.youtube ? params.youtube : ''
    }

    let homeSettings = {
      sliders: params.webSliders ? params.webSliders : [],
      // banner: params.webBanner ? params.webBanner : '',
      isDisplayAbout : params.webIsDisplayAbout ? true : false,
      aboutThumb : params.webAboutThumb ? params.webAboutThumb : '',
      aboutHeadline : params.webAboutHeadline ? params.webAboutHeadline : '',
      aboutTitle : params.webAboutTitle ? params.webAboutTitle : '',
      aboutMotto : params.webAboutMotto ? params.webAboutMotto : '',
      aboutDescription : params.webAboutDescription ? params.webAboutDescription : '',
      aboutReadMoreLink : params.webAboutReadMoreLink ? params.webAboutReadMoreLink : '',
      isDisplayTeacher : params.webIsDisplayTeacher ? true : false,
      // teacherBackground : params.webTeacherBackground ? params.webTeacherBackground : '',
      teacherHeadline : params.webTeacherHeadline ? params.webTeacherHeadline : '',
      teacherTitle : params.webTeacherTitle ? params.webTeacherTitle : '',
      // teacherMotto : params.webTeacherMotto ? params.webTeacherMotto : '',
      isDisplayNews : params.webIsDisplayNews ? true : false,
      newsHeadline : params.webNewsHeadline ? params.webNewsHeadline : '',
      newsTitle : params.webNewsTitle ? params.webNewsTitle : '',
      // newsMotto : params.webNewsMotto ? params.webNewsMotto : '',
      isDisplayNotification : params.webIsDisplayNotification ? true : false,
      notificationHeadline : params.webNotificationHeadline ? params.webNotificationHeadline : '',
      notificationTitle : params.webNotificationTitle ? params.webNotificationTitle : '',
      // notificationMotto : params.webNotificationMotto ? params.webNotificationMotto : '',
    }

    // CHANGE VALUE TO UPDATE WEB SETTINGS
    let webSettings = {
      key: 'web',
      value: {
        name: webName,
        description: webDescription,
        version: webVersion,
        language:webLanguage,
        displayName: webDisplayName,
        dateFormat: webDateFormat,
        rangeTimeMenu: rangeTimeMenu,
        weekend: weekend,
        maximumUploadSize: maximumUploadSize,
        allowShuttlePersonInfo: allowShuttlePersonInfo,
        phoneTechnical: webPhoneTechnical,
        mailTechnical: webMailTechnical,
        address: webAddress,
        website: webUrl,
        mapIframe: webMapIframe, 
        homeSettings: homeSettings,
        socialNetwork: socialNetwork, 
        allowShuttleBus: allowShuttleBus,
        extraModules: {
          tuition: false,
          pickup: false
        }
      },
      
    };
    if (req.me && req.me.school) webSettings.school = req.me.school;
    let webSettingsObj = await SettingService.get({ key: 'web' });
    if (webSettingsObj) {
      await SettingService.edit({id:webSettingsObj.id}, webSettings);
    } else {
      await SettingService.add(webSettings);
    }
    // END PREPARE DATA FOR WEB SETTINGS

    // PREPARE DATA FOR APP SETTINGS
    let appName = params.appName ? params.appName : '';
    let appDescription = params.appDescription ? params.appDescription : '';
    let appVersion = params.appVersion ? params.appVersion : '1.0.0';
    let appLanguage = params.appLanguage ? params.appLanguage : 'en';
    let appMailTechnical = params.appMailTechnical ? params.appMailTechnical : 'support@kindie.io';
    let appMailSales = params.appMailSales ? params.appMailSales : 'sales@kindie.io';
    let appPhoneTechnical = params.appPhoneTechnical ? params.appPhoneTechnical : '(+84) 339 389 179';
    let appPhoneSales = params.appPhoneTechnical ? params.appPhoneSales : '(+84) 339 389 179';
    let appHotline = params.appHotline ? params.appHotline : '(+84) 339 389 179';
    let appMaxAlbum = params.appMaxAlbum ? params.appMaxAlbum : 6;
    // let appMaxNotification = params.appMaxNotification ? params.appMaxNotification : '';
    let appNotificationNews = params.appNotificationNews && params.appNotificationNews == 1 ? true : false;
    // let appNotificationTuition = params.appNotificationTuition && params.appNotificationTuition == 1 ? true : false;
    let appNotificationDayOff = params.appNotificationDayOff && params.appNotificationDayOff == 1 ? true : false;
    let appNotificationAlbum = params.appNotificationAlbum && params.appNotificationAlbum == 1 ? true : false;
    let appNotificationMenu = params.appNotificationMenu && params.appNotificationMenu == 1 ? true : false;
    let appNotificationSchedule = params.appNotificationSchedule && params.appNotificationSchedule == 1 ? true : false;
    
    // CHANGE VALUE TO UPDATE WEB SETTINGS
    let appSettings = {
      key: 'app',
      value: {
        name: appName,
        description: appDescription,
        version: appVersion,
        language: appLanguage,
        mailTechnical: appMailTechnical,
        mailSales: appMailSales,
        phoneTechnical: appPhoneTechnical,
        phoneSales: appPhoneSales,
        hotline: appHotline,
        maxAlbum: appMaxAlbum,
        notificationAlbum: appNotificationAlbum,
        notificationMenu: appNotificationMenu,
        notificationDayOff: appNotificationDayOff,
        notificationNews: appNotificationNews,
        notificationSchedule: appNotificationSchedule,
        rangeTimeMenu: rangeTimeMenu,
        maximumUploadSize: maximumUploadSize,
        allowShuttlePersonInfo: allowShuttlePersonInfo,
        allowShuttleBus: allowShuttleBus,
        buildNumber: 1,
        extraModules: {
          tuition: false,
          pickup: false
        }
      },
      school: req.me.school
    };
    let appSettingsObj = await SettingService.get({ key: 'app', school: req.me.school });
    if (appSettingsObj) {
      await SettingService.edit({id:appSettingsObj.id}, appSettings);
    } else {
      await SettingService.add(appSettings);
    }
    // END PREPARE DATA FOR WEB SETTINGS
    // After setting, we will set default branch of this school
    // PREPARE DATA BRANCH
    const newData = {
      title: sails.__("Default branch"), // REQUIRED
      code: Date.now(), // REQUIRED
      address: '-', // REQUIRED
      status: sails.config.custom.STATUS.ACTIVE,
      minister: req.session.userId,
      updatedBy: req.session.userId,
      school: req.me.school
    };
    // ADD NEW DATA BRANCH
    const newBranch = await BranchService.add(newData);
    let day = new Date();
    let thisYear = day.getFullYear();
    let nextYear = parseInt(day.getFullYear()) + 1;


    let startTime = '01-09-' + thisYear;
    let endTime = '01-06-' + nextYear;
    let title = thisYear + ' - ' + nextYear;
    const newCourseSession = {
      title: title, // REQUIRED
      code: Date.now(), // REQUIRED
      startTime: startTime,
      endTime: endTime,
      branchOfSession: newBranch.id,
      status: sails.config.custom.STATUS.ACTIVE,
      school: req.me.school
    };
    await CourseSessionService.add(newCourseSession);
    //End add default branch
    return res.ok();
  },

  upload: async (req, res) => {
    sails.log.info("================================ InstallationController.upload => START ================================");
    let thumbnail = {};
    if (req.file('file')) {
      let fileUploaded = await sails.helpers.uploadFile.with({
        req: req,
        file: 'thumbnail'
      });
      if (fileUploaded.length) {
        let filename = '';
        for (let file of fileUploaded) {
          // sails.log('fileUploaded', file);
          filename = file.fd.replace(/^.*[\\\/]/, '');
          thumbnail.sizes = {};
          thumbnail.path = '/uploads/' + moment().format('YYYY/MM') + '/' + filename;
        }

        let dataMedia = {
          title: filename,
          thumbnail: thumbnail,
          status: sails.config.custom.STATUS.ACTIVE,
          school: req.me.school
        }
        let mediaObj = await MediaService.add(dataMedia);
        return res.json(mediaObj.thumbnail.path);
      }
    }
    return res.json({});
  },

  addDefaultCourseSession: async (req, res) => {
    sails.log.info("================================ Installation.registerSA => START ================================");
    let params = req.allParams();
    // CHECK TITLE & CODE
    if (!params.title || !params.title.trim().length) return res.badRequest(ErrorMessages.COURSE_SESSION_TITLE_REQUIRED);
    if (!params.code || !params.code.trim().length) return res.badRequest(ErrorMessages.COURSE_SESSION_CODE_REQUIRED);
    
    let startTime = moment(params.startTime, "YYYY-MM-DD").format("YYYY-MM-DD");
    let endTime = moment(params.endTime, "YYYY-MM-DD").format("YYYY-MM-DD");
    if (startTime == 'Invalid date' || endTime == 'Invalid date') {
      return res.badRequest(ErrorMessages.COURSE_SESSION_TIME_INVALID)
    }
    // PREPARE DATA COURSE SESSION
    const newData = {
      title: params.title, // REQUIRED
      code: params.code, // REQUIRED
      startTime: params.startTime,
      endTime: params.endTime,
      status: sails.config.custom.STATUS.ACTIVE,
      school: req.me.school
    };
    
    // ADD NEW DATA COURSE SESSION
    const newCourseSession = await CourseSessionService.add(newData);

    // RETURN DATA COURSE SESSION
    return res.ok(newCourseSession);
  }
};