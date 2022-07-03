/**
 * Menu Controller
 *
 * @description :: Server-side logic for managing Posts
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const ErrorMessages = require('../../../../config/errors');
const moment = require('moment');
const MenuService = require('../../../services/MenuService');

module.exports = {
  add: async (req, res) => {
    sails.log.info("================================ MenuController.add => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();
    let classes = params.classIds;
    let slotFeedings = params.slotFeedings;
    let currDate = moment().format("YYYY-MM-DD");
    let dateUse = params.dateUse ? moment(params.dateUse).format('YYYY-MM-DD') : currDate;
    // let dateStart = params.dateUseStart ? params.dateUseStart : currDate;
    // let dateEnd = params.dateUseEnd ? params.dateUseEnd : currDate;
    let status = params.status ? parseInt(params.status) : 1;

    // let duration = moment(dateEnd).diff(moment(dateStart), 'days');
    
    //get weekend of school
    let setting = await Setting.findOne({ key: 'web', school: req.me.school });
    let weekend = setting.value && setting.value.weekend ? setting.value.weekend : ['6', '7']; //6,7 is saturday and sunday

    //Add menu for one day
    let dayInWeek = moment(dateUse, "YYYY-MM-DD").isoWeekday();
      
    let isWeekend = weekend.includes(dayInWeek.toString());

    if (!isWeekend) {
      //create for each class
      if (classes && classes.length > 0) {
        for (let classId of classes) {
          // CHECK DATA MENU
          //Add Menu for one day, if Menu is existed => update Menu
          const menu = await Menu.findOne({
            dateUse: dateUse,
            class: classId
          });
          const newData = {
            slotFeedings: slotFeedings,
            dateUse: dateUse,
            status: status,
            class: classId,
            school: req.me.school
          };
          if (menu) {
            //return res.ok(ErrorMessages.Menu_EXISTED)
            await MenuService.edit({ id: menu.id }, newData);
          } else {
            await MenuService.add(newData);
          }
        }
      }
      return res.ok();
    } else {
      return res.badRequest(ErrorMessages.MENU_NOT_ALLOW_IN_WEEKEND);
    }
    
  },

  edit: async (req, res) => {
    sails.log.info("================================ MenuController.edit => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();
    let status = params.status ? parseInt(params.status) : 1;

    if (params.classIds && params.classIds.length > 0) {
      for (let classId of params.classIds) {
        // CHECK DATA MENU
        let menu = await Menu.findOne({
          dateUse: params.dateUse,
          class: classId
        });
        if (!menu) {
          // return res.notFound(ErrorMessages.MENU_NOT_FOUND);
          // PREPARE DATA MENU
          let newData = {
            dateUse: params.dateUse,
            slotFeedings: params.slotFeedings,
            status: status,
            class: classId
          };
          const newObj = await MenuService.add(newData);
        } else {
          // PREPARE DATA MENU
          let editData = {
            dateUse: params.dateUse,
            slotFeedings: params.slotFeedings,
            status: status
          };
          // UPDATE DATA MENU
          const editObj = await MenuService.edit({
            id: menu.id
          }, editData);
        }
      }
    }
    return res.json();
  },

  get: async (req, res) => {
    sails.log.info("================================ MenuController.get => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();
    // QUERY & CHECK DATA MENU
    const menu = await MenuService.get({
      id: params.id
    });
    if (!menu) {
      return res.notFound(ErrorMessages.MENU_NOT_FOUND);
    }
    const foods = await Food.find({ school: req.me.school });
    const classes = await Class.find({})
    let result = {
      menuObj: menu,
      foods: foods,
      classes: classes
    }
    // RETURN DATA MENU
    return res.json(result);
  },

  getByDateUse: async (req, res) => {
    // GET ALL PARAMS
    const params = req.allParams();
    if (!params.classId) return res.badRequest(ErrorMessages.CLASS_ID_REQUIRED);
    if (!params.courseSession) return res.badRequest(ErrorMessages.COURSE_SESSION_ID_REQUIRED);
    if (!params.dateUse) return res.badRequest(ErrorMessages.DATE_USE_REQUIRED);

    const foods = await Food.find({ school: req.me.school });
    const classes = await Class.find({ school: req.me.school });
    
    //check role of current logged in user
    let permissions = {};
    let schoolObj = await School.findOne({ id: req.me.school });
    permissions.isMainSchoolAdmin = schoolObj.admin == req.me.id ? true : false;
    permissions.isHavePermissionEdit = false;
    permissions.isHavePermissionDelete = false;
    if (!permissions.isMainSchoolAdmin && req.me.role && req.me.role.permissions && req.me.role.permissions.menu) {
      permissions.isHavePermissionEdit = req.me.role.permissions.menu.edit ? true : false;
      permissions.isHavePermissionDelete = req.me.role.permissions.menu.delete ? true : false;
    }

    let menuObj = await Menu.findOne({ dateUse: params.dateUse, class: params.classId });
    if (menuObj) {
      if (menuObj.class == params.classId) {
        let listFood = await Food.find({ school: req.me.school });
        let listFoodParseObj = {};
        for (let itemFood of listFood) {
          listFoodParseObj[itemFood.id] = itemFood;
        }
        // create range time format
        let setting = await Setting.findOne({ key: 'web', school: req.me.school });
        let rangeTime = [];
        if (setting.value && setting.value.rangeTimeMenu) {
          rangeTime = setting.value.rangeTimeMenu;
          //add list = [] to each element
          rangeTime = rangeTime.map(item => ({ ...item, list: [] }));

        }
        if (rangeTime.length == 0)
          rangeTime = [
            {
              name: "Bữa sáng",
              timeStart: "07:00",
              timeEnd: "10:00",
              list: []
            },
            {
              name: "Bữa trưa",
              timeStart: "10:00",
              timeEnd: "14:00",
              list: []
            },
            {
              name: "Bữa xế",
              timeStart: "14:00",
              timeEnd: "16:00",
              list: []
            },
            {
              name: "Bữa chiều",
              timeStart: "16:00",
              timeEnd: "17:30",
              list: []
            },
          ];
        
        //sort by time
        menuObj.slotFeedings.sort((a, b) => (a.time > b.time) ? 1 : -1)
        for (let i = 0; i < menuObj.slotFeedings.length; i++) {
          let row = menuObj.slotFeedings[i]; //row is array id food
          let rowNew = { //row new is repare obj food by id
            time: menuObj.slotFeedings[i].time,
            food: []
          }
          for (let j = 0; j < menuObj.slotFeedings[i].foods.length; j++) {
            rowNew.food.push(listFoodParseObj[menuObj.slotFeedings[i].foods[j]]) //push obj by id to array rowNew.food
          }
          let findRangeIndex = rangeTime.findIndex(
            // r => (moment(r.timeStart).format('h:mma') === moment(row.time).format('h:mma') || moment(r.timeStart, 'h:mma').isBefore(moment(row.time, 'h:mma'))) && (moment(row.time).format('h:mma') === moment(r.timeEnd).format('h:mma') || moment(row.time, 'h:mma').isBefore(moment(r.timeEnd, 'h:mma')))
            r => (moment(row.time, 'h:mma' ).isBetween(moment(r.timeStart, 'h:mma'),moment(r.timeEnd, 'h:mma')) || moment(row.time, 'h:mma' ).isSame(moment(r.timeStart, 'h:mma')) || moment(row.time, 'h:mma' ).isSame(moment(r.timeEnd, 'h:mma')) )
          );
          if (findRangeIndex != -1) rangeTime[findRangeIndex].list.push(rowNew);
        }
        // create html for render
        // let htmlCard = '';
        // for (let i = 0; i < rangeTime.length; i++) {
        //   let timesRange = '';
        //   for (let j = 0; j < rangeTime[i].list.length; j++) {
        //     let titleFood = '';
        //     for (let k = 0; k < rangeTime[i].list[j].food.length; k++) {
        //       titleFood += `<p>${rangeTime[i].list[j].food[k].title}</p>`
        //     }
        //     timesRange +=
        //       `<li>
        //         <h6 class="font-weight-bold">${rangeTime[i].list[j].time}</h6>
        //         ${titleFood}
        //       </li>`
        //   }
        //   htmlCard +=
        //     `<div class="card">
        //   <div class="card-header" role="tab" id="heading-${i}">
        //     <h6 class="mb-0">
        //       <a data-toggle="collapse" href="#collapse-${i}" aria-expanded="${i == 0 ? true : false}"
        //         aria-controls="collapse-${i}">
        //         ${rangeTime[i].name} (Từ ${rangeTime[i].timeStart} đến ${rangeTime[i].timeEnd})
        //       </a>
        //     </h6>
        //   </div>
        //   <div id="collapse-${i}" class="collapse ${i == 0 ? 'show' : ''}" role="tabpanel" aria-labelledby="heading-${i}" data-parent="#accordion">
        //     <div class="card-body">
        //       <div class="row">
        //         <div class="col-12">
        //             ${timesRange == '' ? '<h6 class="font-weight-bold">Chưa có thực đơn cho khung giờ này</h6>' : '<ul class="bullet-line-list">'+timesRange+'</ul>'}
        //         </div>
        //       </div>
        //     </div>
        //   </div>
        // </div>`
        //}

        // RETURN DATA SUBJECT
        return res.json({ menu: menuObj, rangeTime: rangeTime, foods : foods, classes : classes, permissions });
      } else {
        return res.ok({ menu: menuObj, rangeTime: [], foods: foods, classes: classes, permissions });
      }
    } else {
      return res.ok({ menu: {}, rangeTime: [], foods: foods, classes: classes, permissions });
    }
  },
  
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
  },

  delete: async (req, res) => {
    sails.log.info("================================ MenuController.delete => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();
    if (!params.id) return res.badRequest(ErrorMessages.MENU_ID_REQUIRED);

    let menuObj = await MenuService.get({ id: params.id });
    if (!menuObj) return res.badRequest(ErrorMessages.MENU_NOT_FOUND);
    MenuService.del({ id: params.id });
    
    return res.ok();
  },
}
