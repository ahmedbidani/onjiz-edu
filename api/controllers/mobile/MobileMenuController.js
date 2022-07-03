/**
 * MenuController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
*/
const ErrorMessage = require('../../../config/errors');
const MenuService = require('../../services/MenuService');

module.exports = {

  search: async (req, res) => {
    let params = req.allParams();

    if (!params.classId) {
      return res.badRequest(ErrorMessage.MENU_ERR_CLASSID_REQUIRED);
    } else if (!params.dateUse) {
      return res.badRequest(ErrorMessage.MENU_ERR_DATE_REQUIRED);
    }
    const tmpData = {
      class: params.classId,
      dateUse: params.dateUse
    };

    const find = await MenuService.find(tmpData);
    if (find.length > 0) {
      let i, j, k;

      for (i = 0; i < find.length; i++) {
        if (find[i].slotFeedings.length > 0) {
          for (j = 0; j < find[i].slotFeedings.length; j++) {
            if (find[i].slotFeedings[j].foods != null) {
              if (find[i].slotFeedings[j].foods.length > 0) {
                //get food objs by order
                for (k = 0; k < find[i].slotFeedings[j].foods.length; k++){
                  let foodObj = await Food.findOne({ id: find[i].slotFeedings[j].foods[k] });
                  if (foodObj) find[i].slotFeedings[j].foods[k] = foodObj
                }
                // let findFoods = await Food.find({ id: { 'in': find[i].slotFeedings[j].foods } });
                // if (findFoods && findFoods.length > 0) {
                //   find[i].slotFeedings[j].foods = findFoods;
                // }
              }
            }
          }
        }
      }
    }
    return res.ok({
      data: find
    });
  },

  add: async (req, res) => {
    sails.log.info("================================ MenuController.add => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();

    // CHECK TITLE & NUTRITION & DESCRIPTION PARAMS
    if (!params.title || !params.title.trim().length) {
      return res.badRequest(ErrorMessage.FOOD_ERR_TITLEFOOD_REQUIRED);
    } else if (!params.nutrition || !params.nutrition.trim().length) {
      return res.badRequest(ErrorMessage.FOOD_ERR_NUTRITION_REQUIRED);
    } else if (!params.description || !params.description.trim().length) {
      return res.badRequest(ErrorMessage.FOOD_ERR_DESCRIPTION_REQUIRED);
    }

    // PREPARE DATA FOOD
    const newData = {
      title: params.title, // REQUIRED
      nutrition: params.nutrition, // REQUIRED
      description: params.description, // REQUIRED
      status: params.status ? params.status : sails.config.custom.STATUS.DRAFT,

    };

    // ADD NEW DATA FOOD
    const newMenu = await MenuService.add(newData);

    // RETURN DATA FOOD
    return res.ok(newMenu);
  },

  get: async (req, res) => {
    sails.log.info("================================ MenuController.get => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();

    // CHECK ID PARAM
    if (!params.id) {
      return res.badRequest(ErrorMessage.MENU_ERR_ID_REQUIRED);
    }

    // QUERY & CHECK DATA FOOD
    const foods = await MenuService.get({
      id: params.id
    });
    if (!foods) {
      return res.notFound(ErrorMessage.MENU_ERR_NOT_FOUND);
    }

    // RETURN DATA FOOD
    return res.json({
      data: foods
    });
  },

  edit: async (req, res) => {
    sails.log.info("================================ MenuController.edit => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();

    // CHECK TITLE & NUTRITION & DESCRIPTION PARAMS 
    if (!params.title || !params.title.trim().length) {
      return res.badRequest(ErrorMessage.MENU_ERR_TITLE_REQUIRED);
    } else if (!params.nutrition || !params.nutrition.trim().length) {
      return res.badRequest(ErrorMessage.FOOD_ERR_NUTRITION_REQUIRED);
    } else if (!params.description || !params.description.trim().length) {
      return res.badRequest(ErrorMessage.FOOD_ERR_DESCRIPTION_REQUIRED);
    }

    // PREPARE DATA FOOD
    const newData = {
      title: params.title, // REQUIRED
      nutrition: params.nutrition, // REQUIRED
      description: params.description, // REQUIRED
      status: params.status ? params.status : sails.config.custom.STATUS.DRAFT,

    };

    // CHECK DATA FOOD
    const foods = MenuService.get({
      id: params.id
    });
    if (!foods) {
      return res.notFound(ErrorMessage.MENU_ERR_NOT_FOUND);
    }

    // UPDATE DATA FOOD
    const editObj = await MenuService.edit({
      id: params.id
    }, newData);

    // RETURN DATA FOOD
    return res.json({
      data: editObj
    });
  },

  trash: async (req, res) => {
    sails.log.info("================================ MenuController.trash => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();

    // CHECK IDS PARAM
    if (!params.ids || !params.ids.length) {
      return res.badRequest(ErrorMessage.MENU_ERR_ID_REQUIRED);
    }

    // CHECK FOOD & UPDATE
    const foods = await MenuService.find({
      id: params.ids
    });
    if (typeof params.ids === 'string') {
      if (!foods.length) {
        return res.badRequest(ErrorMessage.MENU_ERR_NOT_FOUND);
      } else {
        // nothing to do
      }
    } else {
      if (foods.length !== params.ids.length) {
        return res.badRequest(ErrorMessage.MENU_ERR_NOT_FOUND);
      } else {
        // nothing to do
      }
    }

    await Menu.update({
      id: params.ids
    }).set({
      status: sails.config.custom.STATUS.TRASH
    });

    // RETURN DATA
    return res.json();
  }
};
