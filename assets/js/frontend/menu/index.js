class IndexMenuFrontendEKP extends BaseBackendEKP {
    constructor() {
      super();
      this.initialize();
    }
  
    initialize() {
      let _this = this;
      _this.calendarEl = $('#calendar');
      _this.calendarObj = {};

      _this.initCalendar();
      _this.onChangeClass();
    }
  
    initCalendar() {
      let _this = this;
      let classId = _this.calendarEl.attr('data-classactive');
      if (_this.calendarEl.length) {
        var calendarEl = document.getElementById('calendar');
        _this.calendarObj = new FullCalendar.Calendar(calendarEl, {
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
              url: '/api/v1/frontend/menu/search',
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
            params.courseSession = _this.modalMenu.attr('data-coursesession');
            params.classId = _this.modalMenu.attr('data-classactive');
            params.dateUse = moment(date.start).format('YYYY-MM-DD');
            // GET SCHEDULE BY DATE
            Cloud.getMenuByDateUse.with(params).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
              if (err) {
                //Trigger button click Add
                $("#btnAdd").click();
              } else {
                if (!responseBody.menu.id ) {
                  //Trigger button click Add
                  $("#btnAdd").click();
                } else {
                  _this.modalMenu.attr('data-manner', 'edit');
                  _this.modalMenu.attr('data-menuId', responseBody.menu.id );
                  // CHANGE TEXT
                  $('.modal-title').find('.txtAdd').attr("hidden", true);
                  $('.modal-title').find('.txtUpdate').attr("hidden", false);
                  $('#submitFormMenu').find('.btnAdd').attr("hidden", true);
                  $('#submitFormMenu').find('.btnUpdate').attr("hidden", false);
                  // $('#multipleDay').attr("hidden", true);
                if (!responseBody.permissions.isMainSchoolAdmin && !responseBody.permissions.isHavePermissionDelete) {
                  $('#deleteMenu').attr("hidden", true);
                }
                if (!responseBody.permissions.isMainSchoolAdmin && !responseBody.permissions.isHavePermissionEdit) {
                  $('#submitFormMenu').attr("hidden", true);
                }
                  _this.handlerEditEventsByDate(responseBody);
                }
              }
            });
          }
        });
        _this.calendarObj.render(); 
      }
    }
  
    onChangeClass() {
      let _this = this;
      $('.class-item').click((e) => {
  
        //update active class
        $('.class-item').removeClass('active');
        $(e.target).addClass('active');
  
        //change calander
        _this.calendarEl.attr('data-classactive', $(e.target).attr('data-classId'));
  
        _this.initCalendar();
      });
    }
  }