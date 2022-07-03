/**
 * @copyright 2017 @ ZiniMedia Team
 * @author thanhvo
 * @create 2017/10/25 09:52
 * @update 2017/10/25 09:52
 * @file api/services/ClassService.js
 */
'use strict';

const fn = {
  fetchData: async options => {
    return await Class.find(options).populate('courseSession').populate('students');
  },
  fetchDataInOne: async options => {
    return await Class.findOne(options).populate('teachers').populate('students').populate('formations');
  }
};

const ClassService = {
  get: async options => {
    sails.log.info(
      '================================ ClassService.get -> options: ================================'
    );
    sails.log.info(options);

    let record = await fn.fetchDataInOne(options);
    return record;
  },

  add: async options => {
    sails.log.info(
      '================================ ClassService.add -> options: ================================'
    );
    sails.log.info(options);

    let newObj = await Class.create(options)
      // Some other kind of usage / validation error
      .intercept('UsageError', err => {
        return 'invalid';
      })
      .fetch();
    sails.log.info(
      '================================ ClassService.add -> new object: ================================'
    );
    sails.log.info(newObj);
    return newObj;
  },

  edit: async (query, params) => {
    sails.log.info(
      '================================ ClassService.edit -> query, params: ================================'
    );
    sails.log.info(query);
    sails.log.info(params);

    let options = {};

    for (let key in Class.attributes) {
      if (key === 'id' || key === 'creadtedAt' || key === 'toJSON') { continue; }

      if (params && typeof params[key] !== 'undefined') {
        options[key] = params[key];
      }
    }
    options.updatedAt = new Date().getTime();
    let editObj = await Class.update(query, options).fetch();
    sails.log.info(
      '================================ ClassService.edit -> edit object: ================================'
    );
    sails.log.info(editObj);

    let found = await fn.fetchDataInOne({
      id: editObj[0].id
    });

    return found;
  },

  del: async (options, cb) => {
    sails.log.info(
      '================================ ClassService.del -> options: ================================'
    );
    sails.log.info(options);
    await Class.destroy(options);
  },

  find: async (where, limit, skip, sort) => {
    sails.log.info(
      '================================ ClassService.find -> where: ================================'
    );
    where = typeof where === 'object' ? where : {};
    limit = limit !== 'null' ? limit : 10;
    skip = skip !== null && typeof skip === 'number' ? skip : 0;
    sort = sort !== null && typeof sort === 'object' ? sort : [{ totalStudent: 'DESC' }];

    let classes = await fn.fetchData({
      where: where,
      limit: limit,
      skip: skip,
      sort: sort
    });

    return classes;
  },

  count: async where => {
    where = typeof where === 'object' ? where : {};
    let totalClass = await Class.count(where);
    return totalClass;
  }
};

module.exports = ClassService;
