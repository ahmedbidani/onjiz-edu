/**
 * MediaController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const moment = require('moment');
const Sharp = require('sharp/lib');

const ErrorMessage = require('../../../config/errors');
const MediaService = require('../../services/MediaService');

module.exports = {
  newMedia: async (req, res) => {
    let params = req.allParams();
    let sizeMedia = 10;
    let fromPosition = (params.page - 1) * sizeMedia;
    let newMedia = await MediaService.find({ status: sails.config.custom.STATUS.PUBLISH }, sizeMedia, fromPosition, null);

    return res.json({
      code: 'SUCCESS_200',
      data: newMedia
    });
  },

  add: async (req, res) => {

    // GET ALL PARAMS
    const params = req.allParams();
    if (!params.school) return res.badRequest(ErrorMessage.SCHOOL_ID_REQUIRED);
		//upload file
		let filesUpload = [];
		if (req.file('files[]')) {
			let ofiles = await sails.helpers.uploadFile.with({
				req: req,
				file: 'files[]'
			});
			if (ofiles.length) {
				let count = 0;
				for (let file of ofiles) {
					filesUpload.push({
						thumbnail: {
							width: 0,
							height: 0,
							path: '',
							sizes: {}
						}
					});
					// sails.log('ofiles', file);
					let filename = file.fd.replace(/^.*[\\\/]/, '');
					filename = filename.split('.');
					let uploadConfig = sails.config.custom.UPLOAD;
					//sails.log(uploadConfig.PATH_FOLDER);
					for (let size of uploadConfig.SIZES) {
						let destFileName = filename[0] + '_' + size.name + '.' + filename[1];
						if (size.type == 'origin') {
							Sharp(file.fd).resize(size.width)
								.toFile(require('path').resolve(uploadConfig.PATH_FOLDER, 'assets/uploads/') + '/' + moment().format('YYYY/MM') + '/' + destFileName)
								.then((info) => {
									//filesUpload[count].thumbnail.width = info.width;
                					//filesUpload[count].thumbnail.height = info.height;
								 }).catch((err) => { sails.log(err); });
							filesUpload[count].thumbnail.path = 'assets/uploads/' + moment().format('YYYY/MM') + '/' + destFileName;
						} else {
							Sharp(file.fd).resize(size.width, size.height)
								.toFile(require('path').resolve(uploadConfig.PATH_FOLDER, 'assets/uploads/') + '/' + moment().format('YYYY/MM') + '/' + destFileName)
								.then((info) => { }).catch((err) => { sails.log(err); });
							filesUpload[count].thumbnail.sizes[size.type] = {
								width: size.width, height: size.height,
								path: '/uploads/' + moment().format('YYYY/MM') + '/' + destFileName
							};
						}
					}
					count++;
				}
			}
		}

		if (filesUpload.length == 0) {
			return res.badRequest(ErrorMessage.MEDIA_UPLOAD_FAILDED);
		}

		// PREPARE DATA MEDIA
		let medias = [];
		for (let file of filesUpload) {
			let newData = {
				title: params.title ? params.title : String(moment().valueOf()), // REQUIRED
				thumbnail: file.thumbnail,
				caption: (params.caption && params.caption.trim().length) ? params.caption : '',
				status: params.status ? params.status : sails.config.custom.STATUS.ACTIVE,
        uploadBy: params.user,
        school: params.school
			};

			// ADD NEW DATA MEDIA
			medias.push(await MediaService.add(newData));
    }
    
    let mediaIds = medias.map(item => item.id);

		// RETURN DATA MEDIA
		return res.json({
			data: mediaIds
		});
  },

  get: async (req, res) => {
    // GET ALL PARAMS
    const params = req.allParams();

    // CHECK ID PARAM
    if (!params.id) {
      return res.badRequest(ErrorMessage.MEDIA_ERR_ID_REQUIRED);
    }

    // QUERY & CHECK DATA MEDIA
    const media = await MediaService.get({
      id: params.id
    });
    if (!media) {
      return res.notFound(ErrorMessage.MEDIA_ERR_NOT_FOUND);
    }

    // RETURN DATA MEDIA
    return res.json({
      data: media
    });
  },

  edit: async (req, res) => {
    // GET ALL PARAMS
    const params = req.allParams();

    // CHECK TITLE & PATH PARAMS
    if (!params.title || !params.title.trim().length) {
      return res.badRequest(ErrorMessage.MEDIA_ERR_TITLEMEDIA_REQUIRED);
    } else if (!params.path || !params.path.trim().length) {
      return res.badRequest(ErrorMessage.MEDIA_ERR_PATH_REQUIRED);
    }

    // PREPARE DATA MEDIA
    const newData = {
      title: params.title, // REQUIRED
      caption: (params.caption && params.caption.trim().length) ? params.caption : '',
      status: params.status ? params.status : sails.config.custom.STATUS.DRAFT
    };

    // CHECK DATA MEDIA
    const media = MediaService.get({
      id: params.id
    });
    if (!media) {
      return res.notFound(ErrorMessage.MEDIA_ERR_NOT_FOUND);
    }

    // UPDATE DATA MEDIA
    const editObj = await MediaService.edit({
      id: params.id
    }, newData);

    // RETURN DATA MEDIA
    return res.json({
      data: editObj[0]
    });
  },

  trash: async (req, res) => {
    // GET ALL PARAMS
    const params = req.allParams();

    // CHECK IDS PARAM
    if (!params.ids || !params.ids.length) {
      return res.badRequest(ErrorMessage.MEDIA_ERR_ID_REQUIRED);
    }

    // CHECK MEDIA & UPDATE
    const medias = await MediaService.find({
      id: params.ids
    });
    if (typeof params.ids === 'string') {
      if (!medias.length) {
        return res.badRequest(ErrorMessage.MEDIA_ERR_NOT_FOUND);
      } else {
        // nothing to do
      }
    } else {
      if (medias.length !== params.ids.length) {
        return res.badRequest(ErrorMessage.MEDIA_ERR_NOT_FOUND);
      } else {
        // nothing to do
      }
    }

    await Media.update({
      id: params.ids
    }).set({
      status: sails.config.custom.STATUS.TRASH
    });

    // RETURN DATA
    return res.json();
  },

  search: async (req, res) => {
    // GET ALL PARAMS
    const params = req.allParams();

    // PREAPARE BODY PARAMS
    const bodyParams = {
      filter: (params.filter && params.filter.trim().length) ? JSON.parse(params.filter) : null,
      limit: params.limit ? Number(params.limit) : null,
      offset: params.offset ? Number(params.offset) : null,
      sort: (params.sort && params.sort.trim().length) ? JSON.parse(params.sort) : null
    };

    let where = {};
    if (bodyParams.filter.status) {
      where = {
        status: bodyParams.filter.status === sails.config.custom.STATUS.ALL ? {
          '>=': sails.config.custom.STATUS.ALL
        } : bodyParams.filter.status
      }
    } else if (bodyParams.filter.rangeDate.active) {
      where = {
        createdAt: {
          '>=': moment(bodyParams.filter.rangeDate.begin).valueOf(),
          '<=': moment(bodyParams.filter.rangeDate.end).valueOf()
        }
      }
    } else if (typeof bodyParams.filter.keyWord === "string" && bodyParams.filter.keyWord.trim().length) {
      where = {
        title: {
          contains: bodyParams.filter.keyWord
        }
      }
    } else {
      // nothing to do
    }

    let condition;
    if (params.condition && !Utils.isJsonString(params.condition)) {
      return res.serverError(ErrorService.SYSTEM_JSON_FORMAT_FAIL);
    } else {
      condition = (params.condition) ? JSON.parse(params.condition) : null;
    }

    if (condition) {
      where = condition;
    }

    // QUERY DATA MEDIA
    const medias = await MediaService.find(where, bodyParams.limit, bodyParams.offset, bodyParams.sort),
      total = await MediaService.count({
        status: {
          '>=': sails.config.custom.STATUS.ALL
        }
      }),
      trash = await MediaService.count({ status: sails.config.custom.STATUS.TRASH }),
      publish = await MediaService.count({ status: sails.config.custom.STATUS.PUBLISH });

    // RETURN DATA MEDIAS
    return res.json({
      recordsTotal: total,
      recordsTrash: trash,
      recordsPublish: publish,
      data: medias
    });
  }

};
