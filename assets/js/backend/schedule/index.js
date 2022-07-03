class IndexListScheduleBackendEKP extends BaseBackendEKP {
  constructor() {
    super();
    this.initialize();
  }

  initialize() {
    let _this = this;
    _this.countSlot = 1;
    _this.calendar = $("#calendar");
    _this.modalSchedule = $("#modalSchedule");
    _this.originalModal = $("#modalSchedule").clone();
    _this.initCalendar();
    _this.initTimePicker();
    // _this.initDatePicker();
    _this.initDateRangePicker();
    _this.initRepeater();
    _this.handlerAddButton();
    _this.submitFormShedule();
    // _this.initDeleteSchedule();
    _this.alert = _this.modalSchedule.find(".alert");
    $(".js-height-scrollbar").perfectScrollbar();
    $(".js-process-basic-multiple").select2({ width: "100%" });

    _this.dateUseStart = moment().format("YYYY-MM-DD");
    _this.dateUseEnd = moment().add(7, "days").format("YYYY-MM-DD");
  }

  handlerAddButton() {
    $("#btnAdd").on("click", () => {
      $(".modal-title").find(".txtAdd").attr("hidden", false);
      $(".modal-title").find(".txtUpdate").attr("hidden", true);
      $("#submitFormShedule").attr("hidden", false);
      $("#submitFormShedule").find(".btnAdd").attr("hidden", false);
      $("#submitFormShedule").find(".btnUpdate").attr("hidden", true);
      // $('#singleDay').attr("hidden", true);
      $("#multipleDay").attr("hidden", false);
      $("#deleteSchedule").attr("hidden", false);
    });
  }

  submitFormShedule() {
    let _this = this;
    let _i18nMsg = i18n[_this.lang];

    $("#submitFormShedule").on("click", () => {
      let manner = _this.modalSchedule.attr("data-manner");

      console.log("manner", manner);
      // prepare data
      let temp = {};
      temp.classId = $("#modalSchedule").attr("data-classactive");
      if (_this.dateUseStart != "" && _this.dateUseStart != "") {
        temp.dateUse = moment($("#dateSchedule").val(), "DD/MM/YYYY").format(
          "YYYY-MM-DD"
        );
        // temp.dateUseStart = moment($('#dateScheduleStart').val(), "DD/MM/YYYY").format("YYYY-MM-DD");
        // temp.dateUseEnd = moment($('#dateScheduleEnd').val(), "DD/MM/YYYY").format("YYYY-MM-DD");
        temp.dateUseStart = _this.dateUseStart;
        temp.dateUseEnd = _this.dateUseEnd;
        temp.slotSubjects = $(".repeater").repeaterVal().slotSubjects;
        if (temp.slotSubjects) {
          //check data slot subject empty
          let isValid = true;
          let oFormData = $(".repeater").serializeArray();
          for (let iIndex in oFormData) {
            if (
              !oFormData[iIndex].name.includes("topic") &&
              oFormData[iIndex].name != "dateSchedule" &&
              (oFormData[iIndex].value == "" || oFormData[iIndex].value == 0)
            ) {
              isValid = false;
            }
          }
          if (isValid) {
            temp._csrf = $('[name="_csrf"]').val();
            if (manner == "add") {
              // temp.repeat = false;
              // if ($('.repeat').is(":checked")) temp.repeat = true;
              temp.repeat = true; //default is repeat each week
              temp.daysOnWeek = $("#daysOnWeek").val();
              if (
                Array.isArray(temp.daysOnWeek) &&
                temp.daysOnWeek.length != 0
              ) {
                // ADD SCHEDULE
                console.log("addSchedule: ", $(".repeater").repeaterVal());
                Cloud.addSchedule
                  .with(temp)
                  .protocol("jQuery")
                  .exec((err, responseBody, responseObjLikeJqXHR) => {
                    if (err) {
                      console.log(err);
                      return;
                    } else {
                      if (responseBody.code == "SCHEDULE_EXISTED") {
                        _this.alert
                          .removeClass("hidden alert-success")
                          .addClass("alert-danger")
                          .html(_i18nMsg["Schedule existed"]);
                      } else {
                        _this.alert
                          .removeClass("hidden alert-danger")
                          .addClass("alert-success")
                          .html(_this.messages.addSuccess);
                        // $('#calendar').fullCalendar('refetchEvents');
                        $(".modal").on("hidden.bs.modal", function () {
                          $("#modalSchedule").remove();
                          let myClone = _this.originalModal.clone();
                          $(".container-fluid").append(myClone);
                          _this.initialize();
                        });
                      }
                    }
                  });
              } else {
                _this.alert
                  .removeClass("hidden alert-success")
                  .addClass("alert-danger")
                  .html(_i18nMsg["Day of week is not empty"]);
              }
            } else if (manner == "edit") {
              // EDIT SCHEDULE
              Cloud.editSchedule
                .with(temp)
                .protocol("jQuery")
                .exec((err, responseBody, responseObjLikeJqXHR) => {
                  if (err) {
                    console.log(err);
                    return;
                  } else {
                    _this.alert
                      .removeClass("hidden alert-danger")
                      .addClass("alert-success")
                      .html(_this.messages.editSuccess);
                    // $('#calendar').fullCalendar('refetchEvents');
                    $(".modal").on("hidden.bs.modal", function () {
                      $("#modalSchedule").remove();
                      let myClone = _this.originalModal.clone();
                      $(".container-fluid").append(myClone);
                      _this.initialize();
                    });
                  }
                });
            }
          } else {
            _this.alert
              .removeClass("hidden alert-success")
              .addClass("alert-danger")
              .html(_this.messages.dataInvalid);
          }
        } else {
          _this.alert
            .removeClass("hidden alert-success")
            .addClass("alert-danger")
            .html(_i18nMsg["Time and subject must not empty"]);
        }
      } else {
        _this.alert
          .removeClass("hidden alert-success")
          .addClass("alert-danger")
          .html(_i18nMsg["Please select a date"]);
      }
    });
  }

  handlerEditEventsByDate(data) {
    console.log(data);
    let _this = this;
    let _i18nMsg = i18n[_this.lang];
    let dataSchedule = data.schedule;
    let listSubjects = data.listSubjects;
    let listTeacher = data.listTeacher;
    _this.modalSchedule.on("show.bs.modal", function (e) {
      console.log("show");
      let renderListSubject = "";
      _this.countSlot = dataSchedule.slotSubjects.length + 1;
      // render html & select subject
      for (let i = 0; i < dataSchedule.slotSubjects.length; i++) {
        // render list subjects for tag select
        let sujeId = [];
        let htmlOption = "";
        if (listSubjects.length > 0) {
          _.each(listSubjects, function (suje, idx) {
            sujeId.push(suje.id);
          });
        }
        _.each(listSubjects, function (suje, idx) {
          htmlOption += `<option value="${suje.id}" ${
            suje.id == dataSchedule.slotSubjects[i].subject.id ? "selected" : ""
          }>${suje.name}</option>`;
        });
        let teacherId = [];
        let teacherOptions = "";
        if (listTeacher && listTeacher.length > 0) {
          _.each(listTeacher, function (teacher, idx) {
            teacherId.push(teacher.id);
          });
        }
        _.each(listTeacher, function (teacher, idx) {
          teacherOptions += `<option value="${teacher.id}" ${
            teacher.id == dataSchedule.slotSubjects[i].teacher.id ? "selected" : ""
          }>${teacher.firstName} ${teacher.lastName}</option>`;
        });
        renderListSubject +=
          `<div data-repeater-item class="row" style="">
              <div class="col-2">
                <div class="form-group">
                  <label>` +
          _i18nMsg["TimeStart"] +
          `</label>
                  <div class="input-group date timeShedule" data-target-input="nearest" id="timeStartSchedule${i}" data-target="#timeStartSchedule${i}">
                  <div class="input-group timeShedule" data-target="#timeStartSchedule${i}" data-toggle="datetimepicker" id="timeStartSchedule${i}">
                      <input type="text" name="slotSubjects[${i}][timeStart]" class="form-control bootstrap-datetimepicker-input" id="timeStartSchedule${i}" data-target="#timeStartSchedule${i}"
                      value="${dataSchedule.slotSubjects[i].timeStart}">
                      <div class="input-group-addon input-group-append">
                        <i class="mdi mdi-clock input-group-text"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-2">
                <div class="form-group">
                  <label>` +
          _i18nMsg["TimeEnd"] +
          `</label>
                  <div class="input-group date timeShedule" data-target-input="nearest" id="timeEndSchedule${i}" data-target="#timeEndSchedule${i}">
                  <div class="input-group timeShedule" data-target="#timeEndSchedule${i}" data-toggle="datetimepicker" id="timeEndSchedule${i}">
                      <input type="text" name="slotSubjects[${i}][timeEnd]" class="form-control bootstrap-datetimepicker-input" id="timeEndSchedule${i}" data-target="#timeEndSchedule${i}"
                      value="${dataSchedule.slotSubjects[i].timeEnd}">
                      <div class="input-group-addon input-group-append">
                        <i class="mdi mdi-clock input-group-text"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-3">
                <div class="form-group">
                  <label class="form-control-label">` +
          _i18nMsg["Subject"] +
          `</label>
                  <select class="form-control" id="subject" name="slotSubjects[${i}][subject]">
                    <option value="0">` +
          _i18nMsg["Select"] +
          `</option>
                    ${htmlOption}
                  </select>
                </div>
              </div>
              <div class="col-3">
                <div class="form-group">
                  <label class="form-control-label">` +
          _i18nMsg["Teacher"] +
          `</label>
                  <select class="form-control" id="teacher" name="slotSubjects[${i}][teacher]">
                    <option value="0">` +
          _i18nMsg["Select"] +
          `</option>
                    ${teacherOptions}
                  </select>
                </div>
              </div>
              <div class="col-2">
                <div class="form-group">
                  <label class="form-control-label">` +
          _i18nMsg["Topic"] +
          `</label>
                  <input type='text' id="topic" name="slotSubjects[${i}][topic]" class="form-control" value="${
            dataSchedule.slotSubjects[i].topic
              ? dataSchedule.slotSubjects[i].topic
              : ""
          }"/>
                </div>
              </div>
              <div class="col-1 d-flex align-items-center">
                <button data-repeater-delete="${
                  dataSchedule.slotSubjects[i].timeStart
                }" id="" type="button" class="btn btn-danger btn-sm icon-btn ml-2">
                  <i class="mdi mdi-delete"></i>
                </button>
              </div>
            </div>`;
      }
      $(".slotSubjects").empty();
      $(".slotSubjects").append(renderListSubject);
      // create date time picker
      // for (let i = 0; i < dataSchedule.slotSubjects.length; i++) {
      //   $('#timeSchedule' + i).datetimepicker({
      //     format: 'HH:mm',
      //     icons: {
      //       up: "mdi mdi-arrow-up",
      //       down: "mdi mdi-arrow-down"
      //     },
      //     //enabledHours: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
      //     stepping: 15,
      //   });
      // }
      _this.initTimePicker();
      // render time
      _.each(dataSchedule, (value, key) => {
        if (key == "dateUse") {
          _this.modalSchedule
            .find('[name="dateSchedule"]')
            .val(moment(value, "YYYY-MM-DD").format("DD/MM/YYYY"));
          $("#dateSchedule").prop("readonly", true);
        }
      });
    });
    _this.modalSchedule.on("hide.bs.modal", function (e) {
      $("#modalSchedule").remove();
      let myClone = _this.originalModal.clone();
      $(".container-fluid").append(myClone);
      _this.initialize();
    });
    _this.modalSchedule.modal("show");
  }

  initCalendar() {
    let _this = this;
    let classId = _this.calendar.attr("data-classactive");

    if (_this.calendar.length) {
      var calendarEl = document.getElementById("calendar");
      var calendar = new FullCalendar.Calendar(calendarEl, {
        themeSystem: "bootstrap",
        locale: _this.lang,
        headerToolbar: {
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
        },
        weekNumbers: true,
        navLinks: true, // can click day/week names to navigate views
        editable: true,
        selectable: true,
        nowIndicator: true,
        dayMaxEvents: true, // allow "more" link when too many events
        eventSources: [
          // your event source
          {
            url: "/api/v1/backend/schedule/search",
            method: "GET",
            extraParams: {
              classId: classId,
            },
            failure: function () {
              alert("there was an error while fetching events!");
            },
            color: "yellow", // a non-ajax option
            textColor: "black", // a non-ajax option
          },
          // any other sources...
        ],
        select: function (date) {
          console.log("date", date);
          let params = {};
          params.courseSession = _this.modalSchedule.attr("data-coursesession");
          params.classId = _this.modalSchedule.attr("data-classactive");
          params.dateUse = moment(date.start).format("YYYY-MM-DD");
          $("#dateSchedule").val(moment(date.start).format("DD/MM/YYYY"));
          // GET SCHEDULE BY DATE
          Cloud.getSchedule
            .with(params)
            .protocol("jQuery")
            .exec((err, responseBody, responseObjLikeJqXHR) => {
              if (err) {
                $("#btnAdd").click();
              } else {
                console.log(responseBody);
                _this.modalSchedule.attr("data-manner", "edit");
                _this.modalSchedule.attr(
                  "data-scheduleId",
                  responseBody.schedule.id
                );
                // CHANGE TEXT
                $(".modal-title").find(".txtAdd").attr("hidden", true);
                $(".modal-title").find(".txtUpdate").attr("hidden", false);
                $("#submitFormShedule").find(".btnAdd").attr("hidden", true);
                $("#submitFormShedule")
                  .find(".btnUpdate")
                  .attr("hidden", false);
                $("#multipleDay").attr("hidden", true);
                $("#sectionForCreate").attr("hidden", true);
                if (
                  !responseBody.permissions.isMainSchoolAdmin &&
                  !responseBody.permissions.isHavePermissionDelete
                ) {
                  $("#deleteSchedule").attr("hidden", true);
                }
                if (
                  !responseBody.permissions.isMainSchoolAdmin &&
                  !responseBody.permissions.isHavePermissionEdit
                ) {
                  $("#submitFormShedule").attr("hidden", true);
                }
                _this.handlerEditEventsByDate(responseBody);
              }
            });
        },
      });
      calendar.render();
    }
  }

  initTimePicker() {
    $(".bootstrap-datetimepicker-input").bootstrapMaterialDatePicker({
      date: false,
      format: "HH:mm",
      switchOnClick: true,
    });
  }

  initDateRangePicker() {
    let _this = this;
    $('input[name="duration"]').daterangepicker(
      {
        locale: {
          format: "DD/MM/YYYY",
        },
        minDate: moment(),
        startDate: moment(),
        endDate: moment().add(7, "days"),
      },
      function (start, end, label) {
        _this.dateUseStart = start.format("YYYY-MM-DD");
        _this.dateUseEnd = end.format("YYYY-MM-DD");
        console.log(
          "A new date selection was made: " +
            start.format("YYYY-MM-DD") +
            " to " +
            end.format("YYYY-MM-DD")
        );
      }
    );
  }

  initRepeater() {
    let _this = this;
    $(".repeater").repeater({
      defaultValues: {
        "text-input": "foo",
      },
      show: function () {
        $(this).slideDown();
        $(this)
          .find(".datetimepicker-input")
          .attr("id", "timeSchedule" + _this.countSlot);
        // _this.initTimePicker($(this), _this.countSlot);
        _this.initTimePicker();
        _this.countSlot++;
        $(".js-height-scrollbar").animate(
          { scrollTop: $(".js-height-scrollbar")[0].scrollHeight },
          1000
        ); //.scrollTop( $( ".js-height-scrollbar" )[0].scrollHeight );//
        $(".js-height-scrollbar").perfectScrollbar("update");
      },
      hide: function (deleteElement) {
        _this.initSweetAlert($(this), deleteElement);
      },
      isFirstItemUndeletable: true,
    });
  }

  initSweetAlert(element, deleteElement) {
    swal({
      title: this.messages.deletePopup,
      icon: "warning",
      cancelButtonColor: "#ff4081",
      buttons: {
        cancel: {
          text: this.messages.cancel,
          value: null,
          visible: true,
          className: "btn btn-danger",
          closeModal: true,
        },
        confirm: {
          text: "OK",
          value: true,
          visible: true,
          className: "btn btn-primary",
          closeModal: true,
        },
      },
    }).then((value) => {
      if (value) {
        this.initDeleteSchedule(
          element.find("button").attr("data-repeater-delete")
        );
        element.slideUp(deleteElement);
      }
    });
  }

  initDeleteSchedule(time) {
    let _this = this;
    let id = _this.modalSchedule.attr("data-scheduleId");
    Cloud.deleteSchedule
      .with({ id: id, time: time, _csrf: $('[name="_csrf"]').val() })
      .protocol("jQuery")
      .exec((err, responseBody, responseObjLikeJqXHR) => {
        if (err) {
          console.log(err);
          return;
        } else if (responseBody) {
          swal({
            title: this.messages.deleteSuccessfully,
            icon: "success",
            button: {
              text: this.messages.continue,
              value: true,
              visible: true,
              className: "btn btn-primary",
            },
          }).then((value) => {
            //THEN RELOAD PAGE IF NEEDED
            location.reload();
          });
        }
      });
  }
}
