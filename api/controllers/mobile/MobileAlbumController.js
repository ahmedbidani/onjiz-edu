/**
 * AlbumController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const ErrorMessage = require("../../../config/errors");
const AlbumService = require("../../services/AlbumService");
const MediaService = require("../../services/MediaService");

module.exports = {
  add: async (req, res) => {
    sails.log.info(
      "================================ AlbumController.add => START ================================"
    );
    // GET ALL PARAMS
    const params = req.allParams();

    // CHECK TITTLE PARAMS
    if (!params.title) {
      return res.badRequest(ErrorMessage.ALBUM_ALBUM_ERR_TITLEALBUM_REQUIRED);
    } else if (!params.photos || !params.photos.length) {
      return res.badRequest(ErrorMessage.ALBUM_ERR_PHOTO_REQUIRED);
    } else if (!params.owner) {
      return res.badRequest(ErrorMessage.ALBUM_ERR_OWNER_REQUIRED);
    } else if (!params.class) {
      return res.badRequest(ErrorMessage.ALBUM_ERR_CLASS_REQUIRED);
    } else if (!params.courseSession) {
      return res.badRequest(ErrorMessage.ALBUM_ERR_COURSE_SESSION_REQUIRED);
    }
    if (!params.school) return res.badRequest(ErrorMessage.SCHOOL_ID_REQUIRED);

    // PREPARE DATA ALBUM
    const newData = {
      title: params.title, //REQUIRED
      description:
        params.description && params.description.trim().length
          ? params.description
          : params.title,
      photos: params.photos,
      status: params.status ? params.status : sails.config.custom.STATUS.DRAFT,
      owner: params.owner,
      classObj: params.class,
      courseSession: params.courseSession,
      school: params.school,
    };

    // ADD NEW DATA ALBUM
    const newAlbum = await AlbumService.add(newData);

    //create notification for this album and push notification if setting for notificationAlbum == true
    let settingForApp = await Setting.findOne({
      key: "app",
      school: params.school,
    });
    if (
      settingForApp &&
      settingForApp.value &&
      settingForApp.value.notificationAlbum == true
    ) {
      //define teacherIds && parentIds
      let allParentId = [];
      let allTeacherId = [];

      //prepare data to create new notification
      let classList = [];
      if (params.class == "") {
        let allClass = await Class.find({
          status: sails.config.custom.STATUS.ACTIVE,
          school: params.school,
        });
        classList = allClass.map((item) => item.id);
      } else {
        classList = [params.class];
      }

      let newDataNotification = {
        title: sails.__("%s", newAlbum.title),
        message: newAlbum.description,
        status: sails.config.custom.STATUS.ACTIVE,
        type: sails.config.custom.TYPE.ALBUM,
        classList: classList,
        school: params.school,
      };
      let notification = await Notifications.create(
        newDataNotification
      ).fetch();

      if (classList.length > 0) {
        for (let classId of classList) {
          /** get all parentId of classList */
          let allStudent_Class = await Student_Class.find({
            classObj: classId,
          });

          let allStudentId = allStudent_Class.map((item) => {
            return item.student;
          });

          for (let studentId of allStudentId) {
            let allStudent_Parent = await Student_Parent.find({
              student: studentId,
            });

            for (let student_parent of allStudent_Parent) {
              //just push parentId is not exist
              if (!allParentId.includes(student_parent.parent))
                allParentId.push(student_parent.parent);
            }
          }

          /**get all teacherId of classList */
          let allTeacher_Class = await Teacher_Class.find({
            classObj: classId,
          });
          for (let teacher_class of allTeacher_Class) {
            //just push teacherId is not exist
            if (!allTeacherId.includes(teacher_class.teacher))
              allTeacherId.push(teacher_class.teacher);
          }
        }

        //send notification
        await NotificationService.pushFirebase(
          notification,
          allParentId,
          allTeacherId
        );
      }
    }
    // RETURN DATA ALBUM
    return res.json({
      status: 200,
      data: newAlbum,
    });
  },

  get: async (req, res) => {
    // GET ALL PARAMS
    const params = req.allParams();
    // CHECK ID PARAM
    if (!params.id) {
      return res.badRequest(ErrorMessage.ALBUM_ERR_ID_REQUIRED);
    }

    // QUERY & CHECK DATA ALBUM
    const album = await AlbumService.get({
      id: params.id,
    });
    if (!album) {
      return res.notFound(ErrorMessage.ALBUM_ERR_NOT_FOUND);
    }

    const listMedias = await MediaService.find({ id: album.photos });
    album.photos = listMedias;

    // RETURN DATA ALBUM
    return res.json({
      data: album,
    });
  },

  edit: async (req, res) => {
    sails.log.info(
      "================================ AlbumController.edit => START ================================"
    );
    // GET ALL PARAMS
    const params = req.allParams();

    // CHECK TITTLE PARAMS
    if (!params.title) {
      return res.badRequest(ErrorMessage.ALBUM_ALBUM_ERR_TITLEALBUM_REQUIRED);
    } else if (!params.id) {
      return res.badRequest(ErrorMessage.ALBUM_ERR_ID_REQUIRED);
    }

    // CHECK DATA ALBUM
    const album = AlbumService.get({
      id: params.id,
    });
    if (!album) {
      return res.notFound(ErrorMessage.ALBUM_ERR_NOT_FOUND);
    }

    // PREPARE DATA ALBUM
    let newData = {};
    for (key in params) {
      if (key !== "id") {
        newData[key] = params[key];
      }
    }

    // UPDATE DATA ALBUM
    await AlbumService.edit(
      {
        id: params.id,
      },
      newData
    );

    const found = await AlbumService.get({
      id: params.id,
    });

    // RETURN DATA ALBUM
    return res.json({
      data: found,
    });
  },

  list: async (req, res) => {
    // GET ALL PARAMS
    const params = req.allParams();
    if (!params.school) return res.badRequest(ErrorMessage.SCHOOL_ID_REQUIRED);

    let limit = params.limit ? Number(params.limit) : 10;
    let page = params.page ? Number(params.page) : 1;
    // QUERY DATA NOTIFICATION
    const albums = await Album.find({
      status: sails.config.custom.STATUS.ACTIVE,
      school: params.school,
      or: [{ classObj: null }, { classObj: params.classId }],
    })
      .limit(limit)
      .skip((page - 1) * limit)
      .sort([{ createdAt: "DESC" }])
      .populate("owner");
    if (albums.length > 0) {
      for (let i = 0; i < albums.length; i++) {
        let medias = await MediaService.find(
          {
            id: albums[i].photos ? albums[i].photos : [],
            school: params.school,
          },
          1000,
          null,
          null
        );
        if (medias && medias.length > 0) {
          albums[i].photos = medias;
        }
      }
    }
    // RETURN DATA NOTIFICATION
    return res.json(albums);
  },

  trash: async (req, res) => {
    // GET ALL PARAMS
    const params = req.allParams();

    // CHECK IDS PARAM
    if (!params.ids || !params.ids.length) {
      return res.badRequest(ErrorMessage.ALBUM_ERR_ID_REQUIRED);
    }

    // CHECK ALBUM & UPDATE
    const albums = await AlbumService.find({
      id: params.ids,
    });
    if (typeof params.ids === "string") {
      if (!albums.length) {
        return res.badRequest(ErrorMessage.ALBUM_ERR_NOT_FOUND);
      } else {
        // nothing to do
      }
    } else {
      if (albums.length !== params.ids.length) {
        return res.badRequest(ErrorMessage.ALBUM_ERR_NOT_FOUND);
      } else {
        // nothing to do
      }
    }

    await Album.update({
      id: params.ids,
    }).set({
      status: sails.config.custom.STATUS.TRASH,
    });

    // RETURN DATA
    return res.json();
  },

  // search: async (req, res) => {
  //   sails.log.info("================================ AlbumController.search => START ================================");
  //   // GET ALL PARAMS
  //   const params = req.allParams();

  //   // PREAPARE BODY PARAMS
  //   const bodyParams = {
  //     filter: (params.filter && params.filter.trim().length) ? JSON.parse(params.filter) : null,
  //     limit: params.limit ? Number(params.limit) : null,
  //     offset: params.offset ? Number(params.offset) : null,
  //     sort: (params.sort && params.sort.trim().length) ? JSON.parse(params.sort) : null
  //   };

  //   let where = {};
  //   if (bodyParams.filter.status) {
  //     where = {
  //       status: bodyParams.filter.status === sails.config.custom.STATUS.ALL ? {
  //         '>=': sails.config.custom.STATUS.ALL
  //       } : bodyParams.filter.status
  //     }
  //   } else if (bodyParams.filter.rangeDate.active) {
  //     where = {
  //       createdAt: {
  //         '>=': moment(bodyParams.filter.rangeDate.begin).valueOf(),
  //         '<=': moment(bodyParams.filter.rangeDate.end).valueOf()
  //       }
  //     }
  //   } else if (typeof bodyParams.filter.keyWord === "string" && bodyParams.filter.keyWord.trim().length) {
  //     where = {
  //       or: [{
  //         title: {
  //           contains: bodyParams.filter.keyWord
  //         }
  //       }]
  //     }
  //   } else {
  //     // nothing to do
  //   }

  //   let condition;
  //   if (params.condition && !Utils.isJsonString(params.condition)) {
  //     return res.serverError(ErrorService.SYSTEM_JSON_FORMAT_FAIL);
  //   } else {
  //     condition = (params.condition) ? JSON.parse(params.condition) : null;
  //   }
  //   if (condition) {
  //     where = condition;
  //   }

  //   // QUERY DATA PARENT
  //   const albums = await AlbumService.find(where, bodyParams.limit, bodyParams.offset, bodyParams.sort),
  //     total = await AlbumService.count({
  //       status: {
  //         '>=': sails.config.custom.STATUS.ALL
  //       }
  //     }),
  //     trash = await AlbumService.count({ status: sails.config.custom.STATUS.TRASH }),
  //     publish = await AlbumService.count({ status: sails.config.custom.STATUS.ACTIVE });

  //   // RETURN DATA PARENTS
  //   return res.json({
  //     recordsTotal: total,
  //     recordsTrash: trash,
  //     recordsPublish: publish,
  //     data: albums
  //   });
  // }
};
