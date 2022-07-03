/**
 * @copyright 2017 @ ZiniMediaTeam
 * @author dungha
 * @create 2019/05/29
 * @update 2019/05/29
 * @file api/models/Taxonomy.js
 * @description Taxonomy - Chuyên mục
 */

module.exports = {

  attributes: {
    title: {                            //Category, playlist, character
      type: 'string',
      required: true
    },
    description: {                      //Category, character
      type: 'string'
    },
    type: {                             //Category, tag
      type: 'string',
      required: true
    },
    parent: {                           //Category
      model: 'taxonomy'
    },
    postsOfCat: {                 //For Playlists
      collection: 'post',
      via: 'category',
      through: 'post_category'
    },
    postsOfTag: {                 //For Playlists
      collection: 'post',
      via: 'tag',
      through: 'post_tag'
    },
    status: {                           //Integer {"TRASH":,"DRAFT":,"ACTIVE":, SCHEDULE:}
      type: 'number',
      isIn: [sails.config.custom.STATUS.TRASH, sails.config.custom.STATUS.DRAFT, sails.config.custom.STATUS.ACTIVE],
      defaultsTo: sails.config.custom.STATUS.DRAFT
    },
    school: {
      model: 'school',
      required: true
    }
  }
};