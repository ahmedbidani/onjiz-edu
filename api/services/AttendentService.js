/**
 * @copyright 2017 @ ZiniMedia Team
 * @author thanhvo
 * @create 2017/10/25 09:52
 * @update 2017/10/25 09:52
 * @file api/services/AttendentService.js
 */
'use strict';

const AttendentService = {
    get: async (options) => {
        sails.log.info("================================ AttendentService.get -> options: ================================");
        sails.log.info(options);

        let record = await Attendent.findOne(options).populate('student');
        return record;

    },

    add: async (options) => {
        sails.log.info("================================ AttendentService.add -> options: ================================");
        sails.log.info(options);

        let newObj = await Attendent.create(options)
            // Some other kind of usage / validation error
            .intercept('UsageError', (err) => {
                return 'invalid';
            })
            .fetch();
        sails.log.info("================================ AttendentService.add -> new object: ================================");
        sails.log.info(newObj);
        return newObj;
    },

    edit: async (query, params) => {
        sails.log.info("================================ AttendentService.edit -> query, params: ================================");
        sails.log.info(query);
        sails.log.info(params);

        let options = {};

        for (let key in Attendent.attributes) {
            if (key === "id" || key === "createdAt" || key === "toJSON") continue;

            if (params && typeof (params[key]) !== "undefined") {
                options[key] = params[key];
            }
        }

        options.updatedAt = new Date().getTime();

        let editObj = await Attendent.update(query, options).fetch();
        sails.log.info("================================ AttendentService.edit -> edit object: ================================");
        sails.log.info(editObj);
        return editObj;
    },

    del: (options, cb) => {
        sails.log.info("================================ AttendentService.del -> options: ================================");
        sails.log.info(options);

        Attendent.destroy(options).exec((error, deletedRecords) => {
            if (error) {
                sails.log.error(error);
                return cb(error, null);
            }

            return cb(null, deletedRecords);
        });
    },

    find: async (where, limit, skip, sort) => {
        sails.log.info("================================ AttendentService.find -> where: ================================");
        sails.log.info(JSON.stringify(where));
        sails.log.info(limit);
        sails.log.info(skip);
        sails.log.info(sort);
        where = (typeof where === 'object') ? where : {};
        limit = (limit !== 'null') ? limit : 10;
        skip = (skip !== null && typeof skip === 'number') ? skip : 0;
        sort = (sort !== null && typeof sort === 'object') ? sort : [{ createdAt: 'ASC' }];

        let attendents = await Attendent.find({ where: where, limit: limit, skip: skip, sort: sort });

        return attendents;
    },

    count: async (where) => {
        where = (typeof where === 'object') ? where : {};
        let totalAttendent = await Attendent.count(where);
        return totalAttendent;
    }
};

module.exports = AttendentService;