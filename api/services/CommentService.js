/**
 * @copyright 2017 @ ZiniMedia Team
 * @author thanhvo
 * @create 2017/10/25 09:52
 * @update 2017/10/25 09:52
 * @file api/services/CommentService.js
 */
'use strict';

const CommentService = {
    get: async (options) => {
        sails.log.info("================================ CommentService.get -> options: ================================");
        sails.log.info(options);

        let records = await Comment.findOne(options);
        return records;
        
    },

    add : async (options) => {
        sails.log.info("================================ CommentService.add -> options: ================================");
        sails.log.info(options);
        
        let newObj = await Comment.create(options)
        // Some other kind of usage / validation error
        .intercept('UsageError', (err)=> {
            return 'invalid';
        })
        .fetch();
        sails.log.info("================================ CommentService.add -> new object: ================================");
        sails.log.info(newObj);
        return newObj;
    },

    edit: async (query, params) => {
        sails.log.info("================================ CommentService.edit -> query, params: ================================");
        sails.log.info(query);
        sails.log.info(params);

        let options = {};

        for(let key in Comment.attributes) {
            if( key === "id" || key === "createdAt" || key === "toJSON" ) continue;

            if(params && typeof(params[key]) !== "undefined") {
                options[key] = params[key];
            }
        }

        options.updatedAt = new Date().getTime();
        
        let editObj = await Comment.update(query, options).fetch();
        sails.log.info("================================ CommentService.edit -> edit object: ================================");
        sails.log.info(editObj);
        return editObj;
    },

    del: (options, cb) => {
        sails.log.info("================================ CommentService.del -> options: ================================");
        sails.log.info(options);

        Comment.destroy(options).exec( (error, deletedRecords) => {
            if(error) {
                sails.log.error(error);
                return cb(error, null);
            }

            return cb(null, deletedRecords);
        });
    },

    find:  async( where, limit, skip, sort) => {
        sails.log.info("================================ CommentService.find -> where: ================================");
        sails.log.info(JSON.stringify(where));
        sails.log.info(limit);
        sails.log.info(skip);
        sails.log.info(sort);
        where = (typeof where === 'object') ? where : {};
        limit = (limit !== 'null') ? limit : 10;
        skip = (skip !== null && typeof skip === 'number') ? skip: 0;
        sort = (sort !== null && typeof sort === 'object') ? sort : [{ createdAt: 'DESC' }];

        let Comments  = await Comment.find({ where: where, limit: limit, skip: skip})
            .populate("authorCmt");
        return Comments;    
    },

    count: async (where) => {
        where = (typeof where === 'object') ? where : {};
        let totalComment  = await Comment.count(where);
        return totalComment;
    }
};

module.exports = CommentService;