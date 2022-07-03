/**
 * @copyright 2017 @ ZiniMedia Team
 * @author thanhvo
 * @create 2017/10/30 11:42
 * @update 2017/10/30 11:42
 * @file api/services/TimeLineService.js
 */
'use strict';

const TimeLineService = {
    get: (options, cb) => {
        sails.log.info("================================ TimeLineService.get -> options: ================================");
        sails.log.info(options);

        TimeLine.findOne(options, (error, data) => {
            if(error) {
                sails.log.error(error);
                return cb(error, null);
            }

            return cb(null, data);
        });
    },
    add : (options, cb) => {
        sails.log.info("================================ TimeLineService.add -> options: ================================");
        sails.log.info(options);

        TimeLine.create(options, (error, data) => {
            if(error) {
                sails.log.error(error);
                return cb(error, null);
            }

            return cb(null, data);
        });
    },
    edit: (query, params, cb) => {
        sails.log.info("================================ TimeLineService.edit -> query, params: ================================");
        sails.log.info(query);
        sails.log.info(params);

        let options = {};

        for(let key in TimeLine.attributes)
        {
            if( key === "id" || key === "createAt" || key === "toJSON" ) continue;

            if(params && typeof(params[key]) !== "undefined")
            {
                options[key] = params[key];
            }
        }

        options.updateAt = new Date().getTime();

        TimeLine.update(query, options, (error, data) => {
            if(error) {
                sails.log.error(error);
                return cb(error, null);
            }

            return cb(null, data);
        });
    },
    del: (options, cb) => {
        sails.log.info("================================ TimeLineService.del -> options: ================================");
        sails.log.info(options);

        TimeLine.destroy(options).exec( (error, deletedRecords) => {
            if(error) {
                sails.log.error(error);
                return cb(error, null);
            }

            return cb(null, deletedRecords);
        });
    },
    find: (cb, where, limit, skip, sort) => {
        sails.log.info("================================ TimeLineService.find -> where: ================================");
        sails.log.info(JSON.stringify(where));

        where = (typeof where === 'object') ? where : {};
        limit = (limit !== 'null') ? limit : 10;
        skip = (skip !== null && typeof skip === 'number') ? skip: 0;
        sort = (sort !== null && typeof sort === 'object') ? sort : { createAt: 1 };

        TimeLine.find({ where: where, limit: limit, skip: skip, sort: sort})
            .populate("project", {select: ['id', 'name']})
            .populate("pond", {select: ['id', 'name']})
            .populate("technician", {select: ['id', 'firstName', 'lastName']})
            .populate("employees", {select: ['id', 'firstName', 'lastName']})
            .exec((error, datas) => {
                if(error) {
                    sails.log.error(error);
                    return cb(error, null);
                }

            return cb(null, datas);
        });
    },
    count: (where, cb) => {
        where = (typeof where === 'object') ? where : {};

        TimeLine.count(where).exec((error, found) => {
            if(error) {
                sails.log.error(error);
                return cb(error, null);
            }

            return cb(null, found);
        });
    },
    autoTimeSlot: (cb) => {
        // sails.log.info("================================ TimeLineService.autoTimeSlot -> where: ================================");

        const now = new Date();
        let start = now;
        let end = now;

        start.setHours(0,0,0,0);
        start = start.getTime();

        end.setHours(23,59,59,999);
        end = end.getTime();

        // console.log("=== start:", start + " - " + end + " = " + timeString);

        TimeLine.find({ where: {dateUse: { '>=': start, '<=': end }}, select: ['slots']}).exec((error, datas) => {
            if(error) {
                sails.log.error(error);
                return cb(error, null);
            }

            return cb(null, datas);
        });
    }
};

module.exports = TimeLineService;