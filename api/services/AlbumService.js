/**
 * @copyright 2017 @ ZiniMedia Team
 * @author thanhvo
 * @create 2017/10/25 09:52
 * @update 2017/10/25 09:52
 * @file api/services/AlbumService.js
 */
'use strict';

const AlbumService = {
    get: async (options) => {
        sails.log.info("================================ AlbumService.get -> options: ================================");
        sails.log.info(options);

        let records = await Album.findOne(options)
            .populate('owner')
            .populate('classObj');
        return records;

    },

    add: async (options) => {
        sails.log.info("================================ AlbumService.add -> options: ================================");
        sails.log.info(options);

        let newObj = await Album.create(options)
            // Some other kind of usage / validation error
            .intercept('UsageError', (err) => {
                return 'invalid';
            })
            .fetch();
        sails.log.info("================================ AlbumService.add -> new object: ================================");
        sails.log.info(newObj);
        return newObj;
    },

    edit: async (query, params) => {
        sails.log.info("================================ AlbumService.edit -> query, params: ================================");
        sails.log.info(query);
        sails.log.info(params);

        let options = {};

        for (let key in Album.attributes) {
            if (key === "id" || key === "createdAt" || key === "toJSON") continue;

            if (params && typeof (params[key]) !== "undefined") {
                options[key] = params[key];
            }
        }

        options.updatedAt = new Date().getTime();

        let editObj = await Album.update(query, options).fetch();
        sails.log.info("================================ AlbumService.edit -> edit object: ================================");
        sails.log.info(editObj);
        return editObj;
    },

    del: (options, cb) => {
        sails.log.info("================================ AlbumService.del -> options: ================================");
        sails.log.info(options);

        Album.destroy(options).exec((error, deletedRecords) => {
            if (error) {
                sails.log.error(error);
                return cb(error, null);
            }

            return cb(null, deletedRecords);
        });
    },

    find: async (where, limit, skip, sort) => {
        sails.log.info("================================ AlbumService.find -> where: ================================");
        sails.log.info(JSON.stringify(where));
        sails.log.info(limit);
        sails.log.info(skip);
        sails.log.info(sort);
        where = (typeof where === 'object') ? where : {};
        limit = (limit !== 'null') ? limit : 10;
        skip = (skip !== null && typeof skip === 'number') ? skip : 0;
        sort = (sort !== null && typeof sort === 'object') ? sort : [{ createdAt: 'ASC' }];

        let albums = await Album.find({ where: where, limit: limit, skip: skip, sort: sort })
        // .populate("avatar")
        // .populate("postsOfTag")
        //.populate("createdBy", {select: ['id', 'firstName', 'lastName', 'type']})
        // .populate("owner");
        return albums;
    },

    count: async (where) => {
        where = (typeof where === 'object') ? where : {};
        let totalAlbum = await Album.count(where);
        return totalAlbum;
    }
};

module.exports = AlbumService;