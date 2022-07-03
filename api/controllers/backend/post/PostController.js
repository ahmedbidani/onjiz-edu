/**
 * PostController
 *
 * @description :: Server-side logic for managing Posts
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

let ejs = require('ejs');
let moment = require('moment');
const ErrorMessages = require('../../../../config/errors');
const Sharp = require('sharp/lib');
const PostService = require('../../../services/PostService');
const MediaService = require('../../../services/MediaService');
const makeDir = require('make-dir');
const fs = require('fs');
function nonAccentVietnamese(str) {
  str = str.toLowerCase();
  //     We can also use this instead of from line 11 to line 17
  //     str = str.replace(/\u00E0|\u00E1|\u1EA1|\u1EA3|\u00E3|\u00E2|\u1EA7|\u1EA5|\u1EAD|\u1EA9|\u1EAB|\u0103|\u1EB1|\u1EAF|\u1EB7|\u1EB3|\u1EB5/g, "a");
  //     str = str.replace(/\u00E8|\u00E9|\u1EB9|\u1EBB|\u1EBD|\u00EA|\u1EC1|\u1EBF|\u1EC7|\u1EC3|\u1EC5/g, "e");
  //     str = str.replace(/\u00EC|\u00ED|\u1ECB|\u1EC9|\u0129/g, "i");
  //     str = str.replace(/\u00F2|\u00F3|\u1ECD|\u1ECF|\u00F5|\u00F4|\u1ED3|\u1ED1|\u1ED9|\u1ED5|\u1ED7|\u01A1|\u1EDD|\u1EDB|\u1EE3|\u1EDF|\u1EE1/g, "o");
  //     str = str.replace(/\u00F9|\u00FA|\u1EE5|\u1EE7|\u0169|\u01B0|\u1EEB|\u1EE9|\u1EF1|\u1EED|\u1EEF/g, "u");
  //     str = str.replace(/\u1EF3|\u00FD|\u1EF5|\u1EF7|\u1EF9/g, "y");
  //     str = str.replace(/\u0111/g, "d");
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  // Some system encode vietnamese combining accent as individual utf-8 characters
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền sắc hỏi ngã nặng
  str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ê, Ă, Ơ, Ư
  return str;
}
module.exports = {

  add: async (req, res) => {
    const params = req.allParams();

    if (req.method === 'GET') return res.badRequest(ErrorMessages.SYSTEM_METHOD_NOT_ALLOWED);
    if (!params.title) return res.badRequest(ErrorMessages.POST_TITLE_REQUIRED);
    if (!params.description || params.description == '') return res.badRequest(ErrorMessages.POST_DESCRIPTION_REQUIRED);
    let alias = nonAccentVietnamese(params.title);
    let newData = {
      title: params.title,
      alias: alias.replace(/\s/g, '-'),
      motto: params.motto,
      description: params.description,
      metaKeyword: params.metaKeyword,
      metaTitle: params.metaTitle,
      metaDescription: params.metaDescription,
      media: params.thumbnail,
      categories: params.categories,
      tags: params.tags,
      status: params.status,
      type: params.type,
      author: req.session.userId,
      school: req.me.school
    };

    let newPost = await PostService.add(newData);

    return res.json(newPost);
  },

  get: async (req, res) => {
    sails.log.info("================================ PostController.get => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();

    // CHECK PARAM
    if (!params.id) return res.badRequest(ErrorMessages.POST_ID_REQUIRED);

    // QUERY & CHECK DATA POST
    const postObj = await PostService.get({
      id: params.id
    });
    if (!postObj) {
      return res.notFound(ErrorMessages.POST_OBJECT_NOT_FOUND);
    }
    // RETURN DATA POST
    return res.ok(postObj);
  },

  edit: async (req, res) => {

    const params = req.allParams();

    if (req.method === 'GET') return res.badRequest(ErrorMessages.SYSTEM_METHOD_NOT_ALLOWED);
    if (!params.id) return res.badRequest(ErrorMessages.POST_ID_REQUIRED);
    if (!params.title) return res.badRequest(ErrorMessages.POST_TITLE_REQUIRED);

    let _postData = {
      id: params.id,
      title: params.title,
      motto: params.motto,
      description: params.description,
      metaKeyword: params.metaKeyword,
      metaTitle: params.metaTitle,
      metaDescription: params.metaDescription,
      media: params.thumbnail,
      categories: params.categories,
      tags: params.tags,
      status: params.status,
      type: params.type,
      author: req.session.userId
    };

    let editPost = await PostService.edit(params.id, _postData);

    return res.json(editPost);
  },

  info: async (req, res) => {
    let post = await Post.info(req.param('id'));
    return res.json(post);
  },

  total: async (req, res) => {
    let totals = await Post.total({});
    return res.json({ totals: totals });
  },

  totalStatus: async (req, res) => {
    let status = req.param('status');
    let totals = await Post.total({ search: status });
    return res.json({ totals: totals });
  },

  trash: async (req, res) => {
    sails.log.info("================================ PostController.trash => START ================================");
    let params = req.allParams();
    if (!params.ids) return res.badRequest(ErrorMessages.POST_ID_REQUIRED);
    // Call constructor with custom options:
    let data = { status: sails.config.custom.STATUS.TRASH };
    let ids = params.ids;
    if (params.ids.indexOf(';') != -1) {
      ids = ids.split(';');
    }
    if (typeof (ids) == 'object') {
      for (var i = 0; i < ids.length; i++) {
        let post = await PostService.get({ id: ids[i] });
        if (post) PostService.del({ id: ids[i] });
        // let posts = await PostService.get({ id: ids[i] });
        // if (posts && posts.status == data.status) {
        //   PostService.del({ id: ids[i] });
        // } else if (posts) {
        //   await Post.update({ id: ids[i] }).set({ status: data.status });
        // }
      }
    } else {
      let post = await PostService.get({ id: ids });
      if (post) PostService.del({ id: ids });
      // let posts = await PostService.get({ id: ids });
      // if (posts && posts.status == data.status) {
      //   PostService.del({ id: ids });
      // } else if (posts) {
      //   await Post.update({ id: ids }).set({ status: data.status });
      // }
    }
    // RETURN DATA
    return res.ok();
  },

  publish: async (req, res) => {
    let ids = req.param('ids');

    let totals = await Post.publish({ ids: ids });
    return res.json({ totals: totals });
  },

  push: async (req, res) => {
    let users = null;
    let _ids = req.param('ids');

    await sails.helpers.expoPushPosts.with({
      newsIds: _ids
    });

    return res.ok();
  },

  search: async (req, res) => {
    sails.log.info("================================ PostController.search => START ================================");
    let params = req.allParams();
    let keyword = params.keyword ? params.keyword : null;
    let categoryId = params.categoryId ? params.categoryId : null;
    let tagId = params.tagId ? params.tagId : null;
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

    //let sort = (params.sort) ? JSON.parse(params.sort) : null;
    // let sort = null;
    let newSort = {};
    if (params.order) {
      let objOrder = {};
      objOrder[params.columns[params.order[0].column].data] = params.order[0].dir;
      // sort = [objOrder];
      for (var key in objOrder) {
        if (objOrder[key] == 'desc') {
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
          { title: { $regex: keyword, $options: 'i' } },
        ]
      }
    }

    let mongo = require('mongodb');
    where.$and = [
      { type: params.type ? parseInt(params.type) : 0 },
      { school: new mongo.ObjectID(req.me.school) }
    ];

    //get categoryid from post
    let postIds = [];
    if (categoryId && categoryId != '0' && categoryId != 'undefined' && categoryId != 'null' && categoryId != '-1') {
      let cateObj = await Taxonomy.findOne({ id: categoryId, school: req.me.school }).populate('postsOfCat');
      if (cateObj) {
        postIds = cateObj.postsOfCat.map((cate) => {
          return new mongo.ObjectID(cate.id);
        })
      }
      where.$and.push({ _id: { $in: postIds } });
    }

    //get tagid from post
    if (tagId && tagId != '0' && tagId != 'undefined' && tagId != 'null' && tagId != '-1') {
      let tagObj = await Taxonomy.findOne({ id: tagId, school: req.me.school }).populate('postsOfTag');
      if (tagObj) {
        postIds = tagObj.postsOfTag.map((tg) => {
          return new mongo.ObjectID(tg.id);
        })
      }
      where.$and.push({ _id: { $in: postIds } });
    }


    // if (params.status && params.status != '-1') {
    //   where.$and.push({ status: parseInt(params.status) });
    // }
    // if (params.tagId && params.tagId == 0) {
    //   where.$and.push({ tagId: params.tagId });
    // }
    if (params.status && params.status != 0) {
      where.$and.push({ status: parseInt(params.status) });
    }
    /**SEARCH CASE_INSENSITIVE */
    const collection = Post.getDatastore().manager.collection(Post.tableName);
    let result = [];
    if (params.length && params.start) {
      result = await collection.find(where).limit(limit).skip(skip).sort(newSort);
    } else {
      result = await collection.find(where).sort(newSort);
    }
    const totalPost = await collection.count(where);
    const dataWithObjectIds = await result.toArray();
    const arrObjPost = JSON.parse(JSON.stringify(dataWithObjectIds).replace(/"_id"/g, '"id"'));
    // let where = {
    //   status: params.status ? params.status : 1,
    // };
    // if (typeof keyword === "string" && keyword.length > 0) {
    //   where = {
    //     or: [
    //       {
    //         title: { contains: keyword }
    //       }
    //     ],
    //     status: status
    //   };
    // }
    // let arrObjPost = await PostService.find(where, limit, skip, sort);
    let resPost = [];
    for (let postObj of arrObjPost) {
      let post = await PostService.get({ id: postObj.id });
      let tmpData = {};
      post.url = post.type == 0 ? '/backend/post/edit/' : '/backend/page/edit/';
      tmpData.id = '<input class="js-checkbox-item" type="checkbox" value="' + post.id + '">';
      tmpData.tool = await sails.helpers.renderRowAction(post, isMainSchoolAdmin, isHavePermissionEdit, isHavePermissionDelete);
      let thumbLink = '/images/no-thumb.png';
      if (post.media != null && post.media.thumbnail.sizes) {
        thumbLink = post.media.thumbnail.sizes.thumbnail.path;
      }
      tmpData.thumbnail = '<img class="news-img rounded" src="' + thumbLink + '">';
      tmpData.title = post.title;
      tmpData.copyURL = '/page/' + post.alias + '/' + post.id;
      // CHECK CATEGORIES
      if (post.categories.length > 0) {
        let strCate = '';
        _.each(post.categories, (categoryItem) => {
          strCate += `<a href="/backend/post/edit/` + post.id + `"><h4 class="my-0 mr-10 inline-block"><span class="badge badge-info">${categoryItem.title}</span></h4></a>`
        })
        tmpData.categories = strCate;
      } else {
        tmpData.categories = '-';
      }
      // CHECK TAGS
      if (post.tags.length) {
        let strTag = '';
        _.each(post.tags, (tagItem) => {
          strTag += `<h4 class="my-0 mr-10 inline-block"><span class="badge badge-secondary">${tagItem.title}</span></h4>`
        })
        tmpData.tags = strTag;
      } else {
        tmpData.tags = '-';
      }
      tmpData.author = post.author ? post.author.firstName + ' ' + post.author.lastName : '-';

      tmpData.status = '';
      if (isMainSchoolAdmin || isHavePermissionEdit) {
        if (post.status == 1) {
          tmpData.status = `
            <label class="switch">
              <input class="switchStatus" type="checkbox" data-id="${post.id}" checked>
              <span class="slider"></span>
            </label>`;
        } else {
          tmpData.status = `
            <label class="switch">
              <input class="switchStatus" type="checkbox" data-id="${post.id}">
              <span class="slider"></span>
            </label>`;
        }
      } else {
        if (post.status == 1) {
          tmpData.status = '<label class="badge badge-success">' + sails.__("Active") + '</label>';
        } else {
          tmpData.status = '<label class="badge badge-warning">' + sails.__("Draft") + '</label>';
        }
      }

      resPost.push(tmpData);
    };
    // let totalPost = await PostService.count(where);
    return res.ok({ draw: draw, recordsTotal: totalPost, recordsFiltered: totalPost, data: resPost, dataOriginal: arrObjPost });
  },

  uploadThumbnail: async (req, res) => {
    sails.log.info("================================ PostController.uploadThumbnail => START ================================");
    let params = req.allParams();
    if (req.file('file')) {
      let mediaResults = [];
      let arrMediaThumbSizes = [];
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
    sails.log.info("================================ PostController.switchStatus => START ================================");
    // // GET ALL PARAMS
    const params = req.allParams();
    if (!params.id) return res.badRequest(ErrorMessages.POST_ID_REQUIRED);

    //CHECK OBJ IS EXISTED?
    let postObj = await PostService.get({ id: params.id });
    if (!postObj) return res.badRequest(ErrorMessages.POST_OBJECT_NOT_FOUND);

    //switch status of current obj
    if (postObj.status == 1) postObj = await PostService.edit({ id: params.id }, { status: 0 });
    else postObj = await PostService.edit({ id: params.id }, { status: 1 });

    return res.json(postObj);
    // END UPDATE
  },
};

