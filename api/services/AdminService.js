/**
 * @copyright 2017 @ ZiniMedia Team
 * @author thanhvo
 * @create 2017/10/22 12:52
 * @update 2017/10/22 12:52
 * @file api/services/AdminService.js
 */
'use strict';

const AdminService = {
    get: function(options, cb)
    {
        sails.log.info("================================ AdminService.get -> options: ================================");
        sails.log.info(options);

        Admin.findOne(options, function(error, data){
            if(error) return cb(error);

            return cb(null, data);
        });
    },
    add : function(options, cb)
    {
        sails.log.info("================================ AdminService.add -> options: ================================");
        sails.log.info(options);

        Admin.create(options, function(error, data){
            if(error) return cb(error, null);

            return cb(null, data);
        });
    },
    edit: function(query, params, cb)
    {
        sails.log.info("================================ AdminService.edit -> query, params: ================================");
        sails.log.info(query);
        sails.log.info(params);

        let options = {};

        for(let key in Admin.attributes)
        {
            if( key === "id" || key === "createAt" || key === "toJSON" ) continue;

            if(params && typeof(params[key]) !== "undefined")
            {
                options[key] = params[key];
            }
        }

        options.updateAt = new Date().getTime();

        Admin.update(query, options, function(error, data){
            if(error) return cb(error, null);

            return cb(null, data);
        });
    },
    del: function(options, cb)
    {
        sails.log.info("================================ AdminService.del -> options: ================================");
        sails.log.info(options);

        Admin.destroy(options).exec(function (error, deletedRecords){
            if(error) return cb(error);

            return cb(null, deletedRecords);
        });
    },
    find: function(cb, where, limit, skip, sort)
    {
        sails.log.info("================================ AdminService.find -> where: ================================");
        sails.log.info(JSON.stringify(where));

        where = (typeof where === 'object') ? where : {};
        limit = (limit !== null && typeof limit === 'number') ? limit : 10;
        skip = (skip !== null && typeof skip === 'number') ? skip: 0;
        sort = (sort !== null && typeof sort === 'object') ? sort : { createAt: 1 };

        Admin.find({ where: where, limit: limit, skip: skip, sort: sort}).exec(function(error, datas) {
            if(error) return cb(error);

            return cb(null, datas);
        });
    },
    count: function(where, cb) {
        where = (typeof where === 'object') ? where : {};

        Admin.count(where).exec(function countCB(error, found) {
            if(error) return cb(error);

            return cb(null, found);
        });
    }
};

module.exports = AdminService;