/**
 * @copyright 2017 @ ZiniMedia Team
 * @author thanhvo
 * @create 2017/10/25 09:52
 * @update 2017/10/25 09:52
 * @file api/services/SubjectService.js
 */
'use strict';

const SubjectService = {
    get: async (options) => {
        sails.log.info("================================ SubjectService.get -> options: ================================");
        sails.log.info(options);

        let records = await Subject.findOne(options);
        return records;
        
    },

    add : async (options) => {
        sails.log.info("================================ SubjectService.add -> options: ================================");
        sails.log.info(options);
        
        let newObj = await Subject.create(options)
        // Some other kind of usage / validation error
        .intercept('UsageError', (err)=> {
            return 'invalid';
        })
        .fetch();
        sails.log.info("================================ SubjectService.add -> new object: ================================");
        sails.log.info(newObj);
        return newObj;
    },

    edit: async (query, params) => {
        sails.log.info("================================ SubjectService.edit -> query, params: ================================");
        sails.log.info(query);
        sails.log.info(params);

        let options = {};

        for(let key in Subject.attributes) {
            if( key === "id" || key === "createdAt" || key === "toJSON" ) continue;

            if(params && typeof(params[key]) !== "undefined") {
                options[key] = params[key];
            }
        }

        options.updatedAt = new Date().getTime();
        
        let editObj = await Subject.update(query, options).fetch();
        sails.log.info("================================ SubjectService.edit -> edit object: ================================");
        sails.log.info(editObj);
        return editObj;
    },

    del: (options, cb) => {
        sails.log.info("================================ SubjectService.del -> options: ================================");
        sails.log.info(options);

        Subject.destroy(options).exec( (error, deletedRecords) => {
            if(error) {
                sails.log.error(error);
                return cb(error, null);
            }

            return cb(null, deletedRecords);
        });
    },

    find:  async( where, limit, skip, sort) => {
        sails.log.info("================================ SubjectService.find -> where: ================================");
        sails.log.info(JSON.stringify(where));
        sails.log.info(limit);
        sails.log.info(skip);
        sails.log.info(sort);
        where = (typeof where === 'object') ? where : {};
        limit = (limit !== 'null') ? limit : 10;
        skip = (skip !== null && typeof skip === 'number') ? skip: 0;
        sort = (sort !== null && typeof sort === 'object') ? sort : [{ createdAt: 'DESC' }];

        let sujects  = await Subject.find({ where: where, limit: limit, skip: skip, sort: sort})
            // .populate("postsOfTag")
            //.populate("createdBy", {select: ['id', 'firstName', 'lastName', 'type']})
            // .populate("createdBy");
        return sujects;    
    },

    count: async (where) => {
        where = (typeof where === 'object') ? where : {};
        let totalTax  = await Subject.count(where);
        return totalTax;
    }
};

module.exports = SubjectService;