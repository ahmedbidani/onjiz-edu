/**
 * @copyright 2017 @ ZiniMedia Team
 * @author cuongphan
 * @create 2020 / 09 / 24 10: 41
 * @update 2020 / 09 / 24 10: 41
 * @file api/services/AgencyService.js
 */
'use strict';

const AgencyService = {
  get: async (options) => {
    sails.log.info("================================ AgencyService.get -> options: ================================");
    sails.log.info(options);

    let records = await Agency.findOne(options);
    return records;

  },

  add: async (options) => {
    sails.log.info("================================ AgencyService.add -> options: ================================");
    sails.log.info(options);

    let newObj = await Agency.create(options)
      // Some other kind of usage / validation error
      .intercept('UsageError', (err) => {
        return 'invalid';
      })
      .fetch();
    sails.log.info("================================ AgencyService.add -> new object: ================================");
    sails.log.info(newObj);
    return newObj;
  },

  edit: async (query, params) => {
    sails.log.info("================================ AgencyService.edit -> query, params: ================================");
    sails.log.info(query);
    sails.log.info(params);

    let options = {};

    for (let key in Agency.attributes) {
      if (key === "id" || key === "creadtedAt" || key === "toJSON") continue;

      if (params && typeof (params[key]) !== "undefined") {
        options[key] = params[key];
      }
    }
    options.updatedAt = new Date().getTime();
    let editObj = await Agency.update(query, options).fetch();
    sails.log.info("================================ AgencyService.edit -> edit object: ================================");
    sails.log.info(editObj);
    return editObj;
  },

  del: (options, cb) => {
    sails.log.info("================================ AgencyService.del -> options: ================================");
    sails.log.info(options);

    Agency.destroy(options).exec((error, deletedRecords) => {
      if (error) {
        sails.log.error(error);
        return cb(error, null);
      }

      return cb(null, deletedRecords);
    });
  },

  find: async (where, limit, skip, sort) => {
    sails.log.info("================================ AgencyService.find -> where: ================================");
    sails.log.info(JSON.stringify(where));
    sails.log.info(limit);
    sails.log.info(skip);
    sails.log.info(sort);
    where = (typeof where === 'object') ? where : {};
    limit = (limit !== 'null') ? limit : 10;
    skip = (skip !== null && typeof skip === 'number') ? skip : 0;
    sort = (sort !== null && typeof sort === 'object') ? sort : [{
      createdAt: 'DESC'
    }];

    let agency = await Agency.find({
      where: where,
      limit: limit,
      skip: skip,
      sort: sort
    });

    return agency;
  },

  count: async (where) => {
    where = (typeof where === 'object') ? where : {};
    let totalAgency = await Agency.count(where);
    return totalAgency;
  }
};

module.exports = AgencyService;
