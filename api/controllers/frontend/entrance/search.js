module.exports = {
  exits: {
    success: {
      viewTemplatePath: "frontend/pages/entrance/search",
      description: "Display the search page."
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
    
    let keyword = _default.params.keyword;
    let limit = _default.PAGING.LIMIT;

    //Condition for search
    let where = {};
    if (typeof keyword === "string" && keyword.length > 0) {
      where = {
        $or: [
          { title: { $regex: keyword, $options: 'i' }},
          { motto: { $regex: keyword, $options: 'i' }},
        ]
      } 
    }
    let mongo = require('mongodb');
    where.$and = [
      { status: sails.config.custom.STATUS.ACTIVE },
      { school: new mongo.ObjectID(_default.school.id) }
    ];

    /**SEARCH CASE_INSENSITIVE EVENT */
    const collectionEvent = Event.getDatastore().manager.collection(Event.tableName);
    let result = await collectionEvent.find(where).limit(limit).skip(limit * (_default.pageActive - 1)).sort({ createdAt: -1 });
    const totalEvent = await collectionEvent.count(where);
    const dataEventWithObjectIds = await result.toArray();
    let arrObjEvent = JSON.parse(JSON.stringify(dataEventWithObjectIds).replace(/"_id"/g, '"id"'));

    /**SEARCH CASE_INSENSITIVE POST */
    const collectionPost = Post.getDatastore().manager.collection(Post.tableName);
    const totalPost = await collectionPost.count(where);
    //just get post if number of event in current page is smaller than PAGING.LIMIT
    if (arrObjEvent.length < limit) {
      let limitPost = arrObjEvent.length > 0 ? limit - arrObjEvent.length : limit;

      //calculate the skip of post
      let skipPost = 0;
      if(arrObjEvent.length == 0) {
        skipPost = limit * (_default.pageActive - Math.ceil(totalEvent / limit) - 1) + (_default.pageActive - 1) * limit - totalEvent;
      }
      // let skipPost = arrObjEvent.length > 0 ? 0 : limit * (_default.pageActive - Math.ceil(totalEvent / limit) - 1) + (_default.pageActive - 1) * limit - totalEvent;
      
      let result = await collectionPost.find(where).limit(limitPost).skip(skipPost).sort({ createdAt: -1 });
      const dataPostWithObjectIds = await result.toArray();
      let arrObjPost = JSON.parse(JSON.stringify(dataPostWithObjectIds).replace(/"_id"/g, '"id"'));
      arrObjEvent = arrObjEvent.concat(arrObjPost);
    }
    
    //total page of search
    let numberOfPages = Math.ceil((totalEvent + totalPost) / limit);

    //redirect if user type wrong params page
    if (_default.pageActive != 1 && _default.pageActive > numberOfPages) {
      throw { redirect: "/school/" + _default.school.code + "/search?keyword=" + _default.params.keyword };
    }
    
    //get media of event + post
    for(let i = 0; i < arrObjEvent.length; i++){
      if(arrObjEvent[i].media) {
        let mediaObj = await Media.findOne({ id: arrObjEvent[i].media });
        arrObjEvent[i].media = mediaObj;
      }
    }

    _default.keyword = keyword;
    _default.eventPost = arrObjEvent;
    _default.numberOfPages = numberOfPages;

    return exits.success(_default);
  }
};
