/**
 * @copyright 2017 @ ZiniMedia Team
 * @author thanhvo
 * @create 2017/10/25 09:52
 * @update 2017/10/25 09:52
 * @file api/services/ClassService.js
 */
'use strict';

const SettingService = {
    get: async (options) => {
        sails.log.info("================================ SettingService.get -> options: ================================");
        sails.log.info(options);

        let records = await Setting.findOne(options);
        return records;
        
    },

    add : async (options) => {
        sails.log.info("================================ SettingService.add -> options: ================================");
        sails.log.info(options);
        
        let newObj = await Setting.create(options)
        // Some other kind of usage / validation error
        .intercept('UsageError', (err)=> {
            return 'invalid';
        })
        .fetch();
        sails.log.info("================================ SettingService.add -> new object: ================================");
        sails.log.info(newObj);
        return newObj;
    },

    edit: async (query, params) => {
        sails.log.info("================================ SettingService.edit -> query, params: ================================");
        sails.log.info(query);
        sails.log.info(params);

        let options = {};

        for(let key in Setting.attributes) {
            if( key === "id" || key === "creadtedAt" || key === "toJSON" ) continue;

            if(params && typeof(params[key]) !== "undefined") {
                options[key] = params[key];
            }
        }
        options.updatedAt = new Date().getTime();
        let editObj = await Setting.update(query, options).fetch();
        sails.log.info("================================ SettingService.edit -> edit object: ================================");
        sails.log.info(editObj);
        return editObj;
    },
    del: (options, cb) => {
        sails.log.info("================================ SettingService.del -> options: ================================");
        sails.log.info(options);

        Setting.destroy(options).exec( (error, deletedRecords) => {
            if(error) {
                sails.log.error(error);
                return cb(error, null);
            }

            return cb(null, deletedRecords);
        });
    },

    find:  async( where, limit, skip, sort) => {
        sails.log.info("================================ SettingService.find -> where: ================================");
        sails.log.info(JSON.stringify(where));
        sails.log.info(limit);
        sails.log.info(skip);
        sails.log.info(sort);
        where = (typeof where === 'object') ? where : {};
        limit = (limit !== null && typeof limit === 'number') ? limit : 10;
        skip = (skip !== null && typeof skip === 'number') ? skip: 0;
        sort = (sort !== null && typeof sort === 'object') ? sort : [{ createdAt: 'DESC' }];

        let classes  = await Setting.find({ where: where, limit: limit, skip: skip, sort: sort})
            // .populate("shool")
            // .populate("listSettings")
            //.populate("owner", {select: ['name', 'totalSetting']})
            //.populate("uploadBy");
        return classes;    
    },

    count: async (where) => {
        where = (typeof where === 'object') ? where : {};
        let totalSetting  = await Setting.count(where);
        return totalSetting;
    }
};
module.exports = SettingService;