/**
 * Notification/NotificationController
 *
 * @description :: Server-side logic for managing notification/taxonomies
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const ErrorMessages = require('../../../../config/errors');
const rp = require('request-promise');
const NotificationService = require('../../../services/NotificationService');

module.exports = {

  add: async (req, res) => {
    // GET ALL PARAMS
    const params = req.allParams();

    if (!params.title || !params.title.trim().length) {
      return res.badRequest(NotificationError.ERR_TITLENOTE_REQUIRED);
    }
    
    // PREPARE DATA NOTIFICATION
    let newData = {
       
      title: params.title, // REQUIRED
      message: params.message ? params.message : '',
      status: params.status ? params.status : sails.config.custom.STATUS.ACTIVE,
      classList: params.classList ? params.classList : -1,
      type: params.type ? parseInt(params.type) : -1,
      school: req.me.school
      //noteType: _noteType
    };

    // ADD NEW DATA NOTIFICATION
    let newNotification = await NotificationService.add(newData);

    // RETURN DATA NOTIFICATION
    return res.ok(newNotification);
  },

  edit: async (req, res) => {
    sails.log.info("================================ NotificationController.edit => START ================================");
    const params = req.allParams();
    if (req.method === 'GET') {
      return res.json({ 'status': 'GET not allowed' });
    }

    // CHECK TITTLE & MESSAGE NOTIFICATION PARAMS
    if (!params.id) return res.badRequest(ErrorMessages.NOTIFICATION_ID_REQUIRED);
    if (!params.title) return res.badRequest(ErrorMessages.NOTIFICATION_TITLE_REQUIRED);
    if (!params.message) return res.badRequest(ErrorMessages.NOTIFICATION_MESSAGE_REQUIRED);

    let noti = await NotificationService.get({ id: params.id });
    if (!noti) return res.badRequest(ErrorMessages.NOTIFICATION_NOT_FOUND);

    let status = params.status ? parseInt(params.status) : noti.status;
    let type = params.type ? parseInt(params.type) : noti.type;
    let newData = {
      title: params.title,
      message: params.message,
      status: status,
      type: type,
      classList : params.classList ? params.classList : -1
    }

    let editNotification = await NotificationService.edit(params.id, newData);

    return res.ok(editNotification);
  },

  get: async (req, res) => {
    // GET ALL PARAMS
    const params = req.allParams();

    // CHECK ID PARAM
    if (!params.id) {
      return res.badRequest(ErrorMessages.NOTIFICATION_ID_REQUIRED);
    }

    // QUERY & CHECK DATA NOTIFICATION
    const notification = await NotificationService.get({
      id: params.id
    });
    if (!notification) {
      return res.badRequest(ErrorMessages.NOTIFICATION_NOT_FOUND);
    }

    // RETURN DATA NOTIFICATION
    return res.ok(notification);
  },

  trash: async (req, res) => {
    sails.log.info("================================ NotificationController.trash => START ================================");
    let params = req.allParams();
    if (!params.ids) return res.badRequest(ErrorMessages.NOTIFICATION_ID_REQUIRED);
    // Call constructor with custom options:
    // let data = { status: sails.config.custom.STATUS.TRASH };
    let ids = params.ids;
    if (params.ids.indexOf(';') != -1) {
      ids = ids.split(';');
    }

    if (typeof (ids) == 'object') {
      for (var i = 0; i < ids.length; i++) {
        let notification = await NotificationService.get({ id: ids[i] });
        if (notification) NotificationService.del({ id: ids[i] });
        // let notification = await NotificationService.get({ id: ids[i] });
        // if (notification && notification.status == data.status) {
        //   NotificationService.del({ id: ids[i] });
        // } else if (notification) {
        //   await Notifications.update({ id: ids[i] }).set({ status: data.status });
        // }
      }
    } else {
      let notification = await NotificationService.get({ id: ids });
      if (notification) NotificationService.del({ id: ids });
      // let notification = await NotificationService.get({ id: ids });
      // if (notification && notification.status == data.status) {
      //   NotificationService.del({ id: ids });
      // } else if (notification) {
      //   await Notifications.update({ id: ids }).set({ status: data.status });
      // }
    }
    // RETURN DATA
    return res.json({ status: 1 });

  },

  info: async (req, res) => {
    let notification = await Notification.info(req.param('id'));
    return res.json(notification);
  },

  total: async (req, res) => {
    let type = req.param('type');
    let totals = 0;
    totals = await Notification.total({ cond: { type: type } });
    return res.json({ totals: totals });
  },

  push: async (req, res) => {
    let _ids = req.param('ids');
    await sails.helpers.expoPushNotifications.with({
      notificationIds: _ids
    });

    //set notification status complete
    let totals = await Notification.push({ ids: req.param('ids') });

    return res.json({ totals: totals });
  },

  search: async (req, res) => {
    sails.log.info("================================ NotificationController.search => START ================================");
    let params = req.allParams();
    let keyword = params.search ? params.search.value : null;
    let draw = (params.draw) ? parseInt(params.draw) : 1;
    let limit = (params.length) ? parseInt(params.length) : null;
    let skip = (params.start) ? parseInt(params.start) : null;
    
    //check role of current logged in user
    let schoolObj = await School.findOne({ id: req.me.school });
    let isMainSchoolAdmin = 3 == req.me.userType ? true : false;
    let isHavePermissionEdit = false;
    let isHavePermissionDelete = false;
    if (!isMainSchoolAdmin && req.me.role && req.me.role.permissions && req.me.role.permissions.album) {
      isHavePermissionEdit = req.me.role.permissions.album.edit ? true : false;
      isHavePermissionDelete = req.me.role.permissions.album.delete ? true : false;
    }

    // let sort = null;
    let newSort = {};
    if ( params.order ) {
      let objOrder = {};
      objOrder[params.columns[params.order[0].column].data] = params.order[0].dir ;
      // sort = [objOrder];
      for(var key in objOrder){
        if(objOrder[key] == 'desc'){
          //code here
          newSort[key] = -1; 
        } else {
          newSort[key] = 1;
        }
      }
    } else {
      newSort = { createdAt: -1 };
    }

    let where = {};
    if (typeof keyword === "string" && keyword.length > 0) {
      where = {
        $or: [
          { title: { $regex: keyword, $options: 'i' }},
        ]
      } 
    }

    let mongo = require('mongodb');
    where.$and = [
      { status: params.status ? parseInt(params.status) : 1 },
      { type: params.type ? parseInt(params.type) : { $in: [-1, 0, 8] } },
      { school: new mongo.ObjectID(req.me.school) }
    ];

    /**SEARCH CASE_INSENSITIVE */
    const collection = Notifications.getDatastore().manager.collection(Notifications.tableName);
    let result = [];
    if (params.length && params.start) {
      result = await collection.find(where).limit(limit).skip(skip).sort(newSort);
    } else {
      result = await collection.find(where).sort(newSort);
    }
    const totalNotification = await collection.count(where);
    const dataWithObjectIds = await result.toArray();
    const arrObjNotifications = JSON.parse(JSON.stringify(dataWithObjectIds).replace(/"_id"/g, '"id"'));

    //find only active status
    // let status = (params.status) ? parseInt(params.status) : 1;
    // let type = (params.type) ? parseInt(params.type) : 0;
    // let where = {};
    // //IF status = -1 => SEARCH ALL
    // if (status != -1) {
    //   where = { status: status, type: type };
    // }
    // //END IF STATUS
    // //IF TITLE !='' => SEARCH STRING
    // if (typeof title === "string" && title.length > 0) {
    //   where = {
    //     or: [
    //       { title: { contains: title } }
    //     ],
    //     status: status,
    //     type: type
    //   };
    // }
    //END IF TITLE

    // let arrObjNotifications = await NotificationService.find(where, limit, skip, sort);
    let resNotifications = [];
    for (let notification of arrObjNotifications) {
      let tmpData = {};
      var classList = '';
      //load list class of notification
      if(notification.classList == -1) {
        classList = '-'
      } else {
        let Classes = await Class.find({id: notification.classList});
        for(let i = 0; i < Classes.length; i++)
        {
          if(i == Classes.length - 1)
          {
            classList += Classes[i].title;
            break;
          }
          classList += Classes[i].title + ', ';
        }
      }
      tmpData.id = '<input class="js-checkbox-item" type="checkbox" value="' + notification.id + '">';
      tmpData.code = notification.code;
      tmpData.title = notification.title;
      if(notification.status == 1 || notification.status == 0 ) {
        notification.isNotification = true;
      }
      tmpData.tool = await sails.helpers.renderRowAction(notification, isMainSchoolAdmin, isHavePermissionEdit, isHavePermissionDelete);
      
      
      tmpData.message = notification.message;
      if (notification.status == 1) {
        tmpData.status = '<label class="badge badge-success">' + sails.__("Active") + '</label>';
      } else {
        tmpData.status = '<label class="badge badge-warning">' + sails.__("Draft") + '</label>';
      }
      tmpData.class = classList;
      resNotifications.push(tmpData);
    };
    // let totalNotification = await NotificationService.count(where);
    return res.ok({ draw: draw, recordsTotal: totalNotification, recordsFiltered: totalNotification, data: resNotifications });
  },

  pushFirebase: async (req, res) => {
    sails.log.info("================================ NotificationController.pushFirebase => START ================================");
    let params = req.allParams();

    if (!params.id) return res.badRequest(ErrorMessages.NOTIFICATION_ID_REQUIRED);

    let notification = await NotificationService.get({ id: params.id });
    if (!notification) return res.badRequest(ErrorMessages.NOTIFICATION_NOT_FOUND);

    //update status if push notification
    notification = await NotificationService.edit({ id: params.id }, { status: 1 });

    let allParentId = [];
    let allParent = [];
    let allTeacherId = [];
    let allTeacher = [];

    //get all class of notification
    //get all student of class
    //get all parent of student
    if (Array.isArray(notification.classList)) {//if classList is array
      if (notification.classList && notification.classList.length > 0) {
        for (let classId of notification.classList) {

          // push noti to parent and teacher  if noti is type ALL
          if (notification.type == 0) {
            /** get all parentId of classList */
            let allStudent_Class = await Student_Class.find({ classObj: classId });
  
            let allStudentId = allStudent_Class.map((item) => {
              return item.student;
            })
  
            for (let studentId of allStudentId) {
              let allStudent_Parent = await Student_Parent.find({ student: studentId });
  
              for (let student_parent of allStudent_Parent) {
                //just push parentId is not exist
                if (!allParentId.includes(student_parent.parent))
                  allParentId.push(student_parent.parent);
              }
            }
            /**get all teacherId of classList */
            let allTeacher_Class = await Teacher_Class.find({ classObj: classId });
            for (let teacher_class of allTeacher_Class) {
             //just push teacherId is not exist
              if (!allTeacherId.includes(teacher_class.teacher))
                allTeacherId.push(teacher_class.teacher);
            }
          }
        }
      }
    } else if (notification.classList == -1) { 
      //classList is -1 => send all class => send notification to all Parent

      //if type = parent => send to parent
      if (notification.type == -1) {
        allParent = await Parent.find({ school: req.me.school });
        allParentId = allParent.map(item => item.id);
      }

      //classList == -1 ? send all teacher
      if (notification.type == 8) {
        allTeacher = await User.find({ userType: 1, school: req.me.school }); //get all teacher
        allTeacherId = allTeacher.map(item => item.id);
      }
    }

    //send notification
    await NotificationService.pushFirebase(notification, allParentId, allTeacherId);

    return res.ok(notification);
  },
};