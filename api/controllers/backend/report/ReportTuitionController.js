/**
 * ReportTuitionController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const ErrorMessages = require('../../../../config/errors');
module.exports = {
  add: async (req, res) => {
    sails.log.info("================================ReportTuitionController.add => START ================================");
    // GET ALL PARAMS
    if (!req.me) {
      return res.badRequest(ErrorMessages.SYSTEM_SESSION_EXPIRED);
    }
    const params = req.allParams();
    // CHECK TITLE & CODE
    if (!params.title || !params.title.trim().length) {
      return res.badRequest(ErrorMessages.REPORT_TUITION_TITLE_REQUIRED);
    }
    if (!params.code || !params.code.trim().length) {
      return res.badRequest(ErrorMessages.REPORT_TUITION_CODE_REQUIRED);
    }
    // PREPARE DATA COURSE SESSION
    const newData = {
      title: params.title, // REQUIRED
      code: params.code, // REQUIRED
      startTime: params.startTime,
      endTime: params.endTime,
      status: params.status ? Number.parseInt(params.status) : sails.config.custom.STATUS.DRAFT
    };

    // ADD NEW DATA COURSE SESSION
    const newTuitionCheck = await ReportTuitionService.add(newData);

    // RETURN DATA COURSE SESSION
    return res.ok(newTuitionCheck);
  },

  get: async (req, res) => {
    sails.log.info("================================ ReportTuitionController.get => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();
    if (!params.id) {
      return res.badRequest(ErrorMessages.REPORT_TUITION_ID_REQUIRED);
    }

    // QUERY & CHECK DATA COURSE SESSION
    const tuitionChecks = await ReportTuitionService.get({
      id: params.id
    });
    if (!tuitionChecks) {
      return res.notFound(ErrorMessages.REPORT_TUITION_NOT_FOUND);
    }
    // RETURN DATA COURSE SESSION
    return res.json(tuitionChecks);
  },

  edit: async (req, res) => {
    sails.log.info("================================ ReportTuitionController.edit => START ================================");
    // GET ALL PARAMS
    if (!req.me) {
      return res.badRequest(ErrorMessages.SYSTEM_SESSION_EXPIRED);
    }
    const params = req.allParams();
    // CHECK TITLE & CODE
    if (!params.title || !params.title.trim().length) {
      return res.badRequest(ErrorMessages.REPORT_TUITION_TITLE_REQUIRED);
    }
    if (!params.code || !params.code.trim().length) {
      return res.badRequest(ErrorMessages.REPORT_TUITION_CODE_REQUIRED);
    }
    // PREPARE DATA COURSE SESSION
    const editData = {
      title: params.title, // REQUIRED
      code: params.code, // REQUIRED
      startTime: params.startTime,
      endTime: params.endTime,
      status: params.status ? Number.parseInt(params.status) : sails.config.custom.STATUS.DRAFT
    };

    // CHECK DATA COURSE SESSION
    const tuitionChecks = ReportTuitionService.get({ id: params.id });
    if (!tuitionChecks) {
      return res.notFound(ErrorMessages.REPORT_TUITION_NOT_FOUND);
    }

    // UPDATE DATA COURSE SESSION
    const editObj = await ReportTuitionService.edit({ id: params.id }, editData);

    // RETURN DATA COURSE SESSION
    return res.json({
      status: 1,
      data: editObj
    });
  },

  trash: async (req, res) => {
    sails.log.info("================================ ReportTuitionController.trash => START ================================");

    let params = req.allParams();
    if (!params.ids) return res.badRequest(ErrorService.REPORT_TUITION_ID_REQUIRED);

    let ids = params.ids;
    if (params.ids.indexOf(';') != -1) {
      ids = ids.split(';');
    }
    if (typeof (ids) == 'object') {
      for (var i = 0; i < ids.length; i++) {
        let tuitionChecks = await ReportTuitionService.get({ id: ids[i] });
        if (tuitionChecks && tuitionChecks.status == sails.config.custom.STATUS.TRASH) {
          ReportTuitionService.del({ id: ids[i] });
        } else if (tuitionChecks) {
          await tuitionChecks.update({ id: ids[i] }).set({ status: sails.config.custom.STATUS.TRASH });
        }
      }
    } else {
      let tuitionChecks = await ReportTuitionService.get({ id: ids });
      if (tuitionChecks && tuitionChecks.status == sails.config.custom.STATUS.TRASH) {
        ReportTuitionService.del({ id: ids });
      } else if (tuitionChecks) {
        await TuitionCheck.update({ id: ids }).set({ status: sails.config.custom.STATUS.TRASH });
      }
    }
    return res.ok();
  },

  search: async (req, res) => {
    sails.log.info("================================ ReportTuitionController.search => START ================================");
    let params = req.allParams();
    let paid = params.paid ? parseInt(params.paid) : -1;
    let tuitionId = params.tuitionId ? params.tuitionId : '';
    let classId = params.classId ? params.classId : '';
    let title = params.search ? params.search.value : null;
    let draw = (params.draw) ? parseInt(params.draw) : 1;
    let limit = (params.length) ? parseInt(params.length) : null;
    let skip = (params.start) ? parseInt(params.start) : null;
    let sort = (params.sort) ? JSON.parse(params.sort) : null;
    //find only active paid
    let where = {
      paid: { '>=': 0 }
    };
    //IF paid = -1 => SEARCH ALL
    if (paid != -1) {
      where = {
        paid: paid
      };
    }
    if (tuitionId != '' && tuitionId != 'all') {
      where.tuition = tuitionId;
    }
    //IF TITLE !='' => SEARCH STRING
    if (typeof title === "string" && title.length > 0) {
      where = {
        or: [
          {
            firstName: {
              contains: title
            }
          },
          {
            lastName: {
              contains: title
            }
          }
        ]
      };
    }
    if (classId != '' && classId != 'all') {
      let arrStudentId = [];
      let respListRelation = await Student_Class.find({ classObj: classId });
      _.each(respListRelation, (objRelation) => {
        arrStudentId.push(objRelation.student)
      })
      where.student = arrStudentId;
    }
    let arrObjTuitionChecks = await ReportTuitionService.find(where, limit, skip, sort);
    let resTuitionChecks = [];
    var stt = 1;
    _.each(arrObjTuitionChecks, function (tuitionCheck) {
      let tmpData = {};
      tmpData.id = stt;
      // if (tuitionCheck.paid == 3) {
      //   tmpData.title = tuitionCheck.title + '<div class="row-action">'
      //     + '<a href="javascript:;" class="edit-row" data-id="' + tuitionCheck.id + '">' + sails.__("Chỉnh sửa") + '</a> | '
      //     + '<a href="javascript:;" class="remove-row" data-id="' + tuitionCheck.id + '">' + sails.__("Delete") + '</a>'
      //     + '</div>';
      // } else {
      //   tmpData.title = tuitionCheck.title + '<div class="row-action">'
      //     + '<a href="javascript:;" class="edit-row" data-id="' + tuitionCheck.id + '">' + sails.__("Chỉnh sửa") + '</a> | '
      //     + '<a href="javascript:;" class="remove-row" data-id="' + tuitionCheck.id + '">' + sails.__("Thùng rác") + '</a>'
      //     + '</div>';
      // }
      if (tuitionCheck.paid == 0) {
        tmpData.paid = `<label class="badge badge-danger">Chưa thanh toán</label>`;
      } else {
        tmpData.paid = `<label class="badge badge-success">Đã thanh toán</label>`;
      }
      tmpData.code = tuitionCheck.student.code;
      tmpData.tuition = tuitionCheck.tuition.title;
      tmpData.student = tuitionCheck.student.firstName + tuitionCheck.student.lastName;
      resTuitionChecks.push(tmpData);
      stt += 1;
    });
    let totalTuitionCheck = await ReportTuitionService.count(where);
    return res.ok({ draw: draw, recordsTotal: totalTuitionCheck, recordsFiltered: totalTuitionCheck, data: resTuitionChecks });
  }
};
