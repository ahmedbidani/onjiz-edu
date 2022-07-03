/**
 * cloud.setup.js
 *
 * Configuration for this Sails app's generated browser SDK ("Cloud").
 *
 * Above all, the purpose of this file is to provide endpoint definitions,
 * each of which corresponds with one particular route+action on the server.
 *
 * > This file was automatically generated.
 * > (To regenerate, run `sails run rebuild-cloud-sdk`)
 */

Cloud.setup({

  /* eslint-disable */
  methods: {
    //SUPER ADMIN
    "registerSA": {
      "verb": "POST",
      "url": "/api/v1/sa/register"
    },
    "addSchool": {
      "verb": "POST",
      "url": "/api/v1/sa/school/add"
    },
    "editSchool": {
      "verb": "PATCH",
      "url": "/api/v1/sa/school/edit/:id"
    },
    "deleteSchool": {
      "verb": "PATCH",
      "url": "/api/v1/sa/school/delete1/:ids"
    },
    "addSchoolAdmin": {
      "verb": "POST",
      "url": "/api/v1/sa/school-:schoolId/admin/add"
    },
    "editSchoolAdmin": {
      "verb": "PATCH",
      "url": "/api/v1/sa/school-:schoolId/admin/edit/:id"
    },
    "uploadSchoolPhoto": {
      "verb": "POST",
      "url": "/api/v1/sa/uploadSchoolPhoto"
    },
    "addRole": {
      "verb": "POST",
      "url": "/api/v1/sa/role/add"
    },
    "editRole": {
      "verb": "PUT",
      "url": "/api/v1/sa/role/edit/:id"
    },
    "deleteRole": {
      "verb": "PUT",
      "url": "/api/v1/sa/role/delete/:id"
    },
    "getRole": {
      "verb": "GET",
      "url": "/api/v1/sa/role/:id"
    },
    "addAgency": {
      "verb": "POST",
      "url": "/api/v1/sa/agency/add"
    },
    "editAgency": {
      "verb": "PATCH",
      "url": "/api/v1/sa/agency/edit/:id"
    },
    "trashAgency": {
      "verb": "POST",
      "url": "/api/v1/sa/agency/trash/:ids",
      "args": ["ids"]
    },
    "addSchoolAG": {
      "verb": "POST",
      "url": "/api/v1/agency/school/add"
    },
    "editSchoolAG": {
      "verb": "PATCH",
      "url": "/api/v1/agency/school/edit/:id"
    },
    "deleteSchoolAG": {
      "verb": "PATCH",
      "url": "/api/v1/agency/school/delete/:ids"
    },
    "addSchoolAdminAG": {
      "verb": "POST",
      "url": "/api/v1/agency/school-:schoolId/admin/add"
    },
    "editSchoolAdminAG": {
      "verb": "PATCH",
      "url": "/api/v1/agency/school-:schoolId/admin/edit/:id"
    },

    //SCHOOL ADMIN
    "addSetting": {
      "verb": "POST",
      "url": "/api/v1/installation/addSetting"
    },
    "uploadSAHomeSetting": {
      "verb": "POST",
      "url": "/api/v1/installation/upload",
      "args": []
    },
    "addCourseSessionSA": {
      "verb": "POST",
      "url": "/api/v1/installation/addDefaultCourseSession",
      "args": []
    },

    //ALBUM
    "addAlbum": {
      "verb": "POST",
      "url": "/api/v1/backend/album/add"
    },
    "editAlbum": {
      "verb": "PATCH",
      "url": "/api/v1/backend/album/edit/:id"
    },
    "trashAlbum": {
      "verb": "POST",
      "url": "/api/v1/backend/album/trash/:ids",
      "args": ["ids"]
    },
    "deleteCmt": {
      "verb": "PATCH",
      "url": "/api/v1/backend/album/deleteCmt/:id"
    },
    "switchStatusAlbum": {
      "verb": "PATCH",
      "url": "/api/v1/backend/album/switchStatus/:id"
    },
    //FEEDBACK
    "editFeedback": {
      "verb": "PATCH",
      "url": "/api/v1/backend/feedback/edit/:id",
      "args": ["id", "message"]
    },
    "addFeedback": {
      "verb": "POST",
      "url": "/api/v1/backend/feedback/add",
      "args": ["id","reciver", "message"]
    },
    //MEDIA
    "listMedia": {
      "verb": "GET",
      "url": "/api/v1/backend/media/list",
      "args": []
    },
    "listMediaByIds": {
      "verb": "GET",
      "url": "/api/v1/backend/media/list/ids",
      "args": ["ids"]
    },
    //TAXONOMY
    "addTaxonomy": {
      "verb": "POST",
      "url": "/api/v1/backend/taxonomy/add",
      "args": ["title", "description", "type", "thumbtype", "videosOfCategory", "videosOfPlaylist", "videosOfCharacter"]
    },
    "getTaxonomy": {
      "verb": "GET",
      "url": "/api/v1/backend/taxonomy/:id",
      "args": ["id"]
    },
    "editTaxonomy": {
      "verb": "POST",
      "url": "/api/v1/backend/taxonomy/:id",
      "args": ["title", "description", "type"]
    },
    "trashTaxonomy": {
      "verb": "POST",
      "url": "/api/v1/backend/taxonomy/trash/:ids",
      "args": ["ids"]
    },
    "searchTaxonomy": {
      "verb": "GET",
      "url": "/api/v1/backend/taxonomy/search",
      "args": ["type", "status"]
    },
    "totalTaxonomy": {
      "verb": "GET",
      "url": "/api/v1/backend/taxonomy/total",
      "args": ["type", "status"]
    },
    "switchStatusTaxonomy": {
      "verb": "PATCH",
      "url": "/api/v1/backend/taxonomy/switchStatus/:id"
    },
    //VIDEO
    "addVideo": {
      "verb": "POST",
      "url": "/api/v1/backend/video/add",
      "args": ["title", "description", "type", "thumbtype", "videosOfCategory", "videosOfPlaylist", "videosOfCharacter"]
    },
    "editVideo": {
      "verb": "PATCH",
      "url": "/api/v1/backend/video/edit/:id",
      "args": ["title", "description", "type", "thumbtype", "videosOfCategory", "videosOfPlaylist", "videosOfCharacter"]
    },
    "uploadVideoThumbnail": {
      "verb": "POST",
      "url": "/api/v1/backend/video/uploadThumbnail",
      "args": []
    },
    "trashVideo": {
      "verb": "POST",
      "url": "/api/v1/backend/video/trash/:ids",
      "args": ["ids"]
    },
    //POST
    "addPost": {
      "verb": "POST",
      "url": "/api/v1/backend/post/add",
      "args": ["title", "description", "type", "thumbtype"]
    },
    "getPost": {
      "verb": "GET",
      "url": "/api/v1/backend/post/get/:id",
      "args": ["id"]
    },
    "editPost": {
      "verb": "PATCH",
      "url": "/api/v1/backend/post/edit/:id",
      "args": ["title", "description", "type", "thumbnail", "status"]
    },
    "uploadPostThumbnail": {
      "verb": "POST",
      "url": "/api/v1/backend/post/uploadThumbnail",
      "args": []
    },
    "trashPost": {
      "verb": "POST",
      "url": "/api/v1/backend/post/trash/:ids",
      "args": ["ids"]
    },
    "switchStatusPost": {
      "verb": "PATCH",
      "url": "/api/v1/backend/post/switchStatus/:id"
    },
    //NOTIFICATION
    "getNotification": {
      "verb": "GET",
      "url": "/api/v1/backend/notification/get/:id",
      "args": ["id"]
    },
    "addNotification": {
      "verb": "POST",
      "url": "/api/v1/backend/notification/add",
      "args": ["title", "message", "status", "classes"]
    },
    "editNotification": {
      "verb": "PATCH",
      "url": "/api/v1/backend/notification/edit/:id",
      "args": ["title", "message", "status", "classes"]
    },
    "pushNotification": {
      "verb": "POST",
      "url": "/api/v1/backend/notification/pushFirebase/:id",
      "args": ["id"]
    },
    "trashNotification": {
      "verb": "POST",
      "url": "/api/v1/backend/notification/trash/:ids",
      "args": ["ids"]
    },
    // "uploadSettingThumbnail": {
    //   "verb": "POST",
    //   "url": "/api/v1/backend/setting/uploadThumbnail",
    //   "args": []
    // },
    // "removeItemSetting": {
    //   "verb": "PATCH",
    //   "url": "/api/v1/backend/setting/removeItemBanner",
    //   "args": []
    // },
    "exportStudents": {
      "verb": "GET",
      "url": "/api/v1/backend/export/students"
    },
    //EXPORT EXCEL PARENTS
    "exportParents": {
      "verb": "GET",
      "url": "/api/v1/backend/export/parents"
    },
    //SCHEDULE
    "addSchedule": {
      "verb": "POST",
      "url": "/api/v1/backend/schedule/add",
      "args": ["title", "description", "type", "thumbtype", "videosOfCategory", "videosOfPlaylist", "videosOfCharacter"]
    },
    "getSchedule": {
      "verb": "GET",
      "url": "/api/v1/backend/schedule/:dateUse",
      "args": ["dateUse"]
    },
    "editSchedule": {
      "verb": "POST",
      "url": "/api/v1/backend/schedule/edit/:dateUse",
      "args": ["dateUse"]
    },
    "trashSchedule": {
      "verb": "POST",
      "url": "/api/v1/backend/schedule/trash/:ids",
      "args": ["ids"]
    },
    "searchSchedule": {
      "verb": "GET",
      "url": "/api/v1/backend/schedule/search",
      "args": ["type", "status"]
    },
    "totalSchedule": {
      "verb": "GET",
      "url": "/api/v1/backend/schedule/total",
      "args": ["type", "status"]
    },
    "importScheduleExcel": {
      "verb": "POST",
      "url": "/api/v1/backend/import/importScheduleExcel"
    },
    "deleteSchedule": {
      "verb": "PATCH",
      "url": "/api/v1/backend/schedule/delete/:id/:time",
    },
    //MENU
    "addMenu": {
      "verb": "POST",
      "url": "/api/v1/backend/menu/add",
      "args": []
    },
    "getMenu": {
      "verb": "GET",
      "url": "/api/v1/backend/menu/get/:id",
      "args": ["id"]
    },
    "getMenuByDateUse": {
      "verb": "GET",
      "url": "/api/v1/backend/menu/getByDateUse/:dateUse",
      "args": ["dateUse"]
    },
    "editMenu": {
      "verb": "POST",
      "url": "/api/v1/backend/menu/edit",
      "args": []
    },
    "deleteMenu": {
      "verb": "PATCH",
      "url": "/api/v1/backend/menu/delete/:id",
    },
    "importMenuExcel": {
      "verb": "POST",
      "url": "/api/v1/backend/import/importMenuExcel"
    },
    "getAttendent": {
      "verb": "GET",
      "url": "/api/v1/backend/class-:classId/attendent/:id/",
      "args": ["id", "classId"]
    },
    "editAttendent": {
      "verb": "POST",
      "url": "/api/v1/backend/class-:classId/attendent/:id/",
      "args": ["id", "time", "parent"]
    },
    "checkInAttendent": {
      "verb": "POST",
      "url": "/api/v1/backend/attendent/checkIn/:id/",
      "args": []
    },
    // "addAttendent": {
    //   "verb": "POST",
    //   "url": "/api/v1/backend/attendent/add",
    //   "args": ["title", "description", "type", "thumbtype", "videosOfCategory", "videosOfPlaylist", "videosOfCharacter"]
    // },
    // "getAttendent": {
    //   "verb": "GET",
    //   "url": "/api/v1/backend/attendent/:id",
    //   "args": ["id"]
    // },
    // "editAttendent": {
    //   "verb": "POST",
    //   "url": "/api/v1/backend/attendent/:id",
    //   "args": ["title", "description", "type", "thumbtype", "videosOfCategory", "videosOfPlaylist", "videosOfCharacter"]
    // },
    // "trashAttendent": {
    //   "verb": "POST",
    //   "url": "/api/v1/backend/attendent/trash/:ids",
    //   "args": ["ids"]
    // },
    // "searchAttendent": {
    //   "verb": "GET",
    //   "url": "/api/v1/backend/attendent/search",
    //   "args": ["type", "status"]
    // },
    // "totalAttendent": {
    //   "verb": "GET",
    //   "url": "/api/v1/backend/attendent/total",
    //   "args": ["type", "status"]
    // },
    // PICKUP
    // "checkExisted": {
    //   "verb": "GET",
    //   "url": "/api/v1/backend/class-:classId/pickup",
    //   "args": ["classId", "date"]
    // },
    "getPickUp": {
      "verb": "GET",
      "url": "/api/v1/backend/class-:classId/pickup/:id/",
      "args": ["id", "classId"]
    },
    "editPickUp": {
      "verb": "POST",
      "url": "/api/v1/backend/class-:classId/pickup/:id/",
      "args": ["id", "classId", "studentId", "date", "time", "parent"]
    },
    //STUDENT
    "addStudent": {
      "verb": "POST",
      "url": "/api/v1/backend/student/add",
      "args": ["title", "description", "type", "thumbtype", "videosOfCategory", "videosOfPlaylist", "videosOfCharacter", "thumbnail"]
    },
    "getStudent": {
      "verb": "GET",
      "url": "/api/v1/backend/student/:id",
      "args": ["id"]
    },
    "editStudent": {
      "verb": "POST",
      "url": "/api/v1/backend/student/:id",
      "args": ["title", "description", "type", "thumbtype", "videosOfCategory", "videosOfPlaylist", "videosOfCharacter", "thumbnail"]
    },
    "trashStudent": {
      "verb": "POST",
      "url": "/api/v1/backend/student/trash/:ids",
      "args": ["ids"]
    },
    "moveStudent": {
      "verb": "POST",
      "url": "/api/v1/backend/student/move/:ids",
      "args": ["ids", "oldClass", "newClass"]
    },
    "promoteStudent": {
      "verb": "POST",
      "url": "/api/v1/backend/student/promote/:ids",
      "args": ["ids", "newClass"]
    },
    "searchStudent": {
      "verb": "GET",
      "url": "/api/v1/backend/student/search",
      "args": ["type", "status"]
    },
    "totalStudent": {
      "verb": "GET",
      "url": "/api/v1/backend/student/total",
      "args": ["type", "status"]
    },
    "searchStudentMaster": {
      "verb": "GET",
      "url": "/api/v1/backend/studentMaster/search",
      "args": ["type", "status"]
    },
    "totalStudentMaster": {
      "verb": "GET",
      "url": "/api/v1/backend/studentMaster/total",
      "args": ["type", "status"]
    },
    "filterStudentMaster": {
      "verb": "GET",
      "url": "/api/v1/backend/studentMaster/filter",
      "args": ["type", "status"]
    },
    "uploadStudentExcel": {
      "verb": "POST",
      "url": "/api/v1/backend/student/uploadExcel",
      "args": []
    },
    "importStudentExcel": {
      "verb": "POST",
      "url": "/api/v1/backend/import/importStudentExcel",
      "args": ["classObj"]
    },
    "reportStudent": {
      "verb": "POST",
      "url": "/api/v1/backend/report/reportStudent",
      "args": ["studentObj"]
    },
    "uploadStudentThumbnail": {
      "verb": "POST",
      "url": "/api/v1/backend/student/uploadThumbnail",
      "args": []
    },
    "switchStatusStudent": {
      "verb": "PATCH",
      "url": "/api/v1/backend/student/switchStatus/:id"
    },
    //
    // BRANCH
    "addBranch": {
      "verb": "POST",
      "url": "/api/v1/backend/branch/add",
      "args": ["title", "status", "ofClass"]
    },
    "getBranch": {
      "verb": "GET",
      "url": "/api/v1/backend/branch/get/:id",
      "args": ["id"]
    },
    "editBranch": {
      "verb": "PATCH",
      "url": "/api/v1/backend/branch/edit/:id",
      "args": ["title", "status", "ofBranch"]
    },
    "trashBranch": {
      "verb": "PATCH",
      "url": "/api/v1/backend/branch/trash/:ids",
      "args": ["ids"]
    },
    "searchBranch": {
      "verb": "GET",
      "url": "/api/v1/backend/branch/search",
      "args": ["type", "status"]
    },
    "switchStatusBranch": {
      "verb": "PATCH",
      "url": "/api/v1/backend/branch/switchStatus/:id"
    },
    //
    //CLASS
    "addClass": {
      "verb": "POST",
      "url": "/api/v1/backend/class/add",
      "args": ["title", "status", "ofClass"]
    },
    "getClass": {
      "verb": "GET",
      "url": "/api/v1/backend/class/:id",
      "args": ["id"]
    },
    "editClass": {
      "verb": "POST",
      "url": "/api/v1/backend/class/:id",
      "args": ["title", "status", "ofClass"]
    },
    "trashClass": {
      "verb": "POST",
      "url": "/api/v1/backend/class/trash/:ids",
      "args": ["ids"]
    },
    "searchClass": {
      "verb": "GET",
      "url": "/api/v1/backend/class/search",
      "args": ["type", "status"]
    },
    "searchClassBySession": {
      "verb": "GET",
      "url": "/api/v1/backend/class/searchBySession",
      "args": ["sessionId", "classId"]
    },
    "totalClass": {
      "verb": "GET",
      "url": "/api/v1/backend/class/total",
      "args": ["title", "status", "ofClass"]
    },
    "switchStatusClass": {
      "verb": "PATCH",
      "url": "/api/v1/backend/class/switchStatus/:id"
    },
    //
    "confirmEmail": {
      "verb": "GET",
      "url": "/backend/email/confirm",
      "args": ["token"]
    },
    "logout": {
      "verb": "GET",
      "url": "/api/v1/backend/account/logout",
      "args": []
    },
    "updatePassword": {
      "verb": "PUT",
      "url": "/api/v1/backend/account/update-password",
      "args": ["password"]
    },
    "updateProfile": {
      "verb": "PUT",
      "url": "/api/v1/backend/account/update-profile",
      "args": ["firstName", "lastName", "emailAddress"]
    },
    "login": {
      "verb": "PUT",
      "url": "/api/v1/backend/entrance/login",
      "args": ["emailAddress", "password"]
    },
    "signup": {
      "verb": "POST",
      "url": "/api/v1/backend/entrance/signup",
      "args": ["emailAddress", "password", "firstName", "lastName", "phone"]
    },
    "sendPasswordRecoveryEmail": {
      "verb": "POST",
      "url": "/api/v1/backend/entrance/send-password-recovery-email",
      "args": ["emailAddress"]
    },
    "updatePasswordAndLogin": {
      "verb": "POST",
      "url": "/api/v1/backend/entrance/update-password-and-login",
      "args": ["password", "token"]
    },

    //-----------------Project-------------------
    "addProject": {
      "verb": "POST",
      "url": "/api/v1/backend/project/add",
      "args": ["code", "name", "slots", "type", "status"]
    },
    "getProject": {
      "verb": "GET",
      "url": "/api/v1/backend/project/get/:id",
      "args": ["id"]
    },
    "editProject": {
      "verb": "PATCH",
      "url": "/api/v1/backend/project/edit/:id",
      "args": ["code", "name", "slots", "ponds", "status", "farm", "participants"]
    },
    "trashProject": {
      "verb": "PATCH",
      "url": "/api/v1/backend/project/trash/:ids",
      "args": ["ids"]
    },
    "deleteProject": {
      "verb": "PATCH",
      "url": "/api/v1/backend/project/delete/:id",
      "args": ["ids"]
    },
    "searchProject": {
      "verb": "GET",
      "url": "/api/v1/backend/project/search",
      "args": ["type", "status"]
    },
    "totalProject": {
      "verb": "GET",
      "url": "/api/v1/backend/project/total",
      "args": ["type", "status"]
    },

    //-----------------Food-------------------
    "addFood": {
      "verb": "POST",
      "url": "/api/v1/backend/food/add",
      "args": ["title", "description", "nutrition", "type", "status"]
    },
    "getFood": {
      "verb": "GET",
      "url": "/api/v1/backend/food/get/:id",
      "args": ["id"]
    },
    "editFood": {
      "verb": "PATCH",
      "url": "/api/v1/backend/food/edit/:id",
      "args": ["title", "description", "nutrition", "type", "status"]
    },
    "trashFood": {
      "verb": "POST",
      "url": "/api/v1/backend/food/trash/:ids",
      "args": ["ids"]
    },
    "deleteFood": {
      "verb": "PATCH",
      "url": "/api/v1/backend/food/delete/:ids",
      "args": ["ids"]
    },
    "searchFood": {
      "verb": "GET",
      "url": "/api/v1/backend/food/search",
      "args": ["type", "status"]
    },
    "totalFood": {
      "verb": "GET",
      "url": "/api/v1/backend/food/total",
      "args": ["type", "status"]
    },
    "switchStatusFood": {
      "verb": "PATCH",
      "url": "/api/v1/backend/food/switchStatus/:id"
    },
    "importFoodExcel": {
      "verb": "POST",
      "url": "/api/v1/backend/import/importFoodExcel"
    },
    //-----------------FoodGroup-------------------
    "addFoodGroup": {
      "verb": "POST",
      "url": "/api/v1/backend/foodgroup/add",
      "args": ["title", "alias", "description", "order", "type", "status"]
    },
    "getFoodGroup": {
      "verb": "GET",
      "url": "/api/v1/backend/foodgroup/get/:id",
      "args": ["id"]
    },
    "editFoodGroup": {
      "verb": "PATCH",
      "url": "/api/v1/backend/foodgroup/edit/:id",
      "args": ["title", "alias", "description", "order", "type", "status"]
    },
    "trashFoodGroup": {
      "verb": "PATCH",
      "url": "/api/v1/backend/foodgroup/trash/:ids",
      "args": ["ids"]
    },
    "deleteFoodGroup": {
      "verb": "PATCH",
      "url": "/api/v1/backend/foodgroup/delete/:ids",
      "args": ["ids"]
    },
    "searchFoodGroup": {
      "verb": "GET",
      "url": "/api/v1/backend/foodgroup/search",
      "args": ["type", "status"]
    },
    "totalFoodGroup": {
      "verb": "GET",
      "url": "/api/v1/backend/foodgroup/total",
      "args": ["type", "status"]
    },
    //-----------------Subject-------------------
    "addSubject": {
      "verb": "POST",
      "url": "/api/v1/backend/subject/add",
      "args": ["title", "description", "type", "status"]
    },
    "getSubject": {
      "verb": "GET",
      "url": "/api/v1/backend/subject/get/:id",
      "args": ["id"]
    },
    "editSubject": {
      "verb": "PATCH",
      "url": "/api/v1/backend/subject/edit/:id",
      "args": ["title", "description", "type", "status"]
    },
    "trashSubject": {
      "verb": "POST",
      "url": "/api/v1/backend/subject/trash/:ids",
      "args": ["ids"]
    },
    "deleteSubject": {
      "verb": "PATCH",
      "url": "/api/v1/backend/subject/delete/:ids",
      "args": ["ids"]
    },
    "searchSubject": {
      "verb": "GET",
      "url": "/api/v1/backend/subject/search",
      "args": ["type", "status"]
    },
    "totalSubject": {
      "verb": "GET",
      "url": "/api/v1/backend/subject/total",
      "args": ["type", "status"]
    },
    "importSubjectExcel": {
      "verb": "POST",
      "url": "/api/v1/backend/import/importSubjectExcel"
    },
    "switchStatusSubject": {
      "verb": "PATCH",
      "url": "/api/v1/backend/subject/switchStatus/:id"
    },
    //-----------------Course session-------------------
    "addCourseSession": {
      "verb": "POST",
      "url": "/api/v1/backend/courseSession/add",
      "args": ["title", "code", "startTime", "endTime", "status"]
    },
    "getCourseSession": {
      "verb": "GET",
      "url": "/api/v1/backend/courseSession/get/:id",
      "args": ["id"]
    },
    "editCourseSession": {
      "verb": "PATCH",
      "url": "/api/v1/backend/courseSession/edit/:id",
      "args": ["id"]
    },
    "trashCourseSession": {
      "verb": "POST",
      "url": "/api/v1/backend/courseSession/trash/:ids",
      "args": ["ids"]
    },
    "deleteCourseSession": {
      "verb": "PATCH",
      "url": "/api/v1/backend/courseSession/delete/:ids",
      "args": ["ids"]
    },
    "searchCourseSession": {
      "verb": "GET",
      "url": "/api/v1/backend/courseSession/search",
      "args": ["status"]
    },
    "totalCourseSession": {
      "verb": "GET",
      "url": "/api/v1/backend/courseSession/total",
      "args": ["status"]
    },
    "switchStatusCourseSession": {
      "verb": "PATCH",
      "url": "/api/v1/backend/courseSession/switchStatus/:id"
    },
    "switchSessionCourseSession": {
      "verb": "PATCH",
      "url": "/api/v1/backend/courseSession/switchSession/:id"
    },
    //-----------------Participant-------------------
    "addParticipant": {
      "verb": "POST",
      "url": "/api/v1/backend/participant/add",
      "args": ["task", "others", "type", "status"]
    },
    "getParticipant": {
      "verb": "GET",
      "url": "/api/v1/backend/participant/get/:id",
      "args": ["id"]
    },
    "editParticipant": {
      "verb": "PATCH",
      "url": "/api/v1/backend/participant/edit/:id",
      "args": ["task", "others", "type", "status"]
    },
    "trashParticipant": {
      "verb": "PATCH",
      "url": "/api/v1/backend/participant/trash/:ids",
      "args": ["ids"]
    },
    "deleteParticipant": {
      "verb": "PATCH",
      "url": "/api/v1/backend/participant/delete/:ids",
      "args": ["ids"]
    },
    "searchParticipant": {
      "verb": "GET",
      "url": "/api/v1/backend/participant/search",
      "args": ["type", "status"]
    },
    "totalParticipant": {
      "verb": "GET",
      "url": "/api/v1/backend/participant/total",
      "args": ["type", "status"]
    },
    // Unit
    "addUnit": {
      "verb": "POST",
      "url": "/api/v1/backend/unit/add",
      "args": ["name", "refer", "type", "status"]
    },
    "getUnit": {
      "verb": "GET",
      "url": "/api/v1/backend/unit/get/:id",
      "args": ["id"]
    },
    "editUnit": {
      "verb": "PATCH",
      "url": "/api/v1/backend/unit/edit/:id",
      "args": ["name", "refer", "type", "status"]
    },
    "trashUnit": {
      "verb": "PATCH",
      "url": "/api/v1/backend/unit/trash/:ids",
      "args": ["ids"]
    },
    "deleteUnit": {
      "verb": "PATCH",
      "url": "/api/v1/backend/unit/delete/:ids",
      "args": ["ids"]
    },
    "searchUnit": {
      "verb": "GET",
      "url": "/api/v1/backend/unit/search",
      "args": ["type", "status"]
    },
    "totalUnit": {
      "verb": "GET",
      "url": "/api/v1/backend/unit/total",
      "args": ["type", "status"]
    },
    // Setting
    "editSetting": {
      "verb": "POST",
      "url": "/api/v1/backend/setting/edit"
    },
    "editFeeCollectionSetting": {
      "verb": "POST",
      "url": "/api/v1/backend/setting/editFeeCollectionSetting"
    },
    "uploadHomeSetting": {
      "verb": "POST",
      "url": "/api/v1/backend/setting/upload",
      "args": []
    },
    // TimeLine
    "addTimeLine": {
      "verb": "POST",
      "url": "/api/v1/backend/timeline/add",
      "args": ["name", "environment", "shrimp", "food", "chemical", "status", "type"]
    },
    "getTimeLine": {
      "verb": "GET",
      "url": "/api/v1/backend/timeline/get/:id",
      "args": ["id"]
    },
    "editTimeLine": {
      "verb": "PATCH",
      "url": "/api/v1/backend/timeline/edit/:id",
      "args": ["name", "environment", "shrFimp", "food", "chemical", "status", "type"]
    },
    "editFeedDiary": {
      "verb": "PATCH",
      "url": "/api/v1/backend/timeline/editFeedDiary/:id",
      "args": ["name", "environment", "shrimp", "food", "chemical", "status", "type"]
    },
    "trashTimeLine": {
      "verb": "PATCH",
      "url": "/api/v1/backend/timeline/trash/:ids",
      "args": ["ids"]
    },
    "deleteTimeLine": {
      "verb": "PATCH",
      "url": "/api/v1/backend/timeline/delete/:ids",
      "args": ["ids"]
    },
    "searchTimeLine": {
      "verb": "GET",
      "url": "/api/v1/backend/timeline/search",
      "args": ["type", "status"]
    },
    "totalTimeLine": {
      "verb": "GET",
      "url": "/api/v1/backend/timeline/total",
      "args": ["type", "status"]
    },
    "latestTimeline": {
      "verb": "GET",
      "url": "/api/v1/backend/timeline/latestTimeline",
      "args": ["project", "pond"]
    },
    //-----------------USER-------------------
    "initUser": {
      "verb": "POST",
      "url": "/api/v1/backend/user/init",
      "args": ["emailAddress", "phone", "password", "birthday", "status", "type"]
    },
    "loginUser": {
      "verb": "POST",
      "url": "/api/v1/backend/user/login",
      "args": ["code", "title", "type", "status"]
    },
    "uploadThumbnail": {
      "verb": "POST",
      "url": "/api/v1/backend/user/uploadThumbnail",
      "args": []
    },
    "addUser": {
      "verb": "POST",
      "url": "/api/v1/backend/user/add",
      "args": ["emailAddress", "phone", "firstName", "lastName", "password", "birthday", "status", "type", "gender"]
    },
    "getUser": {
      "verb": "GET",
      "url": "/api/v1/backend/user/get/:id",
      "args": ["id"]
    },
    "editUser": {
      "verb": "PATCH",
      "url": "/api/v1/backend/user/edit/:id",
      "args": ["emailAddress", "phone", "firstName", "lastName", "password", "birthday", "status", "type", "thumbnail"]
    },
    "trashUser": {
      "verb": "PATCH",
      "url": "/api/v1/backend/user/trash/:ids",
      "args": ["ids"]
    },
    "deleteUser": {
      "verb": "PATCH",
      "url": "/api/v1/backend/user/delete/:ids",
      "args": ["ids"]
    },
    "searchUser": {
      "verb": "GET",
      "url": "/api/v1/backend/user/search",
      "args": ["type", "status"]
    },
    "totalUser": {
      "verb": "GET",
      "url": "/api/v1/backend/user/total",
      "args": ["type", "status"]
    },
    "switchStatusUser": {
      "verb": "PATCH",
      "url": "/api/v1/backend/user/switchStatus/:id",
    },
    //USER
    "userCreateEdit": {
      "verb": "POST",
      "url": "/api/v1/backend/user/createedit",
      "args": ['id', "emailAddress", "firstName", "lastName", "phone", "status", "birthDay", "type"]
    },
    "getTableUserStaff": {
      "verb": "GET",
      "url": "/backend/user/staff",
      "args": ["search", "page", "sort", "order"]
    },
    "getTableUserMembers": {
      "verb": "GET",
      "url": "/backend/user/members",
      "args": ["search", "page", "sort", "order"]
    },
    "totalStatusUser": {
      "verb": "GET",
      "url": "/api/v1/backend/user/totalStatus",
      "args": ["status"]
    },
    "disabledUser": {
      "verb": "PATCH",
      "url": "/api/v1/backend/user/disabled/:ids",
      "args": ["ids"]
    },
    "publishUser": {
      "verb": "PATCH",
      "url": "/api/v1/backend/user/active/:ids",
      "args": ["ids"]
    },
    //-----------------PARENT-------------------
    "searchParent": {
      "verb": "GET",
      "url": "/api/v1/backend/parent/search",
      "args": ["type", "status"]
    },
    "editParent": {
      "verb": "PATCH",
      "url": "/api/v1/backend/parent/edit/:id",
      "args": ["emailAddress", "phone", "firstName", "lastName", "birthDay", "avatar"]
    },
    "addParent": {
      "verb": "POST",
      "url": "/api/v1/backend/parent/add",
      "args": ["emailAddress", "phone", "firstName", "lastName", "password", "passwordConfirm", "birthDay", "avatar", "status", "type"]
    },
    "trashParent": {
      "verb": "POST",
      "url": "/api/v1/backend/parent/trash/:ids",
      "args": ["ids"]
    },
    "switchStatusParent": {
      "verb": "PATCH",
      "url": "/api/v1/backend/parent/switchStatus/:id"
    },
    "importParentExcel": {
      "verb": "POST",
      "url": "/api/v1/backend/import/importParentExcel",
      "args": []
    },
    "uploadParentThumbnail": {
      "verb": "POST",
      "url": "/api/v1/backend/parent/uploadThumbnail",
      "args": []
    },
    "getListMessages": {
      "verb": "GET",
      "url": "/api/v1/backend/message-:messageId/getListMessages",
      "args": ["messageId"]
    },

    //-----------------Currency-------------------
    "addCurrency": {
      "verb": "POST",
      "url": "/api/v1/backend/currency/add",
      "args": ["title", "description", "nutrition", "type", "status"]
    },
    "getCurrency": {
      "verb": "GET",
      "url": "/api/v1/backend/currency/get/:id",
      "args": ["id"]
    },
    "editCurrency": {
      "verb": "PATCH",
      "url": "/api/v1/backend/currency/edit/:id",
      "args": ["title", "description", "nutrition", "type", "status"]
    },
    "trashCurrency": {
      "verb": "POST",
      "url": "/api/v1/backend/currency/trash/:ids",
      "args": ["ids"]
    },
    "deleteCurrency": {
      "verb": "PATCH",
      "url": "/api/v1/backend/currency/delete/:ids",
      "args": ["ids"]
    },
    "searchCurrency": {
      "verb": "GET",
      "url": "/api/v1/backend/currency/search",
      "args": ["type", "status"]
    },
    "switchStatusCurrency": {
      "verb": "PATCH",
      "url": "/api/v1/backend/currency/switchStatus/:id"
    },

    //-----------------FeeItem-------------------
    "addFeeItem": {
      "verb": "POST",
      "url": "/api/v1/backend/feeItem/add",
      "args": ["title", "code", "amount", "description"]
    },
    "getFeeItem": {
      "verb": "GET",
      "url": "/api/v1/backend/feeItem/get/:id",
      "args": ["id"]
    },
    "editFeeItem": {
      "verb": "PATCH",
      "url": "/api/v1/backend/feeItem/edit/:id",
      "args": ["title", "code", "amount", "description"]
    },
    "deleteFeeItem": {
      "verb": "PATCH",
      "url": "/api/v1/backend/feeItem/delete/:ids",
      "args": ["ids"]
    },
    "searchFeeItem": {
      "verb": "GET",
      "url": "/api/v1/backend/feeItem/search",
      "args": []
    },
    // "switchStatusFeeItem": {
    //   "verb": "PATCH",
    //   "url": "/api/v1/backend/feeItem/switchStatus/:id"
    // },

    //-----------------FeeInvoice-------------------
    "addFeeInvoice": {
      "verb": "POST",
      "url": "/api/v1/backend/feeInvoice/add",
      "args": ["title", "deadline", "items", "totalAmount", "students"]
    },
    "getFeeInvoice": {
      "verb": "GET",
      "url": "/api/v1/backend/feeInvoice/get/:id",
      "args": ["id"]
    },
    "editFeeInvoice": {
      "verb": "PATCH",
      "url": "/api/v1/backend/feeInvoice/edit/:id",
      "args": ["items", "totalAmount"]
    },
    "deleteFeeInvoice": {
      "verb": "PATCH",
      "url": "/api/v1/backend/feeInvoice/delete/:ids",
      "args": ["ids"]
    },
    "publicFeeInvoice": {
      "verb": "PATCH",
      "url": "/api/v1/backend/feeInvoice/public/:ids",
      "args": ["ids"]
    },
    "takePaymentFeeInvoice": {
      "verb": "PATCH",
      "url": "/api/v1/backend/feeInvoice/takePayment/:id",
      "args": ["paymentMethod"]
    },
    "searchFeeInvoice": {
      "verb": "GET",
      "url": "/api/v1/backend/feeInvoice/search",
      "args": [ "feeInvoiceIds", "classId", "gender"]
    },
    "searchStudentFeeInvoice": {
      "verb": "GET",
      "url": "/api/v1/backend/feeInvoice/searchStudent",
      "args": ["classId", "studentId"]
    },

    //-----------------EVENT-------------------
    "addEvent": {
      "verb": "POST",
      "url": "/api/v1/backend/event/add",
    },
    "getEvent": {
      "verb": "GET",
      "url": "/api/v1/backend/event/get/:id",
      "args": ["id"]
    },
    "editEvent": {
      "verb": "PATCH",
      "url": "/api/v1/backend/event/edit/:id"
    },
    "uploadEventThumbnail": {
      "verb": "POST",
      "url": "/api/v1/backend/event/uploadThumbnail",
      "args": []
    },
    "deleteEvent": {
      "verb": "POST",
      "url": "/api/v1/backend/event/delete/:ids",
      "args": ["ids"]
    },
    "switchStatusEvent": {
      "verb": "PATCH",
      "url": "/api/v1/backend/event/switchStatus/:id"
    },
    "editStudentMedical": {
      "verb": "POST",
      "url": "/api/v1/backend/medical/editStudentMedical/:id",
      "args": ["height", "weight", "bloodGroup", "allergy", "heartRate", "eyes", "ears"]
    },
    "addMedical": {
      "verb": "POST",
      "url": "/api/v1/backend/medical/add"
    },
    "editMedical": {
      "verb": "PATCH",
      "url": "/api/v1/backend/medical/edit/:id"
    },
    "deleteMedical": {
      "verb": "POST",
      "url": "/api/v1/backend/medical/delete/:ids",
      "args": ["ids"]
    },
    "exportDetailMedical": {
      "verb": "GET",
      "url": "/api/v1/backend/medical/exportDetailMedical"
    },
    "importMedicalExcel": {
      "verb": "POST",
      "url": "/api/v1/backend/import/importMedicalExcel"
    },
    //-----------------Formation-------------------
    "addFormation": {
      "verb": "POST",
      "url": "/api/v1/backend/formation/add",
      "args": ["title", "code", "amount", "description"]
    },
    "getFormation": {
      "verb": "GET",
      "url": "/api/v1/backend/formation/get/:id",
      "args": ["id"]
    },
    "editFormation": {
      "verb": "PATCH",
      "url": "/api/v1/backend/formation/edit/:id",
      "args": ["title", "code", "amount", "description"]
    },
    "deleteFormation": {
      "verb": "PATCH",
      "url": "/api/v1/backend/formation/delete/:ids",
      "args": ["ids"]
    },
    "searchFormation": {
      "verb": "GET",
      "url": "/api/v1/backend/formation/search",
      "args": []
    },
    "switchStatusFormation": {
      "verb": "PATCH",
      "url": "/api/v1/backend/formation/switchStatus/:id"
    },
  }
  /* eslint-enable */

});
