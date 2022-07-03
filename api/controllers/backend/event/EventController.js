let moment = require('moment');
const ErrorMessages = require('../../../../config/errors');
const Sharp = require('sharp/lib');
const EventService = require('../../../services/EventService');
const MediaService = require('../../../services/MediaService');
const accents = require('remove-accents');

module.exports = {
  add: async (req, res) => {
    const params = req.allParams();

    if (req.method === "GET") return res.badRequest(ErrorMessages.SYSTEM_METHOD_NOT_ALLOWED);
    if (!params.title) return res.badRequest(ErrorMessages.EVENT_TITLE_REQUIRED);
    if (!params.description || params.description == "") return res.badRequest(ErrorMessages.EVENT_DESCRIPTION_REQUIRED);
    if (!params.address) return res.badRequest(ErrorMessages.EVENT_ADDRESS_REQUIRED);
    if (params.type == 1 && !params.recurringDay.length) return res.badRequest(ErrorMessages.EVENT_RECURRING_DAY_REQUIRED);

    let alias = accents.remove(params.title).replace(/\s/g, '');
    let newData = {
      title: params.title,
      alias: alias.replace(/[^\w ]+/g,'').replace(/ +/g,'-'),
      motto: params.motto,
      description: params.description,
      dateStart: params.dateStart,
      dateEnd: params.dateEnd,
      timeStart: params.timeStart,
      timeEnd: params.timeEnd,
      venue: params.venue,
      address: params.address,
      mapIframe: params.mapIframe,
      amout: params.amount,
      status: params.status,
      type: params.type,
      recurringDay: params.recurringDay,
      media: params.thumbnail,
      author: req.session.userId,
      school: req.me.school
    };

    let newEvent = await EventService.add(newData);

    return res.json(newEvent);
  },

  get: async (req, res) => {
    sails.log.info( "================================ EventController.get => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();

    // CHECK PARAM
    if (!params.id) return res.badRequest(ErrorMessages.EVENT_ID_REQUIRED);

    // QUERY & CHECK DATA EVENT
    const eventObj = await EventService.get({ id: params.id });
    if (!eventObj) return res.notFound(ErrorMessages.EVENT_NOT_FOUND);

    // RETURN DATA EVENT
    return res.ok(eventObj);
  },

  edit: async (req, res) => {
    sails.log.info("================================ EventController.edit => START ================================");
    const params = req.allParams();

    if (req.method === "GET") return res.badRequest(ErrorMessages.SYSTEM_METHOD_NOT_ALLOWED);
    if (!params.id) return res.badRequest(ErrorMessages.EVENT_ID_REQUIRED);
    if (!params.title) return res.badRequest(ErrorMessages.EVENT_TITLE_REQUIRED);
    if (!params.description || params.description == "") return res.badRequest(ErrorMessages.EVENT_DESCRIPTION_REQUIRED);
    if (!params.address) return res.badRequest(ErrorMessages.EVENT_ADDRESS_REQUIRED);
    if (params.type == 1 && !params.recurringDay.length) return res.badRequest(ErrorMessages.EVENT_RECURRING_DAY_REQUIRED);

    let alias = accents.remove(params.title).replace(/\s/g, '');

    let _eventData = {
      title: params.title,
      alias: alias.replace(/[^\w ]+/g,'').replace(/ +/g,'-'),
      motto: params.motto,
      description: params.description,
      dateStart: params.dateStart,
      dateEnd: params.dateEnd,
      timeStart: params.timeStart,
      timeEnd: params.timeEnd,
      venue: params.venue,
      address: params.address,
      mapIframe: params.mapIframe,
      amout: params.amount,
      status: params.status,
      type: params.type,
      recurringDay: params.recurringDay,
      media: params.thumbnail,
      author: req.session.userId
    };

    let editEvent = await EventService.edit(params.id, _eventData);

    return res.json(editEvent);
  },

  delete: async (req, res) => {
    sails.log.info(
      "================================ EventController.delete => START ================================"
    );
    let params = req.allParams();
    if (!params.ids) return res.badRequest(ErrorMessages.EVENT_ID_REQUIRED);
    let ids = params.ids;
    if (params.ids.indexOf(";") != -1) {
      ids = ids.split(";");
    }
    if (typeof ids == "object") {
      for (var i = 0; i < ids.length; i++) {
        await EventService.del({ id: ids[i] });
      }
    } else {
      await EventService.del({ id: ids });
    }
    // RETURN DATA
    return res.ok();
  },

  search: async (req, res) => {
    sails.log.info("================================ EventController.search => START ================================");
    let params = req.allParams();
    let keyword = params.search ? params.search.value : null;
    let draw = params.draw ? parseInt(params.draw) : 1;
    let limit = params.length ? parseInt(params.length) : null;
    let skip = params.start ? parseInt(params.start) : null;
    let status = params.status ? params.status : 1;
    
    //check role of current logged in user
    let schoolObj = await School.findOne({ id: req.me.school });
    let isMainSchoolAdmin = 3 == req.me.userType ? true : false;
    let isHavePermissionEdit = false;
    let isHavePermissionDelete = false;
    if (!isMainSchoolAdmin && req.me.role && req.me.role.permissions && req.me.role.permissions.album) {
      isHavePermissionEdit = req.me.role.permissions.album.edit ? true : false;
      isHavePermissionDelete = req.me.role.permissions.album.delete ? true : false;
    }

    let newSort = {};
    if (params.order) {
      let objOrder = {};
      objOrder[params.columns[params.order[0].column].data] =
        params.order[0].dir;
      // sort = [objOrder];
      for (var key in objOrder) {
        if (objOrder[key] == "desc") {
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
        $or: [{ title: { $regex: keyword, $options: "i" } }]
      };
    }

    let mongo = require('mongodb');
    where.$and = [
      { school: new mongo.ObjectID(req.me.school) }
    ];
    if (params.status && params.status != '-1') {
      where.$and.push({ status: parseInt(params.status) });
    }
    /**SEARCH CASE_INSENSITIVE */
    const collection = Event.getDatastore().manager.collection(Event.tableName);
    let result = [];
    if (params.length && params.start) {
      result = await collection.find(where).limit(limit).skip(skip).sort(newSort);
    } else {
      result = await collection.find(where).sort(newSort);
    }
    const totalEvent = await collection.count(where);
    const dataWithObjectIds = await result.toArray();
    const arrObjEvent = JSON.parse(
      JSON.stringify(dataWithObjectIds).replace(/"_id"/g, '"id"')
    );
    
    let resEvent = [];
    for (let eventObj of arrObjEvent) {
      let event = await EventService.get({ id: eventObj.id });
      let tmpData = {};
      event.url = "/backend/event/edit/";
      tmpData.id ='<input class="js-checkbox-item" type="checkbox" value="' + event.id + '">';
      tmpData.tool = await sails.helpers.renderRowAction(event, isMainSchoolAdmin, isHavePermissionEdit, isHavePermissionDelete);
      let thumbLink = "/images/no-thumb.png";
      if (event.media != null && event.media.thumbnail.sizes) {
        thumbLink = event.media.thumbnail.sizes.thumbnail.path;
      }
      tmpData.thumbnail = '<img class="news-img rounded" src="' + thumbLink + '">';
      tmpData.title = event.title;
      tmpData.address = event.address;
      tmpData.author =  event.author ? event.author.firstName + ' ' + event.author.lastName : '-';

      tmpData.status = '';
      if (isMainSchoolAdmin || isHavePermissionEdit) {
        if (event.status == 1) {
          tmpData.status = `
            <label class="switch">
              <input class="switchStatus" type="checkbox" data-id="${event.id}" checked>
              <span class="slider"></span>
            </label>`;
        } else {
          tmpData.status = `
            <label class="switch">
              <input class="switchStatus" type="checkbox" data-id="${event.id}">
              <span class="slider"></span>
            </label>`;
        }
      } else {
        if (event.status == 1) {
          tmpData.status = '<label class="badge badge-success">' + sails.__("Active") + '</label>';
        } else {
          tmpData.status = '<label class="badge badge-warning">' + sails.__("Draft") + '</label>';
        }
      }

      resEvent.push(tmpData);
    }
    
    return res.ok({
      draw: draw,
      recordsTotal: totalEvent,
      recordsFiltered: totalEvent,
      data: resEvent,
      dataOriginal: arrObjEvent
    });
  },

  uploadThumbnail: async (req, res) => {
    sails.log.info("================================ EventController.uploadThumbnail => START ================================");
    let params = req.allParams();
    if (req.file('file')) { 
      let mediaResults = [];
      let mediaDetails = {
        width: 0,
        height: 0,
        path: '',
        sizes: {}
      };
			let fileUploaded = await sails.helpers.uploadFile.with({
				req: req,
				file: 'thumbnail'
			});
			if (fileUploaded.length) {
				for (let file of fileUploaded) { 
					let oriFileName = file.fd.replace(/^.*[\\\/]/, '');
					let fileName = oriFileName.split('.');
					let uploadConfig = sails.config.custom.UPLOAD;
					for (let size of uploadConfig.SIZES) {
            let destFileName = fileName[0] + '_' + size.name + '.' + fileName[1];
						if (size.type == 'origin') {
              Sharp(file.fd).resize(size.width)
                .toFile(require('path').resolve(uploadConfig.PATH_FOLDER, 'assets/uploads/') + '/' + moment().format('YYYY/MM') + '/' + destFileName)
                .then((info) => {
                mediaDetails.width = info.width;
                mediaDetails.height = info.height;
                }).catch((err) => { sails.log(err); });
              mediaDetails.path = '/uploads/' + moment().format('YYYY/MM') + '/' + destFileName;
						} else {
              Sharp(file.fd).resize(size.width, size.height)
                .toFile(require('path').resolve(uploadConfig.PATH_FOLDER, 'assets/uploads/') + '/' + moment().format('YYYY/MM') + '/' + destFileName)
                .then((info) => { }).catch((err) => { sails.log(err); });
              mediaDetails.sizes[size.type] = {
                width: size.width, height: size.height,
                path: '/uploads/' + moment().format('YYYY/MM') + '/' + destFileName
              };
            } 
          }
          
          // PREPARE DATA MEDIA
          let dataMedia = {
            title: params.title ? params.title : oriFileName, // REQUIRED
            thumbnail: mediaDetails,
            caption: (params.caption && params.caption.trim().length) ? params.caption : '', 
            status: params.status ? params.status : sails.config.custom.STATUS.ACTIVE,
            uploadBy: req.me.id,
            school: req.me.school

          };
          let mediaObj = await MediaService.add(dataMedia);
          mediaResults.push(mediaObj);
        }
        //sails.log(mediaResults);
				return res.json(mediaResults[0].id);
			}
		}
    return res.json({});
  },

  switchStatus: async (req, res) => {
    sails.log.info(
      "================================ EventController.switchStatus => START ================================"
    );
    // // GET ALL PARAMS
    const params = req.allParams();
    if (!params.id) return res.badRequest(ErrorMessages.EVENT_ID_REQUIRED);

    //CHECK OBJ IS EXISTED?
    let eventObj = await EventService.get({ id: params.id });
    if (!eventObj) return res.badRequest(ErrorMessages.EVENT_NOT_FOUND);

    //switch status of current obj
    if (eventObj.status == 1)
      eventObj = await EventService.edit({ id: params.id }, { status: 0 });
    else eventObj = await EventService.edit({ id: params.id }, { status: 1 });

    return res.json(eventObj);
    // END UPDATE
  }
};

