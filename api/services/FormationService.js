'use strict';

const FormationService = {
  get: async (options) => {
    sails.log.info("================================ FormationService.get -> options: ================================");
    sails.log.info(options);

    let records = await Formation.findOne(options);
    return records;

  },

  add: async (options) => {
    sails.log.info("================================ FormationService.add -> options: ================================");
    sails.log.info(options);

    let newObj = await Formation.create(options)
      // Some other kind of usage / validation error
      .intercept('UsageError', (err) => {
        return 'invalid';
      })
      .fetch();
    sails.log.info("================================ FormationService.add -> new object: ================================");
    sails.log.info(newObj);
    return newObj;
  },

  edit: async (query, params) => {
    sails.log.info("================================ FormationService.edit -> query, params: ================================");
    sails.log.info(query);
    sails.log.info(params);

    let options = {};

    for (let key in Formation.attributes) {
      if (key === "id" || key === "createdAt" || key === "toJSON") continue;

      if (params && typeof (params[key]) !== "undefined") {
        options[key] = params[key];
      }
    }

    options.updatedAt = new Date().getTime();

    let editObj = await Formation.update(query, options).fetch();
    sails.log.info("================================ FormationService.edit -> edit object: ================================");
    sails.log.info(editObj);
    return editObj;
  },

  del: (options, cb) => {
    sails.log.info("================================ FormationService.del -> options: ================================");
    sails.log.info(options);

    Formation.destroy(options).exec((error, deletedRecords) => {
      if (error) {
        sails.log.error(error);
        return cb(error, null);
      }

      return cb(null, deletedRecords);
    });
  },

  find: async (where, limit, skip, sort) => {
    sails.log.info("================================ FormationService.find -> where: ================================");
    sails.log.info(JSON.stringify(where));
    sails.log.info(limit);
    sails.log.info(skip);
    sails.log.info(sort);
    where = (typeof where === 'object') ? where : {};
    limit = (limit !== 'null') ? limit : 10;
    skip = (skip !== null && typeof skip === 'number') ? skip : 0;
    sort = (sort !== null && typeof sort === 'object') ? sort : [{ createdAt: 'DESC' }];

    let formations = await Formation.find({ where: where, limit: limit, skip: skip, sort: sort })
      return formations;
  }
};

module.exports = FormationService;