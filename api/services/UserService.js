/**
 * @copyright 2017 @ ZiniMedia Team
 * @author thanhvo
 * @create 2017/10/25 09:52
 * @update 2017/10/25 09:52
 * @file api/services/UserService.js
 */
'use strict';

const ClassService = require('./ClassService');

const fn = {
  fetchData: async options => {
    return await User.find(options)
      .populate('classes')
      .populate('albums')
      .populate('post')
      .populate('comments')
      .populate('formations')
      .populate('role');
  },
  fetchDataInOne: async options => {
    return await User.findOne(options)
      .populate('classes')
      .populate('albums')
      .populate('post')
      .populate('comments')
      .populate('formations')
      .populate('role');
  }
};

const UserService = {
  get: async options => {
    sails.log.info(
      '================================ UserService.get -> options: ================================'
    );
    sails.log.info(options);
    let record = await fn.fetchDataInOne(options);
    //get classes
    if (record) {
      if (record.classObj) {
        if (record.classObj.length > 0) {
          let _classIds = record.classObj.map((c) => {
            return c.id
          })
          let classes = await ClassService.find({ id: _classIds });
          record.classes = classes;
        }
      }
    }

    return record;
  },

  add: async options => {
    sails.log.info(
      '================================ UserService.add -> options: ================================'
    );
    sails.log.info(options);

    let newObj = await User.create(options)
      // Some other kind of usage / validation error
      .intercept('UsageError', err => {
        return 'invalid';
      })
      .fetch();
    sails.log.info(
      '================================ UserService.add -> new object: ================================'
    );
    sails.log.info(newObj);
    return newObj;
  },

  edit: async (query, params) => {
    sails.log.info(
      '================================ UserService.edit -> query, params: ================================'
    );
    sails.log.info(query);
    sails.log.info(params);

    let options = {};

    for (let key in User.attributes) {
      if (key === 'id' || key === 'createdAt' || key === 'toJSON') {
        continue;
      }

      if (params && typeof params[key] !== 'undefined') {
        options[key] = params[key];
      }
    }

    options.updatedAt = new Date().getTime();

    let editObj = await User.update(query, options).fetch();
    sails.log.info(
      '================================ UserService.edit -> edit object: ================================'
    );
    sails.log.info(editObj);

    let found = await fn.fetchDataInOne({
      id: editObj[0].id
    });

    return found;
  },

  del: (options) => {
    sails.log.info(
      '================================ UserService.del -> options: ================================'
    );
    sails.log.info(options);

    User.destroy(options).exec((error, deletedRecords) => {
      if (error) {
        sails.log.error(error);
        return error;
      }

      return deletedRecords;
    });
  },

  find: async (where, limit, skip, sort) => {
    sails.log.info(
      '================================ UserService.find -> where: ================================'
    );
    sails.log.info(JSON.stringify(where));
    sails.log.info(limit);
    sails.log.info(skip);
    sails.log.info(sort);
    where = typeof where === 'object' ? where : {};
    limit = limit !== 'null' ? limit : 10;
    skip = skip !== null && typeof skip === 'number' ? skip : 0;
    sort = (sort !== null && typeof sort === 'object') ? sort : [{ createdAt: 'DESC' }]
    
    let Users = await fn.fetchData({
      where: where,
      limit: limit,
      skip: skip,
      sort: sort
    });
    return Users;
  },

  count: async where => {
    where = typeof where === 'object' ? where : {};
    let totalUser = await User.count(where);
    return totalUser;
  },

  updateTimeUser: async (id, time) => {
    await User.update({ id: id })
      .set(time)
      .fetch();
    return await fn.fetchDataInOne({ id: id });
  }
};

module.exports = UserService;
