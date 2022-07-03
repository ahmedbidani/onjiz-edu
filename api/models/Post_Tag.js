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
    postsOfTag: {
      model: 'post',
      required: true
    },
    tag: {
      model: 'taxonomy',
      required: true
    },
    count: {
      type: 'number',
      defaultsTo: 0
    }
  }
}