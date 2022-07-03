/**
 * @copyright 2017 @ ZiniMedia Team
 * @author thanhvo
 * @create 2017/10/25 09:52
 * @update 2017/10/25 09:52
 * @file api/services/MessageDataService.js
 */
'use strict';

const MessageDataService = {
    get: async (options) => {
        sails.log.info("================================ MessageDataService.get -> options: ================================");
        sails.log.info(options);

        let records = await MessageData.findOne(options).populate("message");
        return records;

    },

    add: async (options) => {
        sails.log.info("================================ MessageDataService.add -> options: ================================");
        sails.log.info(options);

        let newObj = await MessageData.create(options)
            // Some other kind of usage / validation error
            .intercept('UsageError', (err) => {
                return 'invalid';
            })
            .fetch();
        sails.log.info("================================ MessageDataService.add -> new object: ================================");
        sails.log.info(newObj);
        return newObj;
    },

    edit: async (query, params) => {
        sails.log.info("================================ MessageDataService.edit -> query, params: ================================");
        sails.log.info(query);
        sails.log.info(params);

        let options = {};

        for (let key in MessageData.attributes) {
            if (key === "id" || key === "createdAt" || key === "toJSON") continue;

            if (params && typeof (params[key]) !== "undefined") {
                options[key] = params[key];
            }
        }
        options.updatedAt = new Date().getTime();
        let editObj = await MessageData.update(query, options).fetch();
        sails.log.info("================================ MessageDataService.edit -> edit object: ================================");
        sails.log.info(editObj);
        return editObj;
    },

    del: (options, cb) => {
        sails.log.info("================================ MessageDataService.del -> options: ================================");
        sails.log.info(options);

        MessageData.destroy(options).exec((error, deletedRecords) => {
            if (error) {
                sails.log.error(error);
                return cb(error, null);
            }

            return cb(null, deletedRecords);
        });
    },

    find: async (where, limit, skip, sort) => {
        sails.log.info("================================ MessageDataService.find -> where: ================================");
        sails.log.info(JSON.stringify(where));
        sails.log.info(limit);
        sails.log.info(skip);
        sails.log.info(sort);
        where = (typeof where === 'object') ? where : {};
        limit = (limit !== 'null') ? limit : 10;
        skip = (skip !== null && typeof skip === 'number') ? skip : 0;
        sort = (sort !== null && typeof sort === 'object') ? sort : [{ createdAt: 'DESC' }];

        let messageDatas = await MessageData.find({ where: where, limit: limit, skip: skip, sort: sort })
        .populate("message")    ;
        return messageDatas;
    },

    count: async (where) => {
        where = (typeof where === 'object') ? where : {};
        let totalMessageData = await MessageData.count(where);
        return totalMessageData;
    }
};

module.exports = MessageDataService;