/**
 * Custom configuration
 * (sails.config.custom)
 *
 * One-off settings specific to your application.
 *
 * For more information on custom configuration, visit:
 * https://sailsjs.com/config/custom
 */
require("dotenv").config();
module.exports.custom = {
  /**************************************************************************
   *                                                                         *
   * The base URL to use during development.                                 *
   *                                                                         *
   * • No trailing slash at the end                                          *
   * • `http://` or `https://` at the beginning.                             *
   *                                                                         *
   * > This is for use in custom logic that builds URLs.                     *
   * > It is particularly handy for building dynamic links in emails,        *
   * > but it can also be used for user-uploaded images, webhooks, etc.      *
   *                                                                         *
   **************************************************************************/
  baseUrl: "http://localhost:1337",

  /**
   * Aws settings
   */
   awsAccessKeyId: "******", 
   awsSecretAccessKey: "*****", 
   awsRegion: "us-east-1",

  /**************************************************************************
   *                                                                         *
   * The TTL (time-to-live) for various sorts of tokens before they expire.  *
   *                                                                         *
   **************************************************************************/
  passwordResetTokenTTL: 24 * 60 * 60 * 1000, // 24 hours
  emailProofTokenTTL: 24 * 60 * 60 * 1000, // 24 hours

  /**************************************************************************
   *                                                                         *
   * The extended length that browsers should retain the session cookie      *
   * if "Remember Me" was checked while logging in.                          *
   *                                                                         *
   **************************************************************************/
  rememberMeCookieMaxAge: 30 * 24 * 60 * 60 * 1000, // 30 days

  /**************************************************************************
   *                                                                         *
   * Automated email configuration                                           *
   *                                                                         *
   * Sandbox Mailgun credentials for use during development, as well as any  *
   * other default settings related to "how" and "where" automated emails    *
   * are sent.                                                               *
   *                                                                         *
   * (https://app.mailgun.com/app/domains)                                   *
   *                                                                         *
   **************************************************************************/
  // mailgunDomain: 'sandboxaa1234fake678.mailgun.org',
  // mailgunSecret: 'key-fakeb183848139913858e8abd9a3',
  //--------------------------------------------------------------------------
  // /\  Configure these to enable support for automated emails.
  // ||  (Important for password recovery, verification, contact form, etc.)
  //--------------------------------------------------------------------------

  // The sender that all outgoing emails will appear to come from.
  fromEmailAddress: "noreply@example.com",
  fromName: "The NEW_APP_NAME Team",

  // Email address for receiving support messages & other correspondences.
  // > If you're using the default privacy policy, this will be referenced
  // > as the contact email of your "data protection officer" for the purpose
  // > of compliance with regulations such as GDPR.
  internalEmailAddress: "support+development@example.com",

  // Whether to require proof of email address ownership any time a new user
  // signs up, or when an existing user attempts to change their email address.
  verifyEmailAddresses: false,

  /**************************************************************************
   *                                                                         *
   * Billing & payments configuration                                        *
   *                                                                         *
   * (https://dashboard.stripe.com/account/apikeys)                          *
   *                                                                         *
   **************************************************************************/
  // stripePublishableKey: 'pk_test_Zzd814nldl91104qor5911gjald',
  // stripeSecret: 'sk_test_Zzd814nldl91104qor5911gjald',
  //--------------------------------------------------------------------------
  // /\  Configure these to enable support for billing features.
  // ||  (Or if you don't need billing, feel free to remove them.)
  //--------------------------------------------------------------------------

  /***************************************************************************
   *                                                                          *
   * Any other custom config this Sails app should use during development.    *
   *                                                                          *
   ***************************************************************************/
  BACKEND: {
    //Alwas SETTING URL = window.location.pathname to MATCH on frontend (main.js)
    SIGNUP: {
      ID: "signup",
      URL: "/backend/signup",
    },
    LOGIN: {
      ID: "login",
      URL: "/backend/login",
    },
    FORGOT_PASSWORD: {
      ID: "fotgotpassword",
      URL: "/backend/password/forgot",
    },
    LOGOUT: {
      ID: "logout",
      URL: "/backend/logout",
    },
    DASHBOARD: {
      //Thong tin chung
      ID: "dashboard",
      URL: "/backend/dashboard",
    },
    ACTION: {
      //Hoat dong
      ID: "action",
      URL: "/backend/action",
    },
    TAXONOMY: {
      //Danh sach taxonomy
      ID: "taxonomy",
      URL: "/backend/taxonomy",
    },
    CATEGORY: {
      //Danh sach category
      ID: "category",
      URL: "/backend/category",
    },
    PLAYLIST: {
      //Danh sach playlist
      ID: "playlist",
      URL: "/backend/playlist",
    },
    TAG: {
      ID: "tag",
      URL: "/backend/tag",
    },
    SETTING: {
      ID: "setting",
      URL: "/backend/setting",
    },
    VIDEO_ADD: {
      //Addvideo
      ID: "videoadd",
      URL: "/backend/video/add",
    },
    VIDEO_LIST: {
      ID: "videolist",
      URL: "/backend/video/list",
    },
    VIDEO_EDIT: {
      ID: "videoedit",
      URL: "/backend/video/edit",
    },
    POST_ADD: {
      //Add post
      ID: "postadd",
      URL: "/backend/post/add",
    },
    POST_LIST: {
      ID: "postlist",
      URL: "/backend/post/list",
    },
    POST_EDIT: {
      ID: "postedit",
      URL: "/backend/post/edit",
    },
    NOTIFICATION_ADD: {
      //Add notification
      ID: "notificationadd",
      URL: "/backend/notification/add",
    },
    NOTIFICATION_LIST: {
      ID: "notificationlist",
      URL: "/backend/notification/list",
    },
    NOTIFICATION_EDIT: {
      ID: "notificationedit",
      URL: "/backend/notification/edit",
    },
    STUDENT_ADD: {
      //Add STUDENT
      ID: "studentadd",
      URL: "/backend/student/add",
    },
    STUDENT_LIST: {
      ID: "studentlist",
      URL: "/backend/student",
    },
    STUDENT_EDIT: {
      ID: "studentedit",
      URL: "/backend/student/edit",
    },
    USER_ADD: {
      //Add nhan vien
      ID: "useradd",
      URL: "/backend/user/add",
    },
    USER_LIST: {
      ID: "userlist",
      URL: "/backend/user/list",
    },
    USER_EDIT: {
      ID: "useredit",
      URL: "/backend/user/edit",
    },
    USER_ROLE: {
      ID: "userrole",
      URL: "/backend/user/role",
    },
    CLASS: {
      ID: "class",
      URL: "/backend/class",
    },
    CHANGECLASS: {
      ID: "changeClass",
      URL: "/backend/changeClass",
    },
    COURSE_SESSION: {
      ID: "courseSession",
      URL: "/backend/courseSession",
    },
    ADMIN: {
      ID: "admin",
      URL: "?type=0",
    },
    STAFF: {
      ID: "staff",
      URL: "?type=1",
    },
    TIMELINE: {
      //Schedule
      ID: "timeline",
      URL: "/backend/timeline",
    },
    ACCOUNT: {
      ID: "account",
      URL: "/backend/account",
    },
    PROFILE: {
      ID: "profile",
      URL: "/backend/account/profile",
    },
    ALL: {
      ID: "all",
      URL: "?status=-1",
    },
    ACTIVE: {
      ID: "publish",
      URL: "?status=1",
    },
    DRAFT: {
      ID: "draft",
      URL: "?status=0",
    },
    TRASH: {
      ID: "trash",
      URL: "?status=3",
    },
    PAID: {
      ID: "all",
      URL: "?paid=-1",
    },
    UNPAID: {
      ID: "unpaid",
      URL: "?paid=0",
    },
    PAIDED: {
      ID: "paided",
      URL: "?paid=1",
    },
    SCHEDULE: {
      ID: "schedule",
      URL: "/backend/activity/schedule",
    },
    MENU: {
      ID: "menu",
      URL: "/backend/activity/menu",
    },
    MENU_ADD: {
      ID: "menuadd",
      URL: "/backend/menu/add",
    },
    MENU_EDIT: {
      ID: "menuedit",
      URL: "/backend/menu/edit",
    },
    SCHEDULE_ADD: {
      ID: "scheduleadd",
      URL: "/backend/schedule/add",
    },
    ALBUM_ADD: {
      ID: "albumadd",
      URL: "/backend/album/add",
    },
    ALBUM_EDIT: {
      ID: "albumedit",
      URL: "/backend/album/edit",
    },
    IMPORT_EXCEL: {
      ID: "import",
      URL: "/backend/import",
    },
    IMPORT_EXCEL_PARENT: {
      ID: "import",
      URL: "/backend/importParent",
    },
    IMPORT_EXCEL_FOOD: {
      ID: "import",
      URL: "/backend/importFood",
    },
    IMPORT_EXCEL_SUBJECT: {
      ID: "import",
      URL: "/backend/importSubject",
    },
    PARENT_ADD: {
      //Add parent
      ID: "parentadd",
      URL: "/backend/parent/add",
    },
    CLASS_ATTENDENT: {
      ID: "classAttendent",
      URL: "/backend/classAttendent/",
    },
  },
  URL: {
    NOTIFICATION: "/notification",
  },
  LANGUAGES: [
    // { code: 'ar', name: 'Arabic' },
    // { code: 'bn', name: 'Bengali' },
    // { code: 'zh', name: 'Chinese' },
    // {code: 'de', name: 'Deutsch'},
    {
      code: "en",
      name: "English",
    },
    {
      code: "fr",
      name: "Français",
    },
    // { code: 'hi', name: 'Hindi' },
    // {code: 'it', name: 'Italiano'},
    // { code: 'jp', name: 'Japanese' },
    {
      code: "pt",
      name: "Portuguese",
    },
    {
      code: "ru",
      name: "Russian",
    },
    {
      code: "es",
      name: "Spanish",
    },
    {
      code: "vi",
      name: "Vietnamese",
    },
  ],
  DISPLAYNAMES: [
    {
      code: "firstlast",
      name: "First Name Last Name",
    },
    {
      code: "lastfirst",
      name: "Last Name First Name",
    },
    // { code: 'first', name: 'First Name' },
    // { code: 'last', name: 'Last Name'},
  ],
  PAGE: {
    LOGIN: "login",
    SIGNUP: "signup",
    USER_STAFF: "user.staff",
    USER_MEMBER: "user.member",
  },
  PAGING: {
    LIMIT: 12,
  },
  PAID: {
    UNPAID: 0,
    PAIDED: 1,
  },
  STATUS: {
    ALL: -1,
    DRAFT: 0,
    ACTIVE: 1,
    SCHEDULE: 2,
    TRASH: 3,
    DONE: 4,

    // For feeInvoice
    INVOICE_DRAFT: -2,
    UNPAID: -1,
    PENDING: 0,
    PAID: 1,
    IN_PROCESS: 2,

    //For Attendent
    ABSENT: 0,
    ATTENDANT: 1,
  },
  CURRENCIES: [
    {
      code: "USD",
      title: "USD",
    },
    {
      code: "EUR",
      title: "EURO",
    },
    {
      code: "VND",
      title: "Việt Nam Đồng",
    },
    {
      code: "GBP",
      title: "GBP",
    },
    {
      code: "RUB",
      title: "RUB",
    },
    {
      code: "JPY",
      title: "JPY",
    },
  ],
  STUDENT_STATUS: {
    ACTIVE: 1,
    // LEAVE: 2,
    RESERVE: 2,
    DONE: 3,
    DRAFT: 4,
    INACTIVE: 5,
    TRASH: 6,
  },
  TYPE: {
    //COMMON
    ALL: -1,

    //For USER
    ACCOUNTANT: 4,
    SCHOOLADMIN: 3,
    DRIVER: 2,
    TEACHER: 1,
    ASSISTANT: 5,

    MOTHER: 0,
    FATHER: 1,
    OTHERS: 2,

    //For gender
    FEMALE: 0,
    MALE: 1,

    //For Media
    IMAGE: 0,
    VIDEO: 1,
    FILE: 2,

    //For taxonomy
    CATEGORY: "category",
    TAG: "tag",
    PLAYLIST: "playlist",

    SINGLE: "single",
    MULTI: "multi",
    //For Thumb
    VERTICAL: "vertical",
    HORIZONTAL: "horizontal",
    SQUARE: "square",

    //For Setting
    GENERAL: 0,
    WEB: 1,
    MOBILE: 2,

    //For Message
    PRIVATE: 0,
    PUBLIC: 1,

    //For notification
    NEWS_PARENT: -1,
    NEWS_ALL: 0,
    FEE_INVOICE: 1,
    ALBUM: 2,
    MENU: 3,
    SUBJECT: 4,
    ATTENDENT: 5,
    DAY_OFF: 6,
    PICK_UP: 7,
    NEWS_TEACHER: 8,

    //For day off
    MULTI_DAY: 1,
    SINGLE_DAY: 2,

    //For payment method
    CASH: 0,
    BANK: 1,
    STRIPE: 2,

    //For event
    SINGLE: 0,
    RECURRING: 1,

    //For postType
    NEWS: 0,
    PAGE: 1,
  },
  UPLOAD: {
    EXTENSION: [".png", ".jpg", ".jpeg", ".gif"],
    AVATAR: {
      width: 250,
      height: 250,
      name: "avatar",
    },
    SIZES: [
      {
        width: 1280,
        height: "auto",
        name: "origin",
        type: "origin",
      },
      {
        width: 150,
        height: 113,
        name: "150x113",
        type: "thumbnail",
      },
      {
        width: 240,
        height: 180,
        name: "240x180",
        type: "medium",
      },
      {
        width: 740,
        height: 555,
        name: "740x555",
        type: "medium_large",
      },
    ],
    PATH_FOLDER: process.env.PATH_FOLDER || "/var/www/onjiz-edu/",
  },
  // SERVER_KEY: 'AAAADnmmGfs:APA91bHTgONg0ngL5YuXXf0EDou5CHD84eA6x9V8TI50UOTndmYs-MNcNy7RSKswcraK1yXYDql5IuIgaxpvlrgbwm795EKvMjuvuAo8YfvzvEDS5jtZ2VKVZALGFBBP9UCc2_qA2zkc'
  SERVER_KEY:
    "AAAAGjesvnk:APA91bEOKsZnNiEPqkznz3lwE5sK5j6ggaXT4srns2KOsbIp8SSc2TXfiGmf8orWF7eMt73wfOPTZgO1TiNll_e973-sw-VwDHBIg2bmCv4KXcK7-plghKjDbrIqOMkgbCNvRaK-hFRd",
  STRIPE_API_KEY: "sk_test_rGARQzzCIWDzqfSzEt94gnFD00mhijMPYQ",
  GOOGLE_PUBLIC_KEY: "6LdmF9gfAAAAAD8MhzHbuzD17wCxyQqptdcQaFRA",
  GOOGLE_SECRET_KEY: "6LdmF9gfAAAAAAg_Yi_J4qo4j-m9XdZEhqHDcE5O",
  SERVER: [
    {
      code: "s01",
      name: "Server 01",
      ip: "10.10.10.10",
    },
    {
      code: "s02",
      name: "Server 02",
      ip: "20.20.20.20",
    },
    {
      code: "s03",
      name: "Server 03",
      ip: "30.30.30.30",
    },
    {
      code: "s04",
      name: "Server 04",
      ip: "40.40.40.40",
    },
  ],
};
