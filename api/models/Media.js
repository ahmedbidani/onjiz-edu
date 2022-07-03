/**
 * @copyright 2017 @ ZiniMediaTeam
 * @author brianvo
 * @create 2017/10/23 01:05
 * @update 2017/10/23 01:05
 * @file api/models/Media.js
 * @description :: Media model.
 */

module.exports = {
  attributes: {
    title: {                            // 
      type: 'string',
      required: true,
      description: 'The title is how it appears on your site',
      example: 'Hello ZiniMedia Team'
    },
    caption: {                      // 
      type: 'string',
      description: 'The caption is how it talks on your filename.',
      example: 'The awesome picture'
    },
    thumbnail: {
      type: 'json'
    }, 
    post: {
      model: 'post'
    },
    status: {                           //Integer {"TRASH":,"DRAFT":,"ACTIVE":, SCHEDULE:}
      type: 'number',
      isIn: [sails.config.custom.STATUS.TRASH,sails.config.custom.STATUS.DRAFT,sails.config.custom.STATUS.ACTIVE],
      defaultsTo: sails.config.custom.STATUS.DRAFT
    },
    type: {                             //IMAGE, VIDEO, FILE
      type: 'number',
      isIn: [sails.config.custom.TYPE.IMAGE, sails.config.custom.TYPE.VIDEO, sails.config.custom.TYPE.FILE],
      defaultsTo: sails.config.custom.TYPE.IMAGE
    },
    uploadBy: {
      model: 'user',
      description: 'The user who created this item.'
    },
    school: {
      model: 'school',
      // required: true //disable required for add school photo when add new school
    }
  }
};