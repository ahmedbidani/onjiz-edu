'use strict';

const FeedbackService = {
    get: async (options) => {
        sails.log.info("================================ FeedbackService.get -> options: ================================");
        sails.log.info(options);

        let records = await Feedback.findOne(options);
        let description = [];
        if (records && records.description && records.description.length) {
            for (let message of records.description) {
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
            records.description = description;
        }
        let user = [];
        let feedbackUser = await Feedback_User.find({ feedback: records.id });
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
        if (records && records.createdBy) {
            let user = await User.findOne({ id: records.createdBy });
            let parent = await Parent.findOne({ id: records.createdBy });
            if (user) {
                records.createdBy = user;
            } else if (parent) {
                records.createdBy = parent;
            }
        }
        records.user = user;
        return records;
    },

    add: async (options) => {
        sails.log.info("================================ FeedbackService.add -> options: ================================");
        sails.log.info(options);

        let newObj = await Feedback.create(options)
            // Some other kind of usage / validation error
            .intercept('UsageError', (err) => {
                return 'invalid';
            })
            .fetch();
        sails.log.info("================================ FeedbackService.add -> new object: ================================");
        sails.log.info(newObj);
        return newObj;
    },

    edit: async (query, params) => {
        sails.log.info("================================ FeedbackService.edit -> query, params: ================================");
        sails.log.info(query);
        sails.log.info(params);

        let options = {};

        for (let key in Feedback.attributes) {
            if (key === "id" || key === "createdAt" || key === "toJSON") continue;

            if (params && typeof (params[key]) !== "undefined") {
                options[key] = params[key];
            }
        }

        options.updatedAt = new Date().getTime();

        let editObj = await Feedback.update(query, options).fetch();
        sails.log.info("================================ FeedbackService.edit -> edit object: ================================");
        sails.log.info(editObj);
        return editObj;
    },

    del: (options) => {
        sails.log.info("================================ FeedbackService.del -> options: ================================");
        sails.log.info(options);

        Feedback.destroy(options).exec((error, deletedRecords) => {
            if (error) {
                sails.log.error(error);
                return error;
            }

            return deletedRecords;
        });
    },

    find: async (where, limit, skip, sort) => {
        sails.log.info("================================ FeedbackService.find -> where: ================================");
        sails.log.info(JSON.stringify(where));
        sails.log.info(limit);
        sails.log.info(skip);
        sails.log.info(sort);
        where = (typeof where === 'object') ? where : {};
        limit = (limit !== 'null') ? limit : 10;
        skip = (skip !== null && typeof skip === 'number') ? skip : 0;
        sort = (sort !== null && typeof sort === 'object') ? sort : [{ createdAt: 'DESC' }];

        let feedbacks = await Feedback.find({ where: where, limit: limit, skip: skip, sort: sort });
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
        return feedbacks;
    },

    count: async (where) => {
        where = (typeof where === 'object') ? where : {};
        let totalFeedback = await Feedback.count(where);
        return totalFeedback;
    }
};

module.exports = FeedbackService;