/**
 * SettingController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const moment = require('moment');

module.exports = { 

  edit: async (req, res) => {
    const params = req.allParams();
    //DATA GENERAL SETTING
    let rangeTimeMenu = params.rangeTimeMenu ? params.rangeTimeMenu : [];
    let weekend = params.weekend ? params.weekend : [];
    let maximumUploadSize = params.maximumUploadSize ? parseFloat(params.maximumUploadSize) : 1;
    let allowShuttlePersonInfo = params.allowShuttlePersonInfo == 1 ? true : false;
    let allowShuttleBus = params.allowShuttleBus == 1 ? true : false;

    // PREPARE DATA FOR WEB SETTINGS
    let webName = params.webName ? params.webName : '';
    let webDescription = params.webDescription ? params.webDescription : '';
    let webVersion = params.webVersion ? params.webVersion : '1.0';
    let webLicense = params.webLicense ? params.webLicense : '';
    let webLanguage = params.webLanguage ? params.webLanguage : 'en';
    let webDisplayName = params.webDisplayName ? params.webDisplayName : 'firstlast';
    let webDateFormat = params.webDateFormat ? params.webDateFormat : 'DD/MM/YYYY';
    let webPhoneTechnical = params.webPhoneTechnical ? params.webPhoneTechnical : '';
    let webMailTechnical = params.webMailTechnical ? params.webMailTechnical : '';
    let webAddress = params.webAddress ? params.webAddress : '';
    let webUrl = params.webUrl ? params.webUrl : '';
    let webMapIframe = params.webMapIframe ? params.webMapIframe : ''; 
    let webAboutUsLink = params.webAboutUsLink ? params.webAboutUsLink : '';
    let webTermsAndConditionsLink = params.webTermsAndConditionsLink ? params.webTermsAndConditionsLink : '';
    let webPrivacyPolicyLink = params.webPrivacyPolicyLink ? params.webPrivacyPolicyLink : '';
    let webFooterDescription = params.webFooterDescription ? params.webFooterDescription : '';
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
    let webSettings = await SettingService.get({ key: 'web', school: req.me.school });
    webSettings.value.name = webName;
    webSettings.value.description = webDescription;
    webSettings.value.version = webVersion;
    webSettings.value.license = webLicense;
    webSettings.value.language = webLanguage;
    webSettings.value.displayName = webDisplayName;
    webSettings.value.dateFormat = webDateFormat;
    webSettings.value.rangeTimeMenu = rangeTimeMenu;
    webSettings.value.weekend = weekend;
    webSettings.value.maximumUploadSize = maximumUploadSize;
    webSettings.value.allowShuttlePersonInfo = allowShuttlePersonInfo;
    webSettings.value.phoneTechnical = webPhoneTechnical;
    webSettings.value.mailTechnical = webMailTechnical;
    webSettings.value.address = webAddress;
    webSettings.value.website = webUrl;
    webSettings.value.mapIframe = webMapIframe; 
    webSettings.value.aboutUsLink = webAboutUsLink;
    webSettings.value.termsAndConditionsLink = webTermsAndConditionsLink;
    webSettings.value.privacyPolicyLink = webPrivacyPolicyLink;
    webSettings.value.footerDescription = webFooterDescription;
    webSettings.value.socialNetwork = socialNetwork;
    webSettings.value.homeSettings = homeSettings;
    webSettings.value.allowShuttleBus = allowShuttleBus;;
    await SettingService.edit({ id: webSettings.id }, { value: webSettings.value });
    // END PREPARE DATA FOR WEB SETTINGS

    // PREPARE DATA FOR APP SETTINGS
    let appName = params.appName ? params.appName : '';
    let appDescription = params.appDescription ? params.appDescription : '';
    let appVersion = params.appVersion ? params.appVersion : '';
    
    let appLanguage = params.appLanguage ? params.appLanguage : 'en';
    let appMailTechnical = params.appMailTechnical ? params.appMailTechnical : '';
    let appMailSales = params.appMailSales ? params.appMailSales : '';
    let appPhoneTechnical = params.appPhoneTechnical ? params.appPhoneTechnical : '';
    let appPhoneSales = params.appPhoneTechnical ? params.appPhoneSales : '';
    let appHotline = params.appHotline ? params.appHotline : '';
    let appMaxAlbum = params.appMaxAlbum ? params.appMaxAlbum : 6;
    // let appMaxNotification = params.appMaxNotification ? params.appMaxNotification : '';
    let appNotificationNews = params.appNotificationNews && params.appNotificationNews == 1 ? true : false;
    // let appNotificationTuition = params.appNotificationTuition && params.appNotificationTuition == 1 ? true : false;
    let appNotificationAlbum = params.appNotificationAlbum && params.appNotificationAlbum == 1 ? true : false;
    let appNotificationMenu = params.appNotificationMenu && params.appNotificationMenu == 1 ? true : false;
    let appNotificationSchedule = params.appNotificationSchedule && params.appNotificationSchedule == 1 ? true : false;
    let appNotificationDayOff = params.appNotificationDayOff && params.appNotificationDayOff == 1 ? true : false;
    
    // CHANGE VALUE TO UPDATE WEB SETTINGS
    let appSettings = await SettingService.get({ key: 'app', school: req.me.school });
    appSettings.value.name = appName;
    appSettings.value.description = appDescription;
    appSettings.value.version = appVersion;
    appSettings.value.language = appLanguage; 
    appSettings.value.mailTechnical = appMailTechnical;
    appSettings.value.mailSales = appMailSales;
    appSettings.value.phoneTechnical = appPhoneTechnical;
    appSettings.value.phoneSales = appPhoneSales;
    appSettings.value.hotline = appHotline;
    appSettings.value.maxAlbum = appMaxAlbum;
    // appSettings.value.maxNotification = appMaxNotification;
    appSettings.value.notificationNews = appNotificationNews;
    // appSettings.value.notificationTuition = appNotificationTuition;
    appSettings.value.notificationAlbum = appNotificationAlbum;
    appSettings.value.notificationMenu = appNotificationMenu; 
    appSettings.value.notificationSchedule = appNotificationSchedule;
    appSettings.value.notificationDayOff = appNotificationDayOff,
    appSettings.value.rangeTimeMenu = rangeTimeMenu;
    appSettings.value.maximumUploadSize = maximumUploadSize;
    appSettings.value.allowShuttlePersonInfo = allowShuttlePersonInfo;
    appSettings.value.allowShuttleBus = allowShuttleBus;
    appSettings.value.buildNumber = !appSettings.value.buildNumber ? 1 : appSettings.value.buildNumber + 1;
    await SettingService.edit({ id: appSettings.id }, { value: appSettings.value });
    // END PREPARE DATA FOR WEB SETTINGS

    return res.ok();
  },

  editFeeCollectionSetting: async (req, res) => {
    const params = req.allParams();
    //DATA GENERAL SETTING
    let currency = params.currency ? params.currency : null;
    let allowTransfer = params.allowTransfer == 1 ? true : false;
    let transferInfo = params.transferInfo ? params.transferInfo : [];
    let transferNote = params.transferNote ? params.transferNote : '';
    let allowStripe = params.allowStripe == 1 ? true : false;

    // CHANGE VALUE TO UPDATE WEB SETTINGS
    let webSettings = await SettingService.get({ key: 'web', school: req.me.school });
    webSettings.value.currency = currency;
    webSettings.value.allowTransfer = allowTransfer;
    webSettings.value.transferInfo = transferInfo;
    webSettings.value.transferNote = transferNote;
    webSettings.value.allowStripe = allowStripe;
    await SettingService.edit({ id: webSettings.id }, { value: webSettings.value });
    // END PREPARE DATA FOR WEB SETTINGS
    
    // CHANGE VALUE TO UPDATE WEB SETTINGS
    let appSettings = await SettingService.get({ key: 'app', school: req.me.school });
    appSettings.value.currency = currency;
    appSettings.value.allowTransfer = allowTransfer;
    appSettings.value.transferInfo = transferInfo;
    appSettings.value.transferNote = transferNote;
    appSettings.value.allowStripe = allowStripe;
    appSettings.value.buildNumber = !appSettings.value.buildNumber ? 1 : appSettings.value.buildNumber + 1;
    await SettingService.edit({ id: appSettings.id }, { value: appSettings.value });
    // END PREPARE DATA FOR WEB SETTINGS

    return res.ok();
  },

  upload: async (req, res) => {
    sails.log.info("================================ SettingController.upload => START ================================");
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
};

