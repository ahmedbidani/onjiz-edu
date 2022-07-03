

class IndexEventFrontendEKP extends BaseBackendEKP {
    constructor() {
        super();
        this.initialize();
    }

    initialize() {
        let _this = this;
        _this.calendar = $("#calendar");

        _this.initCalendar();
    }

    initCalendar() {
        let _this = this;
        let classId = _this.calendar.attr('data-classactive');
    
    
        if (_this.calendar.length) {
            var calendarEl = document.getElementById('calendar');
            var calendar = new FullCalendar.Calendar(calendarEl, {
              themeSystem: 'bootstrap',
              locale: _this.lang,
              headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
              },
              weekNumbers: true,
              navLinks: true, // can click day/week names to navigate views
              editable: false,
              selectable: true,
              nowIndicator: true,
              dayMaxEvents: true, // allow "more" link when too many events
              eventSources: [
                // your event source
                {
                  url: '/api/v1/frontend/event/calendar',
                  method: 'GET',
                  extraParams: {
                    classId: classId
                  },
                  failure: function() {
                    alert('there was an error while fetching events!');
                  },
                  color: 'yellow',   // a non-ajax option
                  textColor: 'black' // a non-ajax option
                }
                // any other sources...
              ],
              select: function (date) {
                let params = {};
                params.courseSession = _this.modalSchedule.attr('data-coursesession');
                params.classId = _this.modalSchedule.attr('data-classactive');
                params.dateUse = moment(date.start).format('YYYY-MM-DD');
                $('#dateSchedule').val( moment(date.start).format('DD/MM/YYYY'));
                // GET SCHEDULE BY DATE
                Cloud.getSchedule.with(params).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
                  if (err) {
                    $("#btnAdd").click();
                  } else {
                    console.log(responseBody);
                    _this.modalSchedule.attr('data-manner', 'edit');
                    _this.modalSchedule.attr('data-scheduleId', responseBody.schedule.id );
                    // CHANGE TEXT
                    $('.modal-title').find('.txtAdd').attr("hidden", true);
                    $('.modal-title').find('.txtUpdate').attr("hidden", false);
                    $('#submitFormShedule').find('.btnAdd').attr("hidden", true);
                    $('#submitFormShedule').find('.btnUpdate').attr("hidden", false);
                    $('#multipleDay').attr("hidden", true);
                    $('#sectionForCreate').attr("hidden", true);
                    if (!responseBody.permissions.isMainSchoolAdmin && !responseBody.permissions.isHavePermissionDelete) {
                      $('#deleteSchedule').attr("hidden", true);
                    }
                    if (!responseBody.permissions.isMainSchoolAdmin && !responseBody.permissions.isHavePermissionEdit) {
                      $('#submitFormShedule').attr("hidden", true);
                    }
                    _this.handlerEditEventsByDate(responseBody);
                  }
                });
              }
            });
            calendar.render();
      }
    } 
}