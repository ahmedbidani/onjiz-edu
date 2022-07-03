/**
 * @copyright 2017 @ ZiniMedia Team
 * @author dao.nguyen
 * @create 2020/02/07
 * @file api/services/CurrencyService.js
 */
'use strict';

const fn = {
    fetchData: async options => {
      return await Currency.find(options);
    },
    fetchDataInOne: async options => {
      return await Currency.findOne(options);
    }
  };

const CurrencyService = {
    get: async (options) => {
        sails.log.info("================================ CurrencyService.get -> options: ================================");
        sails.log.info(options);

        let records = await fn.fetchDataInOne(options);
        return records;
        
    },

    add : async (options) => {
        sails.log.info("================================ CurrencyService.add -> options: ================================");
        sails.log.info(options);
        
        let newObj = await Currency.create(options)
        // Some other kind of usage / validation error
        .intercept('UsageError', (err)=> {
            return 'invalid';
        })
        .fetch();
        sails.log.info("================================ CurrencyService.add -> new object: ================================");
        sails.log.info(newObj);
        return newObj;
    },

    edit: async (query, params) => {
        sails.log.info("================================ CurrencyService.edit -> query, params: ================================");
        sails.log.info(query);
        sails.log.info(params);

        let options = {};

        for(let key in Currency.attributes) {
            if( key === "id" || key === "createdAt" || key === "toJSON" ) continue;

            if(params && typeof(params[key]) !== "undefined") {
                options[key] = params[key];
            }
        }

        options.updatedAt = new Date().getTime();
        
        let editObj = await Currency.update(query, options).fetch();
        sails.log.info("================================ CurrencyService.edit -> edit object: ================================");
        sails.log.info(editObj);
        return editObj;
    },

    del: (options, cb) => {
        sails.log.info("================================ CurrencyService.del -> options: ================================");
        sails.log.info(options);

        Currency.destroy(options).exec( (error, deletedRecords) => {
            if(error) {
                sails.log.error(error);
                return cb(error, null);
            }

            return cb(null, deletedRecords);
        });
    },

    find:  async( where, limit, skip, sort) => {
        sails.log.info("================================ CurrencyService.find -> where: ================================");
        sails.log.info(JSON.stringify(where));
        sails.log.info(limit);
        sails.log.info(skip);
        sails.log.info(sort);
        where = (typeof where === 'object') ? where : {};
        limit = (limit !== undefined) ? limit : 10;
        skip = (skip !== null && typeof skip === 'number') ? skip: 0;
        sort = (sort !== null && typeof sort === 'object') ? sort : [{ createdAt: 'DESC' }];

        let currencys = await fn.fetchData({ where: where, limit: limit, skip: skip, sort: sort})

        return currencys;    
    },

    count: async (where) => {
        where = (typeof where === 'object') ? where : {};
        let totalCurrency  = await Currency.count(where);
        return totalCurrency;
    }
};

module.exports = CurrencyService;