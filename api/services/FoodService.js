/**
 * @copyright 2017 @ ZiniMedia Team
 * @author thanhvo
 * @create 2017/10/25 09:52
 * @update 2017/10/25 09:52
 * @file api/services/FoodService.js
 */
'use strict';

const fn = {
    fetchData: async options => {
      return await Food.find(options);
    },
    fetchDataInOne: async options => {
      return await Food.findOne(options);
    }
  };

const FoodService = {
    get: async (options) => {
        sails.log.info("================================ FoodService.get -> options: ================================");
        sails.log.info(options);

        let records = await fn.fetchDataInOne(options);
        return records;
        
    },

    add : async (options) => {
        sails.log.info("================================ FoodService.add -> options: ================================");
        sails.log.info(options);
        
        let newObj = await Food.create(options)
        // Some other kind of usage / validation error
        .intercept('UsageError', (err)=> {
            return 'invalid';
        })
        .fetch();
        sails.log.info("================================ FoodService.add -> new object: ================================");
        sails.log.info(newObj);
        return newObj;
    },

    edit: async (query, params) => {
        sails.log.info("================================ FoodService.edit -> query, params: ================================");
        sails.log.info(query);
        sails.log.info(params);

        let options = {};

        for(let key in Food.attributes) {
            if( key === "id" || key === "createdAt" || key === "toJSON" ) continue;

            if(params && typeof(params[key]) !== "undefined") {
                options[key] = params[key];
            }
        }

        options.updatedAt = new Date().getTime();
        
        let editObj = await Food.update(query, options).fetch();
        sails.log.info("================================ FoodService.edit -> edit object: ================================");
        sails.log.info(editObj);
        return editObj;
    },

    del: (options, cb) => {
        sails.log.info("================================ FoodService.del -> options: ================================");
        sails.log.info(options);

        Food.destroy(options).exec( (error, deletedRecords) => {
            if(error) {
                sails.log.error(error);
                return cb(error, null);
            }

            return cb(null, deletedRecords);
        });
    },

    find:  async( where, limit, skip, sort) => {
        sails.log.info("================================ FoodService.find -> where: ================================");
        sails.log.info(JSON.stringify(where));
        sails.log.info(limit);
        sails.log.info(skip);
        sails.log.info(sort);
        where = (typeof where === 'object') ? where : {};
        limit = (limit !== undefined) ? limit : 10;
        skip = (skip !== null && typeof skip === 'number') ? skip: 0;
        sort = (sort !== null && typeof sort === 'object') ? sort : [{ createdAt: 'DESC' }];

        let foods = await fn.fetchData({ where: where, limit: limit, skip: skip, sort: sort})

        return foods;    
    },

    count: async (where) => {
        where = (typeof where === 'object') ? where : {};
        let totalFood  = await Food.count(where);
        return totalFood;
    }
};

module.exports = FoodService;