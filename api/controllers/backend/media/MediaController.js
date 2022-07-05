/**
 * @copyright 2017 @ ZiniMedia Team
 * @author thanhvo
 * @create 2017/10/25 10:52
 * @update 2017/10/25 10:52
 * @file api/controllers/MediaController.js
 */

const moment = require("moment");

/**
 * Old way below of using local storage using library Sharp
 */
//const Sharp = require("sharp/lib");

/**
 * New way to upload to Aws s3
 */
 var aws_module = require('aws-sdk');

const ErrorMessages = require("../../../../config/errors");
const MediaService = require("../../../services/MediaService");
const Utils = require("../../../utils");
const { getMaxListeners } = require("process");

const BackendMediaController = {
  /**
	 @api {put} /Media/add 01. Add a new Media
		@apiName add
		@apiVersion 1.0.0
		@apiGroup Media

		@apiHeader {String} token  is required.

		@apiParam {String} title is required.
		@apiParam {String} alias  
		@apiParam {String} description  
		@apiParam {String} parent 
		@apiParam {String} metaFields Thuoc tinh khac neu co.

		@apiSuccessExample {json} Success-Response:
		HTTP/1.1 200 OK
		{

		}


		@apiErrorExample Error-Response:
		HTTP/1.1 500 Internal Server Error
		{
			code: "SYS001",
			message: "Error system"
		}
		{
			code: 'SYS008',
			message: "JSON format is not valid"
		}
		HTTP/1.1 400 Bad Request
		{
			code: "PT001",
			message: "Add error"
		}
		{
			code: "PT006",
			message: "Title is required"
		}
		*/
  add: async (req, res) => {
    sails.log.info(
      "================================ MediaController.add => START ================================"
    );

    let params = req.allParams();
    if (!params.title)
      return res.badRequest(ErrorMessages.MEDIA_TITLE_REQUIRED);
    // Call constructor with custom options:
    let path = params.path ? params.path : "";
    let caption = params.caption ? params.caption : "";
    let status = params.status ? parseInt(params.status) : 1;
    let type = params.type ? parseInt(params.type) : -1;

    if (params.metaFields && !Utils.isJsonString(params.metaFields))
      return res.serverError(ErrorMessages.SYSTEM_JSON_FORMAT_FAIL);

    let data = {
      title: params.title,
      path: path,
      caption: caption,
      status: status,
      uploadBy: req.session.userId,
      school: req.me.school,
    };

    let newObj = await MediaService.add(data);
    return res.ok(newObj);

    sails.log.info(
      "================================ MediaController.add => END ================================"
    );
  },

  /**
   * 
   * New way
   */
  uploadThumbnail: async (req, res) => {
    // GET ALL PARAMS
    const params = req.allParams();

    // Initialize aws s3
    let bucketName = "someBucketName"
    let s3_instance = new aws_module.S3();
    let  bucketParam = {Bucket: bucketName};
    s3_instance.createBucket(bucketParam);
    var s3Bucket = new aws_module.S3( { params: {Bucket: bucketName} } );

    //upload file
    let filesUpload = [];
    if (req.file("files[]")) {
      let ofiles = await sails.helpers.uploadFile.with({
        req: req,
        file: "files[]",
      });
      if (ofiles.length) {
        let count = 0;
        for (let file of ofiles) {
          filesUpload.push({
            thumbnail: {
              width: 0,
              height: 0,
              path: "",
              sizes: {},
            },
          });
          // sails.log('ofiles', file);
          let filename = file.fd.replace(/^.*[\\\/]/, "");
          filename = filename.split(".");
          let uploadConfig = sails.config.custom.UPLOAD;
          //sails.log(uploadConfig.PATH_FOLDER);
          for (let size of uploadConfig.SIZES) {
            let destFileName =
              filename[0] + "_" + size.name + "." + filename[1];


              let fileBuffer = file.fd.buffer._readableState.buffer[0]
              
              let data = {
                Bucket: bucketName,
                Key: 'image1', fileBuffer, ACL: 'public-read', ContentEncoding: 'base64',
                ContentType: 'image/png'
              };

              s3Bucket.upload(data, function (err, data) {
                if (err) {
                  console.log('Error uploading Image!');
                  res.json({error: err})
                } else {
                  console.log('Image upload successfully!', data);
                  res.json({message: 'Image upload successfully!'})
                }
              } )

        
          }
          count++;
        }
      }
    }

    if (filesUpload.length == 0) {
      return res.badRequest(ErrorMessages.MEDIA_UPLOAD_FAILDED);
    }

    // PREPARE DATA MEDIA
    let medias = [];
    for (let file of filesUpload) {
      let newData = {
        title: params.title ? params.title : String(moment().valueOf()), // REQUIRED
        thumbnail: file.thumbnail,
        caption:
          params.caption && params.caption.trim().length ? params.caption : "",
        status: params.status
          ? params.status
          : sails.config.custom.STATUS.ACTIVE,
        uploadBy: req.me.id,
        school: req.me.school,
      };

      // ADD NEW DATA MEDIA
      medias.push(await MediaService.add(newData));
    }

    // RETURN DATA MEDIA
    return res.json({
      data: medias,
    });
  },

  /**
   * 
   * Old way
   */
  // uploadThumbnail: async (req, res) => {
  //   // GET ALL PARAMS
  //   const params = req.allParams();
  //   //upload file
  //   let filesUpload = [];
  //   if (req.file("files[]")) {
  //     let ofiles = await sails.helpers.uploadFile.with({
  //       req: req,
  //       file: "files[]",
  //     });
  //     if (ofiles.length) {
  //       let count = 0;
  //       for (let file of ofiles) {
  //         filesUpload.push({
  //           thumbnail: {
  //             width: 0,
  //             height: 0,
  //             path: "",
  //             sizes: {},
  //           },
  //         });
  //         // sails.log('ofiles', file);
  //         let filename = file.fd.replace(/^.*[\\\/]/, "");
  //         filename = filename.split(".");
  //         let uploadConfig = sails.config.custom.UPLOAD;
  //         //sails.log(uploadConfig.PATH_FOLDER);
  //         for (let size of uploadConfig.SIZES) {
  //           let destFileName =
  //             filename[0] + "_" + size.name + "." + filename[1];
  //           if (size.type === "origin") {
  //             Sharp(file.fd)
  //               .resize(size.width)
  //               .toFile(
  //                 require("path").resolve(
  //                   uploadConfig.PATH_FOLDER,
  //                   "assets/uploads/"
  //                 ) +
  //                   "/" +
  //                   moment().format("YYYY/MM") +
  //                   "/" +
  //                   destFileName
  //               )
  //               .then((info) => {
  //                 //filesUpload[count].thumbnail.width = info.width;
  //                 //filesUpload[count].thumbnail.height = info.height;
  //               })
  //               .catch((err) => {
  //                 sails.log(err);
  //               });
  //             filesUpload[count].thumbnail.path =
  //               "assets/uploads/" +
  //               moment().format("YYYY/MM") +
  //               "/" +
  //               destFileName;
  //           } else {
  //             Sharp(file.fd)
  //               .resize(size.width, size.height)
  //               .toFile(
  //                 require("path").resolve(
  //                   uploadConfig.PATH_FOLDER,
  //                   "assets/uploads/"
  //                 ) +
  //                   "/" +
  //                   moment().format("YYYY/MM") +
  //                   "/" +
  //                   destFileName
  //               )
  //               .then((info) => {})
  //               .catch((err) => {
  //                 sails.log(err);
  //               });
  //             filesUpload[count].thumbnail.sizes[size.type] = {
  //               width: size.width,
  //               height: size.height,
  //               path:
  //                 "/uploads/" + moment().format("YYYY/MM") + "/" + destFileName,
  //             };
  //           }
  //         }
  //         count++;
  //       }
  //     }
  //   }

  //   if (filesUpload.length == 0) {
  //     return res.badRequest(ErrorMessages.MEDIA_UPLOAD_FAILDED);
  //   }

  //   // PREPARE DATA MEDIA
  //   let medias = [];
  //   for (let file of filesUpload) {
  //     let newData = {
  //       title: params.title ? params.title : String(moment().valueOf()), // REQUIRED
  //       thumbnail: file.thumbnail,
  //       caption:
  //         params.caption && params.caption.trim().length ? params.caption : "",
  //       status: params.status
  //         ? params.status
  //         : sails.config.custom.STATUS.ACTIVE,
  //       uploadBy: req.me.id,
  //       school: req.me.school,
  //     };

  //     // ADD NEW DATA MEDIA
  //     medias.push(await MediaService.add(newData));
  //   }

  //   // RETURN DATA MEDIA
  //   return res.json({
  //     data: medias,
  //   });
  // },
  /**
	 @api {put} /Media/get 02. Get detail a Media
		@apiName get
		@apiVersion 1.0.0
		@apiGroup Media

		@apiHeader {String} token  required
		@apiParam {String} title     required
		@apiParam {String} path     required

		@apiSuccessExample {json} Success-Response:
		HTTP/1.1 200 OK
		{
			"createdAt": 1525775911715,
			"updatedAt": 1525775911715,
			"id": "5af17e27db86cc10e7a18b3d",
			"title": "pikachu",
			"path": "hello-zinimedia.jpg",
			"caption": "",
			"uploadBy": null
		}


		@apiErrorExample Error-Response:
		HTTP/1.1 500 Internal Server Error
		{
			code: "SYS001",
			message: "Error system"
		}
		HTTP/1.1 400 Bad Request
		{
			code: "PT005",
			message: "Title is required"
		}
		HTTP/1.1 404 Not Found
		{
			code: "PT004",
			message: "Media is not found"
		}
		*/
  get: async (req, res) => {
    sails.log.info(
      "================================ MediaController.get => START ================================"
    );
    let params = req.allParams();
    if (!params.id) return res.badRequest(ErrorMessages.MEDIA_ID_REQUIRED);

    let media = await MediaService.get({ id: params.id });
    if (!media) return res.notFound(ErrorMessages.MEDIA_OBJECT_NOT_FOUND);
    delete media.id;
    return res.ok(media);
  },

  /**
	 @api {put} /Media/edit 04. Edit a Media
		@apiName edit
		@apiVersion 1.0.0
		@apiGroup Media

		@apiHeader {String} token  required.
		

		@apiSuccessExample {json} Success-Response:
		HTTP/1.1 200 OK
		{
			"createdAt": 1525775911715,
			"updatedAt": 1525775911715,
			"id": "5af17e27db86cc10e7a18b3d",
			"title": "pikachu",
			"path": "hello-zinimedia.jpg",
			"caption": "",
			"uploadBy": null
		}


		@apiErrorExample Error-Response:
		HTTP/1.1 500 Internal Server Error
		{
			code: "SYS001",
			message: "System error"
		}
		HTTP/1.1 400 Bad Request
		{
			code: "PT002",
			message: "Update failed"
		}
		{
			code: "PT005",
			message: "Media id is requied"
		}
		{
			code: 'SYS008',
			message: "JSON format is not valid"
		}
		HTTP/1.1 404 Not Found
		{
			code: "PT004",
			message: "Media is not found"
		}
		*/
  edit: async (req, res) => {
    sails.log.info(
      "================================ MediaController.edit => START ================================"
    );

    let params = req.allParams();
    if (!params.title)
      return res.badRequest(ErrorMessages.MEDIA_TITLE_REQUIRED);
    // Call constructor with custom options:
    let path = params.path ? params.path : "";
    let caption = params.caption ? params.caption : "";
    let status = params.status ? parseInt(params.status) : 1;
    let type = params.type ? parseInt(params.type) : 1;

    if (params.metaFields && !Utils.isJsonString(params.metaFields))
      return res.serverError(ErrorMessages.SYSTEM_JSON_FORMAT_FAIL);

    let data = {
      title: params.title,
      path: path,
      caption: caption,
      status: status,
      uploadBy: req.session.userId,
    };

    //ALWAYS CHECK  OBJECT EXIST BEFORE UPDATE
    let media = MediaService.get({ id: params.id });
    if (!media) return res.notFound(ErrorMessages.MEDIA_OBJECT_NOT_FOUND);
    //UPDATE DATA
    let editObj = await MediaService.edit({ id: params.id }, data);
    return res.ok(editObj);
  },

  /**
	 @api {put} /Media/trash 04. Edit a Media
		@apiName edit
		@apiVersion 1.0.0
		@apiGroup Media

		@apiHeader {String} token  required.
		
		@apiParam {String} path

		@apiSuccessExample {json} Success-Response:
		HTTP/1.1 200 OK
		{
			"createdAt": 1525775911715,
			"updatedAt": 1525776068267,
			"id": "5af17e27db86cc10e7a18b3d",
			"title": "pikachu",
			"path": "pikachu-zinimedia.jpg",
			"caption": "",
			"uploadBy": null
		}


		@apiErrorExample Error-Response:
		HTTP/1.1 500 Internal Server Error
		{
			code: "SYS001",
			message: "System error"
		}
		HTTP/1.1 400 Bad Request
		{
			code: "PT002",
			message: "Update failed"
		}
		{
			code: "PT005",
			message: "Media id is requied"
		}
		{
			code: 'SYS008',
			message: "JSON format is not valid"
		}
		HTTP/1.1 404 Not Found
		{
			code: "PT004",
			message: "Media is not found"
		}
		*/
  trash: async (req, res) => {
    sails.log.info(
      "================================ MediaController.trash => START ================================"
    );

    let params = req.allParams();
    if (!params.ids) return res.badRequest(ErrorMessages.MEDIA_ID_REQUIRED);
    // Call constructor with custom options:
    //TRASH -> set status Media = 3
    let data = { status: 3 };
    let ids = params.ids;
    if (ids.indexOf(";") != 3) {
      ids = ids.split(";");
      await Media.update({ id: ids }).set(data);
    } else {
      await Media.update(ids).set(data);
    }
    return res.ok();
  },

  /**
	 @api {put} /Media/delete 03. Delete a Media
		@apiName delete
		@apiVersion 1.0.0
		@apiGroup Media

		@apiHeader {String} token  required
		@apiParam {String} id      required

		@apiSuccessExample {json} Success-Response:
		HTTP/1.1 200 OK
		{
		}

		@apiErrorExample Error-Response:
		HTTP/1.1 500 Internal Server Error
		{
			code: "SYS001",
			message: "Error System"
		}
		HTTP/1.1 400 Bad Request
		{
			code: "PT005",
			message: "Media id is required"
		}
		{
			code: "PT003",
			message: "Delete failed"
		}
		HTTP/1.1 404 Not Found
		{
			code: "PT004",
			message: "Media is not found"
		}
		*/
  delete: async (req, res) => {
    sails.log.info(
      "================================ MediaController.del => START ================================"
    );
    let params = req.allParams();
    if (!params.id) return res.badRequest(ErrorMessages.MEDIA_ID_REQUIRED);
    let media = await MediaService.get({ id: params.id });
    if (!media) return res.notFound(ErrorMessages.MEDIA_OBJECT_NOT_FOUND);
    MediaService.del({ id: params.id });
    return res.ok();
  },

  /**
	 @api {put} /Media/search 05. Search taxonomies
		@apiName search
		@apiVersion 1.0.0
		@apiGroup Media

		@apiHeader {String} token  token is required

		@apiParam {String} keyword String of search text is optional.
		@apiParam {String} condition String of search text is optional. Ex: {"or": [{"status": "ACTIVE", "teachers": 0}]}
		@apiParam {Integer} limit Number of limit records return. Default: 10;
		@apiParam {Integer} skip Number of skip records return. Default: 0;
		@apiParam {String} sort String of sort fields. Default: { "updateAt": 1};

		@apiSuccessExample {json} Success-Response:
		HTTP/1.1 200 OK
		{
			"total": 1,
			"rows": [
					{
							"createAt": 1508907091297,
							"updateAt": 1508907091297,
							"id": "59f018536416d103ee28f254"
					}
			]
		}


		@apiErrorExample Error-Response:
		HTTP/1.1 500 Internal Server Error
		HTTP/1.1 500 Internal Server Error
		{
			code: "SYS001",
			message: "Error System"
		}
		{
			code: "PT003",
			message: "Delete failed"
		}
		HTTP/1.1 404 Not Found
		{
			code: "PT004",
			message: "Media is not found"
		}
		*/
  search: async (req, res) => {
    sails.log.info(
      "================================ MediaController.search => START ================================"
    );
    let params = req.allParams();

    let keyword = params.keyword ? params.keyword : null;

    let draw = params.draw ? parseInt(params.draw) : 1;
    let limit = params.length ? parseInt(params.length) : null;
    let skip = params.start ? parseInt(params.start) : null;
    let sort = params.sort ? JSON.parse(params.sort) : null;
    //find only active status
    let status = params.status ? parseInt(params.status) : -1;
    let where = { status: { ">=": 0 } };
    if (status != -1) {
      where = { status: status };
    }
    //let select = ["_id", "title", "description", "order"];
    if (params.condition && !Utils.isJsonString(params.condition))
      return res.serverError(ErrorMessages.SYSTEM_JSON_FORMAT_FAIL);

    if (typeof keyword === "string" && keyword.length > 0) {
      where = {
        or: [{ title: { contains: keyword } }],
      };
    }

    let condition = params.condition ? JSON.parse(params.condition) : null;
    if (condition) {
      where = condition;
    }

    let arrObjMedia = await MediaService.find(where, limit, skip, sort);
    let resMedia = [];
    _.each(arrObjMedia, function (media) {
      let tmpData = {};
      tmpData.id = '<input class="js-checkbox-item" type="checkbox">';
      tmpData.title =
        media.title +
        '<div class="row-action">' +
        '<a href="javascript:;" class="edit-row" data-id="' +
        media.id +
        '">' +
        sails.__("Edit") +
        "</a> | " +
        '<a href="javascript:;" class="duplicate-row" data-id="' +
        media.id +
        '">' +
        sails.__("Duplicate") +
        "</a> | " +
        '<a href="javascript:;" class="remove-row" data-id="' +
        media.id +
        '">' +
        sails.__("Trash") +
        "</a>" +
        "</div>";
      tmpData.path = media.path;
      tmpData.caption = media.caption;
      resMedia.push(tmpData);
    });
    let totalMedia = await MediaService.count(where);
    return res.ok({
      draw: draw,
      recordsTotal: totalMedia,
      recordsFiltered: totalMedia,
      data: resMedia,
    });
  },

  /**
 	@api {put} /Media/list 05. List medias
	@apiName list
	@apiVersion 1.0.0
	@apiGroup Media

	@apiHeader {String} token  token is required

	@apiParam {Integer} limit Number of limit records return. Default: 10;
	@apiParam {Integer} skip Number of skip records return. Default: 0;
	@apiParam {String} sort String of sort fields. Default: { "updateAt": 1};

	@apiSuccessExample {json} Success-Response:
	HTTP/1.1 200 OK
	{
		"total": 1,
		"rows": [
				{
						"createAt": 1508907091297,
						"updateAt": 1508907091297,
						"id": "59f018536416d103ee28f254"
				}
		]
	}


	@apiErrorExample Error-Response:
	HTTP/1.1 500 Internal Server Error
	{
		code: "SYS001",
		message: "Error System"
	}
	{
		code: "PT003",
		message: "Delete failed"
	}
	HTTP/1.1 404 Not Found
	{
		code: "PT004",
		message: "Media is not found"
	}
	*/
  list: async (req, res) => {
    sails.log.info(
      "================================ MediaController.search => START ================================"
    );
    let params = req.allParams();

    let limit = parseInt(params.limit) ? parseInt(params.limit) : null;
    let skip = parseInt(params.page)
      ? (parseInt(params.page) - 1) * parseInt(params.limit)
      : null;
    let sort = params.sort ? JSON.parse(params.sort) : null;

    let medias = await MediaService.find(
      {
        status: sails.config.custom.STATUS.ACTIVE,
        school: req.me.school,
      },
      limit,
      skip,
      sort
    );

    return res.ok({ data: medias });
  },

  listByIds: async (req, res) => {
    sails.log.info(
      "================================ MediaController.search => START ================================"
    );
    let params = req.allParams();

    let ids = params.ids ? params.ids.split(",") : [];

    let medias = await MediaService.find(
      {
        id: { in: ids },
        status: sails.config.custom.STATUS.ACTIVE,
        school: req.me.school,
      },
      null,
      null,
      null
    );

    return res.ok({ data: medias });
  },
};

module.exports = BackendMediaController;
