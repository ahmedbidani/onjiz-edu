const FeedbackService = require('../../services/FeedbackService');

module.exports = {

  list: async (req, res) => {
    let params = req.allParams();
    //if (!params.school) return res.badRequest(ErrorMessage.SCHOOL_ID_REQUIRED);
    params.type = params.type ? params.type : '';
    let teacher = params.type == 'teacher' ? true : false;
    let limit  = params.limit ? Number(params.limit) : 10;
    let page = params.page ? Number(params.page) : 1;
    let feedbacks = [];
    if (teacher) {
      let feedbackIds = await Feedback_User.find({
        user: params.user
      });
      let feedbackByTeacher = await Feedback.find({
        status: sails.config.custom.STATUS.ACTIVE,
        createdBy: params.user
      })
      let ids = [];
      if (feedbackIds.length) {
        for (let id of feedbackIds) ids.push(id.feedback); 
      }
      if (feedbackByTeacher.length) {
        for (let id of feedbackByTeacher) ids.push(id.id);
      }
      let mongo = require('mongodb');
      let arrayIds = ids.map((stdId) => {
        return new mongo.ObjectID(stdId);
      })
      where = {
        $and: []
      };
      where.$and.push({
        _id: {
          $in: arrayIds
        }
      })
      const collection = Feedback.getDatastore().manager.collection(Feedback.tableName);
      let result = [];
      let countResult = [];
      //if (limit && page || limit && page == 0) {
        result = await collection.find(where).limit(limit).skip((page - 1) * limit).sort({ createdAt : -1});
        countResult = await collection.find(where);
      // } else {
      //   result = await collection.find(where);
      //   countResult = result
      // }
      const dataWithObjectIds = await result.toArray();
      const countResultToArr = await countResult.toArray();
      feedbacks = JSON.parse(JSON.stringify(dataWithObjectIds).replace(/"_id"/g, '"id"'));
      let listFeedbacks = [];
        for (let feedback of feedbacks) {
            let description = [];
            if (feedback && feedback.description && feedback.description.length) {
                for (let message of feedback.description) {
                    if (message.user) {
                        let user = await User.findOne({ id: message.user });
                        let parent = await Parent.findOne({ id: message.user });
                        if (user) {
                            message.user = user;
                            description.push(message);
                        } else if (parent) {
                            message.user = parent;
                            description.push(message);
                        }
                    }
                }
                feedback.description = description;
            }
            let user = [];
            let feedbackUser = await Feedback_User.find({ feedback: feedback.id });
            if (feedbackUser && feedbackUser.length) {
                for (let feedback of feedbackUser) {
                    if (feedback && feedback.user) {
                        let objUser = await User.findOne({ id: feedback.user });
                        let objParent = await Parent.findOne({ id: feedback.user });
                        if (objUser) user.push(objUser);
                        if (objParent) user.push(objParent);
                    }
                }    
            }
            feedback.user = user;
            listFeedbacks.push(feedback);
        }
        feedbacks = listFeedbacks;
    } else {
      feedbacks = await FeedbackService.find({
        status: sails.config.custom.STATUS.ACTIVE,
        createdBy: params.user,
      }, limit, (page - 1) * limit, params.sort);
    }

    return res.json({
      code: 'SUCCESS_200',
      data: feedbacks
    });
  },
  addFeedback: async (req, res) => {
    let params = req.allParams();
    // CHECK CONTENT PARAMS
    
    
    if (!params.title || !params.title.trim().length) {
      return res.badRequest();
    }
    if (!params.description || !params.description.trim().length) {
      return res.badRequest();
    }
    if (!params.school) return res.badRequest();
    let school = await School.findOne({ id: params.school });
    if (!school) return res.badRequest();
    let description = [];
    let message = {};
    message.message = params.description;
    message.user = params.user;
    message.time = new Date().getTime();
    description.push(message);
    
    const newData = {
      createdBy: params.user,
      title: params.title,
      description: description,
      status: params.status ? params.status : sails.config.custom.STATUS.DRAFT,
      school: params.school,
      principal: params.principal ? params.principal : false
    };

    // ADD NEW DATA 
    let receiver = [];
    const newFeedback = await FeedbackService.add(newData);
    if (params.receiver.length) {
      for (let user of params.receiver) {
        let userObj = await User.findOne({ id: user });
        let parentObj = await Parent.findOne({ id: user });
        if (userObj) {
          let userFeedback = await Feedback_User.create({
            user: user,
            feedback: newFeedback.id
          }).fetch();
          if (userFeedback) receiver.push(userFeedback);
        } else if(parentObj) {
          let parentFeedback = await Feedback_User.create({
            user: user,
            feedback: newFeedback.id
          }).fetch();
          if (parentFeedback) receiver.push(parentFeedback);
        }
      }
    }
    const feedbackResult = await FeedbackService.get({
      id: newFeedback.id
    });
    
    // RETURN DATA 
    return res.ok(feedbackResult);
  },

  editFeedback: async (req, res) => {
    let params = req.allParams();
    // CHECK CONTENT PARAMS
    if (!params.id) {
      return res.badRequest();
    }
    if (!params.description || !params.description.trim().length) {
      return res.badRequest();
    }
    let feedback = await Feedback.findOne({ id: params.id });
    if (!feedback) return res.badRequest();
    let message = {};
    message.message = params.description;
    message.user = params.user;
    message.time = new Date().getTime();
    feedback.description.unshift(message);
    await FeedbackService.edit({ id: feedback.id }, feedback);
    if (params.receiver.length) {
      for (let user of params.receiver) {
        let userObj = await User.findOne({ id: user });
        let parentObj = await Parent.findOne({ id: user });
        let feedbackUser = await Feedback_User.find({
          feedback: feedback.id,
          user: user
        })
        if (userObj && feedbackUser.length == 0) {
          let userFeedback = await Feedback_User.create({
            user: user,
            feedback: feedback.id
          }).fetch();
        } else if(parentObj && feedbackUser.length == 0) {
          let parentFeedback = await Feedback_User.create({
            user: user,
            feedback: feedback.id
          }).fetch();
        }
      }
    }
    
    const feedbackResult = await FeedbackService.get({
      id: feedback.id
    });
    
    // RETURN DATA 
    return res.ok(feedbackResult);
  },

  get: async (req, res) => {
    // GET ALL PARAMS
    const params = req.allParams();

    // CHECK ID PARAM
    if (!params.id) {
      return res.badRequest();
    }
    const feedback = await FeedbackService.get({
      id: params.id
    });

    if (!feedback) {
      return res.notFound();
    }

    // RETURN DATA Feedback
    return res.json({
      data: feedback
    });
  },

};
