/**
 * @copyright 2017 @ ZiniMedia Team
 * @author thanhvo
 * @create 2020/02/19 09:52
 * @update 2020/02/19 09:52
 * @file api/services/BranchService.js
 */
'use strict';

const fn = {
  fetchData: async options => {
    return await Branch.find(options).populate('minister').populate('sessions');
  },
  fetchDataInOne: async options => {
    return await Branch.findOne(options).populate('minister').populate('sessions');
  }
};

const BranchService = {
  get: async options => {
    sails.log.info(
      '================================ BranchService.get -> options: ================================'
    );

    let record = await fn.fetchDataInOne(options);
    return record;
  },

  add: async options => {
    sails.log.info(
      '================================ BranchService.add -> options: ================================'
    );
    sails.log.info(options);

    let newObj = await Branch.create(options)
      // Some other kind of usage / validation error
      .intercept('UsageError', err => {
        return 'invalid';
      })
      .fetch();
    sails.log.info(
      '================================ BranchService.add -> new object: ================================'
    );
    sails.log.info(newObj);
    return newObj;
  },

  edit: async (query, params) => {
    sails.log.info(
      '================================ BranchService.edit -> query, params: ================================'
    );
    sails.log.info(query);
    sails.log.info(params);

    let options = {};

    for (let key in Branch.attributes) {
      if (key === 'id' || key === 'creadtedAt' || key === 'toJSON') { continue; }

      if (params && typeof params[key] !== 'undefined') {
        options[key] = params[key];
      }
    }
    options.updatedAt = new Date().getTime();
    let editObj = await Branch.update(query, options).fetch();
    sails.log.info(
      '================================ BranchService.edit -> edit object: ================================'
    );
    sails.log.info(editObj);

    let found = await fn.fetchDataInOne({
      id: editObj[0].id
    });

    return found;
  },

  del: async (options, cb) => {
    sails.log.info(
      '================================ BranchService.del -> options: ================================'
    );
    sails.log.info(options);
    await Branch.destroy(options);
  },

  find: async (where, limit, skip, sort) => {
    sails.log.info(
      '================================ BranchService.find -> where: ================================'
    );
    where = typeof where === 'object' ? where : {};
    limit = limit !== 'null' ? limit : 10;
    skip = skip !== null && typeof skip === 'number' ? skip : 0;
    sort = sort !== null && typeof sort === 'object' ? sort : [{ createdAt: 'DESC' }];

    let branches = await fn.fetchData({
      where: where,
      limit: limit,
      skip: skip,
      sort: sort
    });

    return branches;
  },

  count: async where => {
    where = typeof where === 'object' ? where : {};
    let totalBranch = await Branch.count(where);
    return totalBranch;
  }
};

module.exports = BranchService;
