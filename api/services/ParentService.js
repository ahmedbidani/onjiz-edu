/**
 * @copyright 2017 @ ZiniMedia Team
 * @author thanhvo
 * @create 2017/10/25 09:52
 * @update 2017/10/25 09:52
 * @file api/services/ParentService.js
 */
'use strict';

const StudentService = require('./StudentService');

const fn = {
  fetchData: async options => {
    return await Parent.find(options)
      .populate('students');
  },
  fetchDataInOne: async options => {
    return await Parent.findOne(options);
      //.populate('students');
  }
};

const ParentService = {
  get: async options => {
    sails.log.info(
      '================================ ParentService.get -> options: ================================'
    );
    sails.log.info(options);

    let record = await fn.fetchDataInOne(options);
    if (record && record.students) {
      if (record.students.length > 0) {
        //get students
        let _studentIds = record.students.map((s) => {
          return s.id
        })
        let students = await StudentService.find({ id: _studentIds });
        let classes = [];
        if (students.length > 0) {
          for (let i = 0; i < students.length; i++) {
            if (students[i].classes.length > 0) {
              classes = classes.concat(students[i].classes.map((c) => {
                return c;
              }))
            }
          }
        }
        record.students = students;
        if (classes.length > 0) {
          record.classes = classes;
        }
      }
    }

    return record;
  },

  add: async options => {
    sails.log.info(
      '================================ ParentService.add -> options: ================================'
    );
    sails.log.info(options);

    let newObj = await Parent.create(options)
      // Some other kind of usage / validation error
      .intercept('UsageError', err => {
        return 'invalid';
      })
      .fetch();
    sails.log.info(
      '================================ ParentService.add -> new object: ================================'
    );
    sails.log.info(newObj);
    return newObj;
  },

  edit: async (query, params) => {
    sails.log.info(
      '================================ ParentService.edit -> query, params: ================================'
    );
    sails.log.info(query);
    sails.log.info(params);

    let options = {};

    for (let key in Parent.attributes) {
      if (key === 'id' || key === 'createdAt' || key === 'toJSON') {
        continue;
      }

      if (params && typeof params[key] !== 'undefined') {
        options[key] = params[key];
      }
    }

    options.updatedAt = new Date().getTime();

    let editObj = await Parent.update(query, options).fetch();
    sails.log.info(
      '================================ ParentService.edit -> edit object: ================================'
    );
    sails.log.info(editObj);

    let found = await fn.fetchDataInOne({
      id: editObj[0].id
    });

    return found;
  },

  del: (options, cb) => {
    sails.log.info(
      '================================ ParentService.del -> options: ================================'
    );
    sails.log.info(options);

    Parent.destroy(options).exec((error, deletedRecords) => {
      if (error) {
        sails.log.error(error);
        return cb(error, null);
      }

      return cb(null, deletedRecords);
    });
  },

  find: async (where, limit, skip, sort) => {
    sails.log.info(
      '================================ ParentService.find -> where: ================================'
    );
    sails.log.info(JSON.stringify(where));
    sails.log.info(limit);
    sails.log.info(skip);
    sails.log.info(sort);
    where = typeof where === 'object' ? where : {};
    limit = limit !== 'null' ? limit : 10;
    skip = skip !== null && typeof skip === 'number' ? skip : 0;
    sort =
      sort !== null && typeof sort === 'object'
        ? sort
        : [{ createdAt: 'DESC' }];

    let Parents = await fn.fetchData({
      where: where,
      limit: limit,
      skip: skip,
      sort: sort
    });
    return Parents;
  },

  count: async where => {
    where = typeof where === 'object' ? where : {};
    let totalParent = await Parent.count(where);
    return totalParent;
  },
  updateTimeUser: async (id, time) => {
    await Parent.update({ id: id })
      .set(time)
      .fetch();
    return await fn.fetchDataInOne({ id: id });
  },
  hasStudents: async (studentIds) => {
    let parents = await Parent.find({}).populate('students', {
      id: {
        'in': studentIds
      }
    })
    return parents;
  }
};

module.exports = ParentService;
