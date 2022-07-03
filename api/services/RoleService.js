/**
 * @copyright 2017 @ ZiniMedia Team
 * @author thanhvo
 * @create 2017/10/25 09:52
 * @update 2017/10/25 09:52
 * @file api/services/RoleService.js
 */
'use strict';

const RoleService = {
    get: async (options) => {
        sails.log.info("================================ RoleService.get -> options: ================================");
        sails.log.info(options);

        let records = await Role.findOne(options);
        return records;
        
    },

    add : async (options) => {
        sails.log.info("================================ RoleService.add -> options: ================================");
        sails.log.info(options);
        
        let newObj = await Role.create(options)
        // Some other kind of usage / validation error
        .intercept('UsageError', (err)=> {
            return 'invalid';
        })
        .fetch();
        sails.log.info("================================ RoleService.add -> new object: ================================");
        sails.log.info(newObj);
        return newObj;
    },

    edit: async (query, params) => {
        sails.log.info("================================ RoleService.edit -> query, params: ================================");
        sails.log.info(query);
        sails.log.info(params);

        let options = {};

        for(let key in Role.attributes) {
            if( key === "id" || key === "createdAt" || key === "toJSON" ) continue;

            if(params && typeof(params[key]) !== "undefined") {
                options[key] = params[key];
            }
        }

        options.updatedAt = new Date().getTime();
        
        let editObj = await Role.update(query, options).fetch();
        sails.log.info("================================ RoleService.edit -> edit object: ================================");
        sails.log.info(editObj);
        return editObj;
    },

    del: (options) => {
        sails.log.info("================================ RoleService.del -> options: ================================");
        sails.log.info(options);

        Role.destroy(options).exec( (error, deletedRecords) => {
            if(error) {
                sails.log.error(error);
                return error;
            }

            return deletedRecords;
        });
    },

    find:  async( where, limit, skip, sort) => {
        sails.log.info("================================ RoleService.find -> where: ================================");
        sails.log.info(JSON.stringify(where));
        sails.log.info(limit);
        sails.log.info(skip);
        sails.log.info(sort);
        where = (typeof where === 'object') ? where : {};
        limit = (limit !== 'null') ? limit : 10;
        skip = (skip !== null && typeof skip === 'number') ? skip: 0;
        sort = (sort !== null && typeof sort === 'object') ? sort : [{ createdAt: 'DESC' }];

        let roles  = await Role.find({ where: where, limit: limit, skip: skip});
        return roles;    
    },

    count: async (where) => {
        where = (typeof where === 'object') ? where : {};
        let totalRole  = await Role.count(where);
        return totalRole;
    }
};

module.exports = RoleService;