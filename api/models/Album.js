/**
 * @copyright 2017 @ ZiniMediaTeam
 * @author brianvo
 * @create 2017/10/23 01:05
 * @update 2017/10/23 01:05
 * @file api/models/Album.js
 * @description :: Album model.
 */

module.exports = {

  attributes: {
    title: {
      type: 'string',
      required: true,
      maxLength: 100,
      example: 'Example'
    },
    description: {
      type: 'string',
      maxLength: 200,
      example: 'Example is Description'
    },
    alias: {
      type: 'string',
      maxLength: 100,
      example: 'Example-example'
    },
    whoLike: {
      type: 'json',
      defaultsTo: []
    },
    status: {                           //Integer {"TRASH":,"DRAFT":,"ACTIVE":, SCHEDULE:}
      type: 'number',
      isIn: [sails.config.custom.STATUS.TRASH, sails.config.custom.STATUS.DRAFT, sails.config.custom.STATUS.ACTIVE],
      defaultsTo: sails.config.custom.STATUS.DRAFT
    },
    isWeb: {
      type: 'boolean',
      defaultsTo: true
    },
    owner: {
      model: 'user',  // Just allow teacher/staff/bod can upload album
      required: true
    },
    comments: { //LOAD ARRAY COMMENT with 4 atts: NAME, comment, time, avatar
      type: 'json',
      defaultsTo: []
    },
    photos: {
      type: 'json',
      defaultsTo: [], //Load arrray MEDIA IDs: ObjectId:["20232332", "3545353543"]
      description: 'photos belong to the album'
    },
    classObj: {
      model: 'class',
      //required: true
    },
    school: {
      model: 'school',
      required: true
    }
  }
};