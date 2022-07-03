/**
 * @copyright 2017 @ ZiniMedia Team
 * @author thanhvo
 * @create 2017/10/25 09:52
 * @update 2017/10/25 09:52
 * @file api/services/ScheduleService.js
 */
'use strict';

const ScheduleService = {
    get: async (options) => {
        sails.log.info("================================ ScheduleService.get -> options: ================================");
        sails.log.info(options);

        let records = await Schedule.findOne(options);
        return records;

    },

    add: async (options) => {
        sails.log.info("================================ ScheduleService.add -> options: ================================");
        sails.log.info(options);

        let newObj = await Schedule.create(options)
            // Some other kind of usage / validation error
            .intercept('UsageError', (err) => {
                return 'invalid';
            })
            .fetch();
        sails.log.info("================================ ScheduleService.add -> new object: ================================");
        sails.log.info(newObj);
        return newObj;
    },

    edit: async (query, params) => {
        sails.log.info("================================ ScheduleService.edit -> query, params: ================================");
        sails.log.info(query);
        sails.log.info(params);

        let options = {};

        for (let key in Schedule.attributes) {
            if (key === "id" || key === "creadtedAt" || key === "toJSON") continue;

            if (params && typeof (params[key]) !== "undefined") {
                options[key] = params[key];
            }
        }
        options.updatedAt = new Date().getTime();
        let editObj = await Schedule.update(query, options).fetch();
        sails.log.info("================================ ScheduleService.edit -> edit object: ================================");
        sails.log.info(editObj);
        return editObj;
    },

    del: (options, cb) => {
        sails.log.info("================================ ScheduleService.del -> options: ================================");
        sails.log.info(options);

        Schedule.destroy(options).exec((error, deletedRecords) => {
            if (error) {
                sails.log.error(error);
                return cb(error, null);
            }

            return cb(null, deletedRecords);
        });
    },

    find: async (where, limit, skip, sort) => {
        sails.log.info("================================ ScheduleService.find -> where: ================================");
        sails.log.info(JSON.stringify(where));
        sails.log.info(limit);
        sails.log.info(skip);
        sails.log.info(sort);
        where = (typeof where === 'object') ? where : {};
        limit = (limit !== 'null') ? limit : 10;
        skip = (skip !== null && typeof skip === 'number') ? skip : 0;
        sort = (sort !== null && typeof sort === 'object') ? sort : [{ createdAt: 'DESC' }];

        let schedule = await Schedule.find({ where: where, limit: limit, skip: skip, sort: sort })

        return schedule;
    },

    count: async (where) => {
        where = (typeof where === 'object') ? where : {};
        let totalSchedule = await Schedule.count(where);
        return totalSchedule;
    }
};

module.exports = ScheduleService;