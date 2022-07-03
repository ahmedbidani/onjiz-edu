module.exports = {
  exits: {
    success: {
      viewTemplatePath: "frontend/pages/page/detail",
      description: "Display the page detail page."
    },
    redirect: {
      responseType: "redirect"
    }
  },
  fn: async function(inputs, exits) {
    let _default = await sails.helpers.getFeDefaultData(this.req)
      .tolerate('noSchoolFound', () => {
        throw { redirect: '/login' };
      });
    
    let pageId = _default.params.id ? _default.params.id : null;
    let pageObj = await PostService.get({id: pageId});

    _default.pageObj = pageObj;
    return exits.success(_default);
  }
};
