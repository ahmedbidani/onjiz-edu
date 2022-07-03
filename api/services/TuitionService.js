/**
 * @copyright 2017 @ ZiniMedia Team
 * @author thanhvo
 * @create 2017/10/25 09:52
 * @update 2017/10/25 09:52
 * @file api/services/TuitionService.js
 */
'use strict';

const fn = {
  fetchData: async options => {
    return await Tuition.find(options).populate("classes");
  },
  fetchDataInOne: async options => {
    return await Tuition.findOne(options).populate("classes");
  }
};

const TuitionService = {
  get: async options => {
    sails.log.info(
      '================================ TuitionService.get -> options: ================================'
    );
    sails.log.info(options);

    let records = await fn.fetchDataInOne(options);
    return records;
  },

  add: async options => {
    sails.log.info(
      '================================ TuitionService.add -> options: ================================'
    );
    sails.log.info(options);

    let newObj = await Tuition.create(options).intercept('UsageError', err => { return 'invalid'; }).fetch();
    sails.log.info(
      '================================ TuitionService.add -> new object: ================================'
    );
    sails.log.info(newObj);

    newObj = await fn.fetchDataInOne({ id: newObj.id });

    return newObj;
  },

  edit: async (query, params) => {
    sails.log.info(
      '================================ TuitionService.edit -> query, params: ================================'
    );
    sails.log.info(query);
    sails.log.info(params);

    let options = {};

    for (let key in Tuition.attributes) {
      if (key === 'id' || key === 'creadtedAt' || key === 'toJSON') {
        continue;
      }
      if (params && typeof params[key] !== 'undefined') {
        options[key] = params[key];
      }
    }
    options.updatedAt = new Date().getTime();
    let editObj = await Tuition.update(query, options).fetch();
    sails.log.info(
      '================================ TuitionService.edit -> edit object: ================================'
    );
    sails.log.info(editObj);

    editObj = await fn.fetchDataInOne({ id: editObj[0].id });

    return editObj;
  },

  del: (options, cb) => {
    sails.log.info(
      '================================ TuitionService.del -> options: ================================'
    );
    sails.log.info(options);

    Tuition.destroy(options).exec((error, deletedRecords) => {
      if (error) {
        sails.log.error(error);
        return cb(error, null);
      }

      return cb(null, deletedRecords);
    });
  },

  find: async (where, limit, skip, sort) => {
    sails.log.info(
      '================================ TuitionService.find -> where: ================================'
    );
    sails.log.info(JSON.stringify(where));
    sails.log.info(limit);
    sails.log.info(skip);
    sails.log.info(sort);
    where = typeof where === 'object' ? where : {};
    limit = limit != undefined ? limit : 10;
    skip = skip !== null && typeof skip === 'number' ? skip : 0;
    sort = sort !== null && typeof sort === 'object' ? sort : [{ createdAt: 'DESC' }];

    let tuitions = await fn.fetchData({
      where: where,
      limit: limit,
      skip: skip,
      sort: sort
    });

    return tuitions;
  },

  count: async where => {
    where = typeof where === 'object' ? where : {};
    let totalTuition = await Tuition.count(where);
    return totalTuition;
  }
};

module.exports = TuitionService;
