/**
 * @copyright 2020 @ ZiniMedia Team
 * @author daonguyen
 * @create 2020/01/10 11:29
 * @update 2020/01/10 11:29
 * @file api/services/FeeInvoiceService.js
 */
'use strict';

const fn = {
    fetchData: async options => {
      return await FeeItem.find(options);
    },
    fetchDataInOne: async options => {
      return await FeeItem.findOne(options);
    }
  };

const FeeItemService = {
    get: async (options) => {
        sails.log.info("================================ FeeItemService.get -> options: ================================");
        sails.log.info(options);

        let records = await fn.fetchDataInOne(options);
        return records;
        
    },

    add : async (options) => {
        sails.log.info("================================ FeeItemService.add -> options: ================================");
        sails.log.info(options);
        
        let newObj = await FeeItem.create(options)
        // Some other kind of usage / validation error
        .intercept('UsageError', (err)=> {
            return 'invalid';
        })
        .fetch();
        sails.log.info("================================ FeeItemService.add -> new object: ================================");
        sails.log.info(newObj);
        return newObj;
    },

    edit: async (query, params) => {
        sails.log.info("================================ FeeItemService.edit -> query, params: ================================");
        sails.log.info(query);
        sails.log.info(params);

        let options = {};

        for(let key in FeeItem.attributes) {
            if( key === "id" || key === "createdAt" || key === "toJSON" ) continue;

            if(params && typeof(params[key]) !== "undefined") {
                options[key] = params[key];
            }
        }

        options.updatedAt = new Date().getTime();
        
        let editObj = await FeeItem.update(query, options).fetch();
        sails.log.info("================================ FeeItemService.edit -> edit object: ================================");
        sails.log.info(editObj);
        return editObj;
    },

    del: (options, cb) => {
        sails.log.info("================================ FeeItemService.del -> options: ================================");
        sails.log.info(options);

        FeeItem.destroy(options).exec( (error, deletedRecords) => {
            if(error) {
                sails.log.error(error);
                return cb(error, null);
            }

            return cb(null, deletedRecords);
        });
    },

    find:  async( where, limit, skip, sort) => {
        sails.log.info("================================ FeeItemService.find -> where: ================================");
        sails.log.info(JSON.stringify(where));
        sails.log.info(limit);
        sails.log.info(skip);
        sails.log.info(sort);
        where = (typeof where === 'object') ? where : {};
        limit = (limit !== undefined) ? limit : 10;
        skip = (skip !== null && typeof skip === 'number') ? skip: 0;
        sort = (sort !== null && typeof sort === 'object') ? sort : [{ createdAt: 'DESC' }];

        let feeItems = await fn.fetchData({ where: where, limit: limit, skip: skip, sort: sort})

        return feeItems;    
    },

    count: async (where) => {
        where = (typeof where === 'object') ? where : {};
        let totalFeeItem  = await FeeItem.count(where);
        return totalFeeItem;
    }
};

module.exports = FeeItemService;