let moment = require('moment');
const Sharp = require('sharp/lib');
const FeedbackService = require('../../../services/FeedbackService');
const accents = require('remove-accents');

module.exports = {
  get: async (req, res) => {
    sails.log.info( "================================ EventController.get => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();

    // CHECK PARAM
    const feedback = await FeedbackService.get({
      id: params.id
    });

    if (!feedback) {
      return res.notFound();
    }

    // RETURN DATA EVENT
    return res.ok(feedback);
  },

  list: async (req, res) => {
    let params = req.allParams();
    let limit  = params.limit ? Number(params.limit) : 10;
    let page = params.page ? Number(params.page) : 1;
    
    let feedbacks = await FeedbackService.find({
      status: sails.config.custom.STATUS.ACTIVE,
      school: req.me.school
    }, limit, (page - 1) * limit, params.sort);
    return res.ok();
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
    let description = [];
    let message = {};
    message.message = params.description;
    message.user = req.me.id;
    message.time = new Date().getTime();
    description.push(message);
    
    const newData = {
      //user: req.me.id,
      createdBy: req.me.id,
      title: params.title,
      description: description,
      status: params.status ? params.status : sails.config.custom.STATUS.ACTIVE,
      school: req.me.school,
      principal: false
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

    if (!params.replyFeedback || !params.replyFeedback.trim().length) {
      return res.badRequest();
    }
    let feedback = await Feedback.findOne({ id: params.id });
    if (!feedback) return res.badRequest();
    let message = {};
    message.message = params.replyFeedback;
    message.user = req.me.id;
    message.time = new Date().getTime();
    feedback.description.unshift(message);
    await FeedbackService.edit({ id: feedback.id }, feedback);
    // if (params.receiver.length) {
    //   for (let user of params.receiver) {
    //     let userObj = await User.findOne({ id: user });
    //     let parentObj = await Parent.findOne({ id: user });
    //     let feedbackUser = await Feedback_User.find({
    //       feedback: feedback.id,
    //       user: user
    //     })
    //     if (userObj && feedbackUser.length == 0) {
    //       let userFeedback = await Feedback_User.create({
    //         user: user,
    //         feedback: feedback.id
    //       }).fetch();
    //     } else if(parentObj && feedbackUser.length == 0) {
    //       let parentFeedback = await Feedback_User.create({
    //         user: user,
    //         feedback: feedback.id
    //       }).fetch();
    //     }
    //   }
    // }
    
    // const feedbackResult = await FeedbackService.get({
    //   id: feedback.id
    // });
    
    // RETURN DATA 
    return res.ok();
  },

};

