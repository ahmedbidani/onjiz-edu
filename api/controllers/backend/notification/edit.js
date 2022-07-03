

/**
 * notification/edit.js
 *
 * @description :: Server-side controller action for handling incoming requests.
 * @help        :: See https://sailsjs.com/documentation/concepts/controllers
 */
module.exports = {

  friendlyName: 'Notification Management',

  description: 'Notification Management',

  inputs: {

  },

  exits: {

    success: {
      viewTemplatePath: 'zadmin/pages/notification/index',
    },

    redirect: {
      responseType: 'redirect'
    }

  },

  fn: async function (inputs, exits) {

    if (!this.req.administrator) {
      throw { redirect: '/zadmin' };
    }

    //init
    let _cust = sails.config.custom;
    let _paging = _cust.PAGING;
    let _default = await sails.helpers.getDefaultData();

    let pagingUrl = null;
    _default = _.extend({
      CURRENT_PAGE: _cust.PAGE.NOTIFICATION,
      contentTop: {
        caption: sails.__('Notification.Management')
      }
    }, _default);
    pagingUrl =_cust.URL.NOTIFICATION;
    
    let notification = await Notification.info(this.req.param('id'));

    _default.editNotification = notification;

    let keyword = this.req.param(_paging.PAR_SEARCH)||'';
    let sort = this.req.param(_paging.PAR_SORT) || 'updatedAt';
    let order = this.req.param(_paging.PAR_ORDER) || 'DESC';
    let page = this.req.param(_paging.PAR_PAGE) || 1;
    let limit = _paging.LIMIT;

    let _params = {
      sort: sort,
      order: order,
      page: page,
      limit: limit,
      cond: null
    }; 

    if(keyword != ''){
      _params.search = keyword;
      _default.searchText = keyword;
    }
    _default.orderArrow = order.toLowerCase();
    _default.currentSort = sort;
    _default.curPaging = page;
    
    //[START] build tree category multi level
    // _default.treeCategory = [];
    // let allCategories = await Notification.listAllNotification();
    // let recursiveMenu = (cont, listCategories, parentId = 0, space = '') => {
    //   _.each(listCategories, (cate, index) => {
    //     if (cate.parent == parentId) {
    //       cate.space = space;
    //       cont.push(cate);
    //       recursiveMenu(cont, listCategories, cate.id, space + '|-- ');
    //     }
    //   });
    // };
    // recursiveMenu(_default.treeCategory, allCategories);
    //[END] build tree category multi level

    //get list taxonomies
    _default.listNotification = await Notification.list(_params);

    //callback
    let totals = 0;
    if(keyword != ''){
      totals = await Notification.total({
        search: _params.search
      })
    } else {
      totals = await Notification.total({})
    }
    
    // sails.log('totals: ' + totals);    
    _default.pagingData = await sails.helpers.getPagingData.with({ 
      url: pagingUrl, 
      page: page, 
      totals: totals, 
      limit: _paging.LIMIT 
    });
    // sails.log('pagingData: ');
    // sails.log(_default.pagingData);
    
    return exits.success(_default);
  }

};