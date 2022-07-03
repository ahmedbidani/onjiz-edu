/**
 * @copyright 2017 @ ZiniMedia Team
 * @author thanhvo
 * @create 2017/10/25 09:52
 * @update 2017/10/25 09:52
 * @file api/services/PostService.js
 */
'use strict';

const PostService = {
    get: async (options) => {
        sails.log.info("================================ PostService.get -> options: ================================");
        sails.log.info(options);

        let records = await Post.findOne(options).populate('media').populate('categories').populate('tags').populate('author');
        return records;
    },

    add: async (options) => {
        sails.log.info("================================ PostService.add -> options: ================================");
        sails.log.info(options);

        let newObj = await Post.create(options)
            // Some other kind of usage / validation error
            .intercept('UsageError', (err) => {
                return 'invalid';
            })
            .fetch();
        sails.log.info("================================ PostService.add -> new object: ================================");
        sails.log.info(newObj);
        return newObj;
    },

    edit: async (query, params) => {
        sails.log.info("================================ PostService.edit -> query, params: ================================");
        sails.log.info(query);
        sails.log.info(params);

        let options = {};

        for (let key in Post.attributes) {
            if (key === "id" || key === "createdAt" || key === "toJSON") continue;

            if (params && typeof (params[key]) !== "undefined") {
                options[key] = params[key];
            }
        }

        options.updatedAt = new Date().getTime();

        let editObj = await Post.update(query, options).fetch();
        sails.log.info("================================ PostService.edit -> edit object: ================================");
        sails.log.info(editObj);
        return editObj;
    },

    del: (options, cb) => {
        sails.log.info("================================ PostService.del -> options: ================================");
        sails.log.info(options);

        Post.destroy(options).exec((error, deletedRecords) => {
            if (error) {
                sails.log.error(error);
                return cb(error, null);
            }

            return cb(null, deletedRecords);
        });
    },

    find: async (where, limit, skip, sort) => {
        sails.log.info("================================ PostService.find -> where: ================================");
        sails.log.info(JSON.stringify(where));
        sails.log.info(limit);
        sails.log.info(skip);
        sails.log.info(sort);
        where = (typeof where === 'object') ? where : {};
        limit = (limit !== 'null') ? limit : 10;
        skip = (skip !== null && typeof skip === 'number') ? skip : 0;
        sort = (sort !== null && typeof sort === 'object') ? sort : [{ createdAt: 'DESC' }];

        let posts = await Post.find({ where: where, limit: limit, skip: skip, sort: sort })
            .populate("categories")
            .populate("tags")
            .populate("media")
            .populate("author");
        return posts;
    },

    count: async (where) => {
        where = (typeof where === 'object') ? where : {};
        let totalPost = await Post.count(where);
        return totalPost;
    }
};

module.exports = PostService;