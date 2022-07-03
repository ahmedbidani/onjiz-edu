/**
 * Menu Controller
 *
 * @description :: front-side logic for managing Menu
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */ 
const moment = require('moment');

module.exports = {
  search: async (req, res) => {
    sails.log.info("================================ MenuController.search => START ================================");
    let params = req.allParams();
    let start = moment(params.start).format("YYYY-MM-DD");
    let end = moment(params.end).format("YYYY-MM-DD");
    let listMenus = await Menu.find({ class: params.classId, dateUse: { '>=': start, '<=': end }, school: req.me.school });
    
    // Prepare Schedule
    let arrMenu = [];
    for (let menu of listMenus) {
      if(menu.slotFeedings.length) {
        for (let foodArr of menu.slotFeedings) {
          //slotFeeding: 07:00 have 2 kind of food (array): Milk + cake
          if(foodArr.foods.length) {
            for (let foodId of foodArr.foods) {
              let itemMenu = {};
              let _foodObj = await Food.findOne({ id: foodId });
              if(_foodObj) {
                itemMenu.title = _foodObj.title;
                itemMenu.start = menu.dateUse + 'T' + foodArr.time + ':00';
                arrMenu.push (itemMenu);
              }
            }
          }
        }
      }
    } 
    return res.ok(arrMenu);
  } 
}