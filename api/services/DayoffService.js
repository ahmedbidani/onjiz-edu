/**
 * @copyright 2017 @ ZiniMedia Team
 * @author thanhvo
 * @create 2017/10/25 09:52
 * @update 2017/10/25 09:52
 * @file api/services/DayoffService.js
 */
'use strict';

const DayoffService = {
    get: async (options) => {
        sails.log.info("================================ DayoffService.get -> options: ================================");
        sails.log.info(options);

        let records = await Dayoff.findOne(options);
        return records;
        
    },

    add : async (options) => {
        sails.log.info("================================ DayoffService.add -> options: ================================");
        sails.log.info(options);
        
        let newObj = await Dayoff.create(options)
        .intercept('UsageError', (err)=> {
            return 'invalid';
        })
        .fetch();
        sails.log.info("================================ DayoffService.add -> new object: ================================");
        sails.log.info(newObj);
        return newObj;
    },

    edit: async (query, params) => {
        sails.log.info("================================ DayoffService.edit -> query, params: ================================");
        sails.log.info(query);
        sails.log.info(params);

        let options = {};

        for(let key in Dayoff.attributes) {
            if( key === "id" || key === "createdAt" || key === "toJSON" ) continue;

            if(params && typeof(params[key]) !== "undefined") {
                options[key] = params[key];
            }
        }

        options.updatedAt = new Date().getTime();
        
        let editObj = await Dayoff.update(query, options).fetch();
        sails.log.info("================================ DayoffService.edit -> edit object: ================================");
        sails.log.info(editObj);
        return editObj;
    },

    del: (options, cb) => {
        sails.log.info("================================ DayoffService.del -> options: ================================");
        sails.log.info(options);

        Dayoff.destroy(options).exec( (error, deletedRecords) => {
            if(error) {
                sails.log.error(error);
                return cb(error, null);
            }

            return cb(null, deletedRecords);
        });
    },

    find:  async( where, limit, skip, sort) => {
        sails.log.info("================================ DayoffService.find -> where: ================================");
        sails.log.info(JSON.stringify(where));
        sails.log.info(limit);
        sails.log.info(skip);
        sails.log.info(sort);
        where = (typeof where === 'object') ? where : {};
        limit = (limit !== 'null') ? limit : 10;
        skip = (skip !== null && typeof skip === 'number') ? skip: 0;
        sort = (sort !== null && typeof sort === 'object') ? sort : [{ createdAt: 'ASC' }];

        let attendents = await Dayoff.find({ where: where, limit: limit, skip: skip, sort: sort })
            .populate("ofStudent")
            .populate("ofClass");
        
        return attendents;    
    },

    count: async (where) => {
        where = (typeof where === 'object') ? where : {};
        let totalDayoff  = await Dayoff.count(where);
        return totalDayoff;
    }
};

module.exports = DayoffService;