/**
 * @copyright 2017 @ ZiniMediaTeam
 * @author brianvo
 * @create 2017/10/23 01:05
 * @update 2017/10/23 01:05
 * @file api/models/Menu.js
 * @description :: Menu  model.
 */

module.exports = {
  attributes: {
    slotFeedings: {
      type: 'json',
      description: 'List schedule data',
      defaultsTo: [{ "time": "07:00", "foods": [] }]
      //Format for food
      //"foods\":[{"title":"Banana", "description":"Banana","nutrition":0.25, "thumbnail":"/path/aa.jpg"}]
    },
    status: {                           //Integer {"TRASH":-1,"DRAFT":0,"ACTIVE":1}
      type: 'number',
      isIn: [sails.config.custom.STATUS.TRASH, sails.config.custom.STATUS.DRAFT, sails.config.custom.STATUS.ACTIVE],
      defaultsTo: sails.config.custom.STATUS.ACTIVE
    },
    dateUse: {
      type: 'string', /* Ngày áp dụng format YYYY-mm-dd*/
    },
    class: {
      model: 'class',
      // required: true
    },
    school: {
      model: 'school',
      required: true
    }
  }
};

/* ---------------------------------- */
// MONDAY
// {
// 	"slotFeedings": [
// 		{ "time": "07:30", "foods": ["5c6e679bd1d45c3f0c56ea59", "5c6e6b0ed1d45c3f0c56ea5a"] },
// 		{ "time": "09:00", "foods": ["5c6e6b23d1d45c3f0c56ea5b"] },
// 		{ "time": "10:00", "foods": ["5c6e6b37d1d45c3f0c56ea5c", "5c6e6b0ed1d45c3f0c56ea5a"] },
// 		{ "time": "11:00", "foods": ["5c6e6b45d1d45c3f0c56ea5d", "5c6e6b57d1d45c3f0c56ea5e"] },
// 		{ "time": "11:30", "foods": ["5c6e6b5dd1d45c3f0c56ea5f", "5c6e6b0ed1d45c3f0c56ea5a"] },
// 		{ "time": "14:30", "foods": ["5c6e6b6dd1d45c3f0c56ea60", "5c6e6b0ed1d45c3f0c56ea5a"] },
// 		{ "time": "16:00", "foods": ["5c6f625cd1d45c3f0c56ea88", "5c6e6b8fd1d45c3f0c56ea61", "5c6e6ba7d1d45c3f0c56ea62"] }
// 	],
// 	"dateUse": "2019-03-25"
// }
/* ---------------------------------- */
// TUESDAY
// {
// 	"slotFeedings": [
// 		{ "time": "07:30", "foods": ["5c6e6bb5d1d45c3f0c56ea63", "5c6e6b0ed1d45c3f0c56ea5a"] },
// 		{ "time": "09:00", "foods": ["5c6e6b23d1d45c3f0c56ea5b"] },
// 		{ "time": "10:00", "foods": ["5c6e6bc8d1d45c3f0c56ea64", "5c6e6b0ed1d45c3f0c56ea5a"] },
// 		{ "time": "11:00", "foods": ["5c6e6bd7d1d45c3f0c56ea65", "5c6e6be8d1d45c3f0c56ea66"] },
// 		{ "time": "11:30", "foods": ["5c6e6bfbd1d45c3f0c56ea67"] },
// 		{ "time": "14:30", "foods": ["5c6e6c18d1d45c3f0c56ea68", "5c6e6b0ed1d45c3f0c56ea5a"] },
// 		{ "time": "16:00", "foods": ["5c6e6caad1d45c3f0c56ea69", "5c6e6cb7d1d45c3f0c56ea6a", "5c6e6cc1d1d45c3f0c56ea6b"] }
// 	],
// 	"dateUse": "2019-02-04"
// }