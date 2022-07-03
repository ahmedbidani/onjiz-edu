/**
 * @copyright 2017 @ ZiniMedia Team
 * @author dungha
 * @create 2019/05/28
 * @update 2019/05/28
 * @file api/services/ReportTuitionService.js
 */
'use strict';

const ReportTuitionService = {
  get: async (options) => {
    sails.log.info("================================ ReportTuitionService.get -> options: ================================");
    sails.log.info(options);

    let records = await TuitionCheck.findOne(options);
    return records;

  },

  edit: async (query, params) => {
    sails.log.info("================================ ReportTuitionService.edit -> query, params: ================================");
    sails.log.info(query);
    sails.log.info(params);

    let options = {};

    for (let key in TuitionCheck.attributes) {
      if (key === "id" || key === "createdAt" || key === "toJSON") continue;

      if (params && typeof (params[key]) !== "undefined") {
        options[key] = params[key];
      }
    }

    options.updatedAt = new Date().getTime();

    let editObj = await TuitionCheck.update(query, options).fetch();
    sails.log.info("================================ ReportTuitionService.edit -> edit object: ================================");
    sails.log.info(editObj);
    return editObj;
  },

  find: async (where, limit, skip, sort) => {
    sails.log.info("================================ ReportTuitionService.find -> where: ================================");
    sails.log.info(JSON.stringify(where));
    sails.log.info(limit);
    sails.log.info(skip);
    sails.log.info(sort);
    where = (typeof where === 'object') ? where : {};
    limit = (limit !== 'null') ? limit : 10;
    skip = (skip !== null && typeof skip === 'number') ? skip : 0;
    sort = (sort !== null && typeof sort === 'object') ? sort : [{ createdAt: 'DESC' }];

    let resp = await Tuition_Student.find({ where: where, limit: limit, skip: skip, sort: sort }).populate('student');//.populate('tuition');
    return resp;
  },

  count: async (where) => {
    where = (typeof where === 'object') ? where : {};
    let resp = await Tuition_Student.count(where);
    return resp;
  }
};

module.exports = ReportTuitionService;