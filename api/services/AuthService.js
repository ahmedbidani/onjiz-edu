/**
 * @copyright 2017 @ ZiniMedia Team
 * @author thanhvo
 * @create 2017/10/22 12:52
 * @update 2017/10/22 12:52
 * @file api/services/AdminService.js
 */
'use strict';

const AuthService = {
    get: async (options) => {
        sails.log.info("================================ AuthService.get -> options: ================================");
        sails.log.info(options);

        let records = await Auth.findOne(options);
        return records;
        
    },

    add : async (options) => {
        sails.log.info("================================ AuthService.add -> options: ================================");
        sails.log.info(options);
        
        let newObj = await Auth.create(options)
        // Some other kind of usage / validation error
        .intercept('UsageError', (err)=> {
            return 'invalid';
        })
        .fetch();
        sails.log.info("================================ AuthService.add -> new object: ================================");
        sails.log.info(newObj);
        return newObj;
    },

    edit: async (query, params) => {
        sails.log.info("================================ AuthService.edit -> query, params: ================================");
        sails.log.info(query);
        sails.log.info(params);

        let options = {};

        for(let key in Auth.attributes) {
            if( key === "id" || key === "createdAt" || key === "toJSON" ) continue;

            if(params && typeof(params[key]) !== "undefined") {
                options[key] = params[key];
            }
        }

        options.updatedAt = new Date().getTime();
        
        let editObj = await Auth.update(query, options).fetch();
        sails.log.info("================================ AuthService.edit -> edit object: ================================");
        sails.log.info(editObj);
        return editObj;
    },

    del: (options, cb) => {
        sails.log.info("================================ AuthService.del -> options: ================================");
        sails.log.info(options);

        Auth.destroy(options).exec( (error, deletedRecords) => {
            if(error) {
                sails.log.error(error);
                return cb(error, null);
            }

            return cb(null, deletedRecords);
        });
    },

    find:  async( where, limit, skip, sort) => {
        sails.log.info("================================ AuthService.find -> where: ================================");
        sails.log.info(JSON.stringify(where));
        sails.log.info(limit);
        sails.log.info(skip);
        sails.log.info(sort);
        where = (typeof where === 'object') ? where : {};
        limit = (limit !== null && typeof limit === 'number') ? limit : 10;
        skip = (skip !== null && typeof skip === 'number') ? skip: 0;
        sort = (sort !== null && typeof sort === 'object') ? sort : [{ createdAt: 'DESC' }];

        let auths  = await Auth.find({ where: where, limit: limit, skip: skip, sort: sort})
          
        return auths;    
    },

    count: async (where) => {
        where = (typeof where === 'object') ? where : {};
        let totalAuth  = await Auth.count(where);
        return totalAuth;
    }
};

module.exports = AuthService;