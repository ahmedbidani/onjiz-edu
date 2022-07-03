/**
 * @copyright 2017 @ ZiniMedia Team
 * @author thanhvo
 * @create 2017/10/25 09:52
 * @update 2017/10/25 09:52
 * @file api/services/ParticipantService.js
 */
'use strict';

const ParticipantService = {
    get: (options, cb) => {
        sails.log.info("================================ ParticipantService.get -> options: ================================");
        sails.log.info(options);

        Participant.findOne(options, (error, data) => {
            if(error) {
                sails.log.error(error);
                return cb(error, null);
            }

            return cb(null, data);
        });
    },
    add : (options, cb) => {
        sails.log.info("================================ ParticipantService.add -> options: ================================");
        sails.log.info(options);

        Participant.create(options, (error, data) => {
            if(error) {
                sails.log.error(error);
                return cb(error, null);
            }

            return cb(null, data);
        });
    },
    edit: (query, params, cb) => {
        sails.log.info("================================ ParticipantService.edit -> query, params: ================================");
        sails.log.info(query);
        sails.log.info(params);

        let options = {};

        for(let key in Participant.attributes)
        {
            if( key === "id" || key === "createAt" || key === "toJSON" ) continue;

            if(params && typeof(params[key]) !== "undefined")
            {
                options[key] = params[key];
            }
        }

        options.updateAt = new Date().getTime();

        Participant.update(query, options, (error, data) => {
            if(error) {
                sails.log.error(error);
                return cb(error, null);
            }

            return cb(null, data);
        });
    },
    del: (options, cb) => {
        sails.log.info("================================ ParticipantService.del -> options: ================================");
        sails.log.info(options);

        Participant.destroy(options).exec( (error, deletedRecords) => {
            if(error) {
                sails.log.error(error);
                return cb(error, null);
            }

            return cb(null, deletedRecords);
        });
    },
    find: (cb, where, limit, skip, sort) => {
        sails.log.info("================================ ParticipantService.find -> where: ================================");
        sails.log.info(JSON.stringify(where));

        where = (typeof where === 'object') ? where : {};
        limit = (limit !== 'null') ? limit : 10;
        skip = (skip !== null && typeof skip === 'number') ? skip: 0;
        sort = (sort !== null && typeof sort === 'object') ? sort : { createAt: 1 };

        Participant.find({ where: where, limit: limit, skip: skip, sort: sort})
            .populate("project")
            .populate("pond")
            .populate("user", {select: ['id', 'firstName', 'lastName', 'type']})
            .exec((error, datas) => {
                if(error) {
                    sails.log.error(error);
                    return cb(error, null);
                }

            return cb(null, datas);
        });
    },
    count: (where, cb) => {
        where = (typeof where === 'object') ? where : {};

        Participant.count(where).exec((error, found) => {
            if(error) {
                sails.log.error(error);
                return cb(error, null);
            }

            return cb(null, found);
        });
    }
};

module.exports = ParticipantService;