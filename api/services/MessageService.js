/**
 * @copyright 2017 @ ZiniMedia Team
 * @author thanhvo
 * @create 2017/10/25 09:52
 * @update 2017/10/25 09:52
 * @file api/services/MessageService.js
 */
'use strict';

const MessageService = {
    get: async (options) => {
        sails.log.info("================================ MessageService.get -> options: ================================");
        sails.log.info(options);

        let records = await Message.findOne(options).populate('teacher').populate('parent').populate('classObj');
        return records;

    },

    add: async (options) => {
        sails.log.info("================================ MessageService.add -> options: ================================");
        sails.log.info(options);

        let newObj = await Message.create(options)
            // Some other kind of usage / validation error
            .intercept('UsageError', (err) => {
                return 'invalid';
            })
            .fetch();
        sails.log.info("================================ MessageService.add -> new object: ================================");
        sails.log.info(newObj);
        return newObj;
    },

    edit: async (query, params) => {
        sails.log.info("================================ MessageService.edit -> query, params: ================================");
        sails.log.info(query);
        sails.log.info(params);

        let options = {};

        for (let key in Message.attributes) {
            if (key === "id" || key === "creadtedAt" || key === "toJSON") continue;

            if (params && typeof (params[key]) !== "undefined") {
                options[key] = params[key];
            }
        }
        options.updatedAt = new Date().getTime();
        let editObj = await Message.update(query, options).fetch();
        sails.log.info("================================ MessageService.edit -> edit object: ================================");
        sails.log.info(editObj);
        return editObj;
    },

    del: (options, cb) => {
        sails.log.info("================================ MessageService.del -> options: ================================");
        sails.log.info(options);

        Message.destroy(options).exec((error, deletedRecords) => {
            if (error) {
                sails.log.error(error);
                return cb(error, null);
            }

            return cb(null, deletedRecords);
        });
    },

    find: async (where, limit, skip, sort) => {
        sails.log.info("================================ MessageService.find -> where: ================================");
        sails.log.info(JSON.stringify(where));
        sails.log.info(limit);
        sails.log.info(skip);
        sails.log.info(sort);
        where = (typeof where === 'object') ? where : {};
        limit = (limit != undefined) ? limit : 10;
        skip = (skip !== null && typeof skip === 'number') ? skip : 0;
        sort = (sort !== null && typeof sort === 'object') ? sort : [{ createdAt: 'DESC' }];

        let messages = await Message.find({ where: where, limit: limit, skip: skip, sort: sort })
            .populate("parent")
            .populate("teacher")
            .populate("classObj");
        return messages;
    },

    count: async (where) => {
        where = (typeof where === 'object') ? where : {};
        let totalMessage = await Message.count(where);
        return totalMessage;
    }
};

module.exports = MessageService;