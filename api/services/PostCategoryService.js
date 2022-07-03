/**
 * @copyright 2017 @ ZiniMedia Team
 * @author thanhvo
 * @create 2017/10/25 09:52
 * @update 2017/10/25 09:52
 * @file api/services/PostCategoryService.js
 */
'use strict';

const PostCategoryService = {
    get: async (options) => {
        sails.log.info("================================ PostCategoryService.get -> options: ================================");
        sails.log.info(options);

        let records = await Post_Category.findOne(options).populate('postsOfCat');
        return records;
    },

    add: async (options) => {
        sails.log.info("================================ PostCategoryService.add -> options: ================================");
        sails.log.info(options);

        let newObj = await Post_Category.create(options)
            // Some other kind of usage / validation error
            .intercept('UsageError', (err) => {
                return 'invalid';
            })
            .fetch();
        sails.log.info("================================ PostCategoryService.add -> new object: ================================");
        sails.log.info(newObj);
        return newObj;
    },

    edit: async (query, params) => {
        sails.log.info("================================ PostCategoryService.edit -> query, params: ================================");
        sails.log.info(query);
        sails.log.info(params);

        let options = {};

        for (let key in Post_Category.attributes) {
            if (key === "id" || key === "createdAt" || key === "toJSON") continue;

            if (params && typeof (params[key]) !== "undefined") {
                options[key] = params[key];
            }
        }

        options.updatedAt = new Date().getTime();

        let editObj = await Post_Category.update(query, options).fetch();
        sails.log.info("================================ PostCategoryService.edit -> edit object: ================================");
        sails.log.info(editObj);
        return editObj;
    },

    del: (options, cb) => {
        sails.log.info("================================ PostCategoryService.del -> options: ================================");
        sails.log.info(options);

        Post_Category.destroy(options).exec((error, deletedRecords) => {
            if (error) {
                sails.log.error(error);
                return cb(error, null);
            }

            return cb(null, deletedRecords);
        });
    },

    find: async (where, limit, skip, sort) => {
        sails.log.info("================================ PostCategoryService.find -> where: ================================");
        sails.log.info(JSON.stringify(where));
        sails.log.info(limit);
        sails.log.info(skip);
        sails.log.info(sort);
        where = (typeof where === 'object') ? where : {};
        limit = (limit !== 'null') ? limit : 10;
        skip = (skip !== null && typeof skip === 'number') ? skip : 0;
        sort = (sort !== null && typeof sort === 'object') ? sort : [{ createdAt: 'DESC' }];

        let postCategorys = await Post_Category.find({ where: where, limit: limit, skip: skip, sort: sort }).populate("category").populate("postsOfCat");
        return postCategorys;
    },

    count: async (where) => {
        where = (typeof where === 'object') ? where : {};
        let totalPostCategory = await Post_Category.count(where);
        return totalPostCategory;
    }
};

module.exports = PostCategoryService;