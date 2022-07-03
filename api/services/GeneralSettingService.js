/**
 * @copyright 2017 @ ZiniMedia Team
 * @author thanhvo
 * @create 2017/10/25 09:52
 * @update 2017/10/25 09:52
 * @file api/services/GeneralSettingService.js
 */
'use strict';

const GeneralSettingService = {
    get: async (options) => {
        // sails.log.info("================================ GeneralSettingService.get -> options: ================================");
        // sails.log.info(options);

        let records = await Setting.findOne(options);
        return records;
        
    },
    add : async (options) => {
        sails.log.info("================================ GeneralSettingService.add -> options: ================================");
        sails.log.info(options);
        
        let newObj = await Setting.create(options)
        // Some metaFields kind of usage / validation error
        .intercept('UsageError', (err)=> {
            return 'invalid';
        })
        .fetch();
        sails.log.info("================================ GeneralSettingService.add -> new object: ================================");
        sails.log.info(newObj);
        return newObj;
    },
    edit: async (query, params) => {
		sails.log.info("================================ TaxonomyService.edit -> query, params: ================================");
		sails.log.info(query);
		sails.log.info(params);

		let options = {};

		for(let key in Setting.attributes) {
				if( key === "id" || key === "createdAt" || key === "toJSON" ) continue;

				if(params && typeof(params[key]) !== "undefined") {
						options[key] = params[key];
				}
		}

		options.updatedAt = new Date().getTime();
		
		let editObj = await Setting.update(query, options).fetch();
		sails.log.info("================================ TaxonomyService.edit -> edit object: ================================");
		sails.log.info(editObj);
		return editObj;
	},
    find:  async( where, limit, skip, sort) => {
        // sails.log.info("================================ GeneralSettingService.find -> where: ================================");
        // sails.log.info(JSON.stringify(where));
        // sails.log.info(limit);
        // sails.log.info(skip);
        // sails.log.info(sort);
        where = (typeof where === 'object') ? where : {};
        limit = (limit !== null && typeof limit === 'number') ? limit : 10;
        skip = (skip !== null && typeof skip === 'number') ? skip: 0;
        sort = (sort !== null && typeof sort === 'object') ? sort : [{ createdAt: 'DESC' }];

        let settings  = await Setting.find({ where: where, limit: limit, skip: skip, sort: sort});
        
        return settings;    
    },

    count: async (where) => {
        where = (typeof where === 'object') ? where : {};
        let totalTax  = await Setting.count(where);
        return totalTax;
    }
};

module.exports = GeneralSettingService;