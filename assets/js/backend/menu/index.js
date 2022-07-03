class IndexListMenuBackendEKP extends BaseBackendEKP {
  constructor() {
    super();
    this.initialize();
  }

  initialize() {
    let _this = this;
    _this.menuFormContent = $('.menuFormContent');
    _this.calendar = $('#calendarMenu');
    _this.menuDetail = $('#menuDetail');
    _this.modalMenu = $("#modalMenu");
    _this.originalModal = $('#modalMenu').clone();
    _this.rangeTimeLength = _this.modalMenu.attr('data-rangeTimeLength');
    // _this.countSlot = _this.rangeTimeLength;
    _this.initBtnEditAdd();
    _this.initCalendar();
    // _this.initTimePicker();
    _this.initDatePicker();
    // _this.initRepeater();
    _this.submitFormMenu();
    _this.initSelect2Food()
    _this.initDeleteMenu();
    $('#classes').select2({ width: '100%' });
    $('.js-height-scrollbar').perfectScrollbar();
    _this.alert = _this.modalMenu.find('.alert');

    //dateRangePicker
    // _this.initDateRangePicker();
    // _this.dateUseStart = moment().format("YYYY-MM-DD");
    // _this.dateUseEnd = moment().add(7,'days').format("YYYY-MM-DD");
  }

  initCalendar() {
    let _this = this;
    let classId = _this.calendar.attr('data-classactive');
    if (_this.calendar.length) {
      var calendarEl = document.getElementById('calendarMenu');
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
            url: '/api/v1/backend/menu/search',
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
      calendar.render(); 
    }
  }

  handlerEditEventsByDate(data) {
    let _this = this;
    let dataMenu = data.rangeTime;
    let foods = data.foods;
    let classes = data.classes;
    let menuObj = data.menu;
    _this.modalMenu.on('show.bs.modal', function (e) {
      console.log('show');
      // _this.countSlot = dataMenu.length + 1;
      //update class which apply this menu
      let htmlOptionClass = '';
      _.each(classes, function (classObj, idx) {
        htmlOptionClass += `<option value="${classObj.id}" ${menuObj.class == classObj.id ? 'selected' : ''}>${classObj.title}</option>`
      });
      $('#classes').empty();
      $('#classes').append(htmlOptionClass);

      //update dateUse input
      $("#dateMenu").val(moment(menuObj.dateUse, "YYYY-MM-DD").format("DD/MM/YYYY"));

      let renderListFood =
      `<div class="row">
        <div class="col-12">
          <div class="accordion" id="accordion" role="tablist">
          </div>
        </div>
      </div>`;
      // render html & select food
      // let countTimeSlotFeeding = 0;
      // let count = 0;
      if (dataMenu) {
        for (let i = 0; i < dataMenu.length; i++) {
          renderListFood +=
            `<div class="card">
                <div class="card-header" role="tab" id="heading-${i}">
                  <h6 class="mb-0">
                    <a data-toggle="collapse" href="#collapse-${i}" aria-expanded="true"
                      aria-controls="collapse-${i}">
                      ${dataMenu[i].name} (${dataMenu[i].timeStart} -> ${dataMenu[i].timeEnd})
                    </a>
                  </h6>
                </div>
                <div id="collapse-${i}" class="collapse show" role="tabpanel"  data-timeStart="${dataMenu[i].timeStart}" data-timeEnd="${dataMenu[i].timeEnd}"
                  aria-labelledby="heading-${i}" data-parent="#accordion">
                    <div class="mt-1">`;
          if (dataMenu[i].list.length > 0) {
            // countTimeSlotFeeding += dataMenu[i].list.length;

            let foodApply = dataMenu[i].list[0].food;
              let foodIds = []; 
              let htmlOption = '';
                if(foodApply.length > 0){
                  _.each(foodApply, function (food, ind) {
                    if(food) {
                      foodIds.push(food.id);
                      htmlOption += `<option value="${food.id}" selected>
                                    ${food.title}
                                  </option>`;
                    }
                    
                  });
                }
            _.each(foods, function (food, index) {
              if (!foodIds.includes(food.id)) {
                htmlOption += `<option value="${food.id}">
                ${food.title}
              </option>`
                }
              })
              renderListFood += `
              <select id="food${i}" name="foods" class="form-control js-process-basic-multiple  select2-multiple"
                data-placeholder="<%= __('Choose') %>" multiple="multiple">
                ${htmlOption}
              </select>`
            
            renderListFood +=
                    `</div>
                  </div>
              </div>`
          } else {
            let htmlOption = '';
            _.each(foods, function (food, index){
              htmlOption += `<option value="${food.id}" >
              ${food.title}
            </option>`
            })
            renderListFood += `
                <select id="food${i}" name="foods" class="form-control js-process-basic-multiple  select2-multiple"
                  data-placeholder="<%= __('Choose') %>" multiple="multiple">
                  ${htmlOption}
                </select>
              </div>
              </div>
            </div>`;
          }
        }
      }
      $('.slotFeedingsWrap').empty();
      $('.slotFeedingsWrap').append(renderListFood);
      // create date time picker
      // for (let i = 0; i < count; i++) {
      //   $('#timeSlotFeedings' + i).datetimepicker({
      //     format: 'HH:mm',
      //     icons: {
      //       up: "mdi mdi-arrow-up",
      //       down: "mdi mdi-arrow-down"
      //     },
      //     //enabledHours: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
      //     stepping: 15,
      //   });
      // }
      // _this.countSlot = countTimeSlotFeeding;
      //init repeater
      // _this.initRepeater();
      
      //create select 2
      $('.js-process-basic-multiple').select2({ width: '100%', tags: true });
      
      $('.js-process-basic-multiple').on("select2:select", function (evt) {
        var element = evt.params.data.element;
        var $element = $(element);
        
        $element.detach();
        $(this).append($element);
        $(this).trigger("change");
        // if ($(this).find(":selected").length > 1) {
        //   var $second = $(this).find(":selected").eq(-2);
        //   $second.after($element);
        // } else {
        //   $element.detach();
        //   $(this).prepend($element);
        // }

        // $(this).trigger("change");
      });
      // on unselect, put the selected item last
      $("js-process-basic-multiple").on("select2:unselect", function (evt) {
        var element = evt.params.data.element;
        $(this).append(element);
      });
      
      // render time
      _.each(dataMenu, (value, key) => {
        if (key == 'dateUse') {
          _this.modalMenu.find('[name="dateMenu"]').val(moment(value, "YYYY-MM-DD").format("DD/MM/YYYY"));
          $('#dateMenu').prop('readonly', true);
        }
      });
    });
    _this.modalMenu.on('hide.bs.modal', function (e) {
      $('#modalMenu').remove();
      let myClone = _this.originalModal.clone();
      $('.container-fluid').append(myClone);
      _this.initialize();
    });
    _this.modalMenu.modal('show');
  }

  initDatePicker() {
    //init datepicker
    let inpDate = $('.dateAddMenu input');
    let dateVal = $('.dateAddMenu input').val();
    let curDate = moment().format("DD/MM/YYYY");
    inpDate.datepicker({
      format: 'dd/mm/yyyy',
      todayHighlight: true,
      orientation: 'bottom right',
      autoclose: true
    }).datepicker('setDate', dateVal ? dateVal : curDate).on("changeDate", function (e) {
      console.log("hihi" + inpDate.val());
    });
  }

  // initTimePicker(element, idx) {
  //   let _this = this;
  //   let timeSlotFeedingsItem = 'timeSlotFeedings';
  //   if (idx) {
  //     timeSlotFeedingsItem += idx;
  //     element.find(".timeSlotFeedings").attr('id', timeSlotFeedingsItem);
  //     element.find(".timeSlotFeedings").attr('data-target', '#' + timeSlotFeedingsItem);
  //     element.find(".datetimepicker-input").attr('id', timeSlotFeedingsItem);
  //     element.find(".datetimepicker-input").attr('data-target', '#' + timeSlotFeedingsItem);

  //     for (let i = 0; i < _this.rangeTimeLength; i++) {
  //       element.find("#food"+i).attr('id', "food" + idx);
  //     }
  //     // change id select2
  //     element.find("#food" + idx).attr('data-select2-id', "food" + idx);
  //     //remove span duplicated by repeater
  //     element.find('span:last-child', this).remove();
  //     if ($('#' + timeSlotFeedingsItem).length) {
  //       $('#' + timeSlotFeedingsItem).datetimepicker({
  //         format: 'HH:mm',
  //         icons: {
  //           up: "mdi mdi-arrow-up",
  //           down: "mdi mdi-arrow-down"
  //         },
  //         enabledHours: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
  //         stepping: 15,
  //         showClear: true,
  //       });
  //     }
  //     $('.datetimepicker-input:last').val('06:00');
  //   } else {
  //     for (let i = 0; i < _this.rangeTimeLength; i++) {
  //       timeSlotFeedingsItem = 'timeSlotFeedings' + i;
  //       $(".timeSlotFeedings"+i).attr('id', timeSlotFeedingsItem);
  //       $(".timeSlotFeedings"+i).attr('data-target', '#' + timeSlotFeedingsItem);
  //       $(".datetimepicker-input"+i).attr('id', timeSlotFeedingsItem);
  //       $(".datetimepicker-input"+i).attr('data-target', '#' + timeSlotFeedingsItem);
  //       if ($('#' + timeSlotFeedingsItem).length) {
  //         $('#' + timeSlotFeedingsItem).datetimepicker({
  //           format: 'HH:mm',
  //           icons: {
  //             up: "mdi mdi-arrow-up",
  //             down: "mdi mdi-arrow-down"
  //           },
  //           enabledHours: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
  //           stepping: 15,
  //           showClear: true,
  //         });
  //       }
  //       $(".datetimepicker-input").val('06:00');
  //     }
  //   }
  // }

  // initRepeater() {
  //   let _this = this;
  //   for (let i = 0; i < _this.rangeTimeLength; i++) {
  //     $('.repeater'+i).repeater({
  //       defaultValues: {
  //         'text-input': 'foo'
  //       },
  //       show: function () {
  //         $(this).slideDown();
  //         $(this).find(".datetimepicker-input").attr('id', "timeSlotFeedings" + _this.countSlot);
  //         _this.initTimePicker($(this), _this.countSlot);
  //         // $('#food' + _this.countSlot).select2();
  //         $('.js-process-basic-multiple').select2({ width: '100%' });
  //         _this.countSlot++;
  //       },
  //       hide: function (deleteElement) {
  //         _this.initSweetAlert($(this), deleteElement);
  //       },
  //       isFirstItemUndeletable: false
  //     });
  //   }
  // }

  initSweetAlert(element, deleteElement) {
    swal({
      title: this.messages.deletePopup,
      icon: 'warning',
      cancelButtonColor: '#ff4081',
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
          closeModal: true
        }
      }
    }).then((value) => {
      if (value) {
        element.slideUp(deleteElement);
      }
    });
  }
  
  // getMenu() {
  //   let _this = this;
  //   let manner = _this.modalMenu.attr('data-manner');
  //   let temp = {};
  //   temp.courseSession = _this.modalMenu.attr('data-coursesession');
  //   temp.id = _this.modalMenu.attr('data-menuid');
  //   if (manner == 'edit') {
  //     Cloud.getMenu.with(temp).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
  //       if (err) {
  //         console.log(err);
  //         return;
  //       } else {
  //         _this.modalMenu.on('shown.bs.modal', function (e) {
  //           let classes = responseBody.menuObj.classes;
  //           let listClasses = responseBody.classes;
  //           let htmlOptionClass = '';
  //           _.each(listClasses, function (classObj, idx) {
  //             htmlOptionClass += `<option value="${classObj.id}" ${classes.indexOf(classObj.id) != -1 ? 'selected' : ''}>${classObj.title}</option>`
  //           });
  //           $('#classes').empty();
  //           $('#classes').append(htmlOptionClass);
  //           // $("#classes").select2('val', classes);
            
  //           //dateUse input
  //           $("#dateMenu").val(moment(responseBody.menuObj.dateUse, "YYYY-MM-DD").format("DD/MM/YYYY"));

  //           let slotFeedings = responseBody.menuObj.slotFeedings;
  //           let listFoods = responseBody.foods;
  //           let renderListFood = '';
  //           _this.countSlot = slotFeedings.length + 1;
  //           for (let i = 0; i < slotFeedings.length; i++) {
  //             let foodListIds = slotFeedings[i].foods;
  //             let htmlOption = '';
  //             _.each(listFoods, function (food, idx) {
  //               htmlOption += `<option value="${food.id}" ${foodListIds.indexOf(food.id) != -1 ? 'selected' : ''}>${food.title}</option>`
  //             });
  
  //             renderListFood +=
  //               `<div data-repeater-item class="row">
  //                 <div class="col-4">
  //                   <div class="form-group">
  //                     <label>Thời gian:</label>
  //                     <div class="input-group date timeSlotFeedings" id="timeSlotFeedings${i == 0 ? '' : i}" data-target-input="nearest">
  //                       <div class="input-group timeSlotFeedings" data-target="#timeSlotFeedings${i == 0 ? '' : i}"
  //                         data-toggle="datetimepicker" id="timeSlotFeedings${i}">
  //                         <input type="text" name="slotFeedings[${i}][time]" class="form-control datetimepicker-input" id="timeSlotFeedings${i == 0 ? '' : i}" 
  //                         data-target="#timeSlotFeedings${i == 0 ? '' : i}" value="${slotFeedings[i].time}">
  //                         <div class="input-group-addon input-group-append">
  //                           <i class="mdi mdi-clock input-group-text"></i>
  //                         </div>
  //                       </div>
  //                     </div>
  //                   </div>
  //                 </div>
  //                 <div class="col-6">
  //                   <div class="form-group">
  //                     <label class="form-control-label">Món ăn:</label>
  //                     <select id="food${i}" name="slotFeedings[${i}][foods][]" class="form-control js-process-basic-multiple select2-multiple select2-hidden-accessible" 
  //                     data-placeholder="Choose" multiple="" data-select2-id="food${i}" tabindex="-1" aria-hidden="true">
  //                       ${htmlOption}
  //                       </select>
  //                   </div>
  //                 </div>
  //                 <div class="col-2 d-flex align-items-center">
  //                   <button data-repeater-delete type="button" class="btn btn-danger btn-sm icon-btn ml-2">
  //                     <i class="mdi mdi-delete"></i>
  //                   </button>
  //                 </div>
  //               </div>`;
  //           }
  
  //           $('.slotFeedings').empty();
  //           $('.slotFeedings').append(renderListFood);
  //           for (let i = 0; i < slotFeedings.length; i++) {
  //             // datetime
  //             $(`#timeSlotFeedings${i == 0 ? '' : i}`).datetimepicker({
  //               format: 'HH:mm',
  //               icons: {
  //                 up: "mdi mdi-arrow-up",
  //                 down: "mdi mdi-arrow-down"
  //               },
  //               //enabledHours: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
  //               stepping: 15,
  //             });
  //             // create select2
  //             $('#food' + i).select2({ width: '100%' });
  //           }
  //         });

  //         _this.modalMenu.on('hide.bs.modal', function (e) {
  //           _this.modalMenu.remove();
  //           let myClone = _this.originalModal.clone();
  //           $('.container-fluid').append(myClone);
  //           _this.initialize();
  //         });

  //         _this.modalMenu.modal('show');
  //       }
  //     });
  //   }
  // }

  initBtnEditAdd() {
    let _this = this;
    let btnAddMenu = $('#btnAdd');
    // let btnEditMenu = $('#editMenu');

    // btnEditMenu.on('click', () => {
    //   _this.modalMenu.attr('data-manner', 'edit');
    //   // CHANGE TEXT
    //   $('.modal-title').find('.txtAdd').attr("hidden", true);
    //   $('.modal-title').find('.txtUpdate').attr("hidden", false);
    //   $('#submitFormMenu').find('.btnAdd').attr("hidden", true);
    //   $('#submitFormMenu').find('.btnUpdate').attr("hidden", false);
    //   $('#singleDay').attr("hidden", false);
    //   $('#dateMenu').prop('readonly', true);
    //   $('#multipleDay').attr("hidden", true);
    //   _this.getMenu();
    // })

    btnAddMenu.on('click', () => {
      _this.modalMenu.attr('data-manner', 'add');
      // CHANGE TEXT
      $('.modal-title').find('.txtUpdate').attr("hidden", true);
      $('.modal-title').find('.txtAdd').attr("hidden", false);
      $('#submitFormMenu').attr("hidden", false);
      $('#submitFormMenu').find('.btnUpdate').attr("hidden", true);
      $('#submitFormMenu').find('.btnAdd').attr("hidden", false);
      // $('#singleDay').attr("hidden", true);
      // $('#multipleDay').attr("hidden", false);
      $('#deleteMenu').attr("hidden", true);

      //set select for current class
      let classActive = _this.modalMenu.attr('data-classactive');
      // $('select[name=classes] option[value=' + classActive + ']').prop('selected', true);
      $('select[name=classes]').val(classActive).trigger('change')
    })
  }

  submitFormMenu() {
    let _this = this;
    $('#submitFormMenu').on('click', () => {
      let manner = _this.modalMenu.attr('data-manner');
      // prepare data
      let temp = {};
      temp.classIds = $('#classes').val();
      console.log('classes: ', temp.classIds);
      // if ($('#dateMenuStart').val() != '' && $('#dateMenuEnd').val() != '' && $('#dateMenu').val() != '') {
      if ($('#dateMenu').val() != '') {
        temp.dateUse = moment($('#dateMenu').val(), "DD/MM/YYYY").format("YYYY-MM-DD");
        // temp.dateUseStart = _this.dateUseStart;
        // temp.dateUseEnd = _this.dateUseEnd;
        //get all array {time+food} of all repeater
        // let tmpSlotFeedingArr = $('.repeater').repeaterVal();
        temp.slotFeedings = [];
        for (let i = 0; i < _this.rangeTimeLength; i++){
          // if(tmpSlotFeedingArr['slotFeedings'+i]) temp.slotFeedings.push(...tmpSlotFeedingArr['slotFeedings'+i]);
          let item = {};
          let time = $('#collapse-' + i).attr('data-timeStart');
          let foods = $('#food' + i).val();
          item.time = time;
          item.foods = foods;
          if (item.foods.length > 0) temp.slotFeedings.push(item);

        }
        console.log('submitFormMenu: ', temp.slotFeedings);
        if (temp.slotFeedings) {
          //check data slot feedings empty
          let isValid = true;
          for (let slot of temp.slotFeedings) {
            if (slot.time == '' || slot.foods.length == 0) { isValid = false; }
          }
          if (isValid) {
            temp._csrf = $('[name="_csrf"]').val();
            if (manner == 'add') {
              let _i18nMsg = i18n[_this.lang];
              // ADD MENU
              // console.log('addMenu: ', $('.repeater').repeaterVal());
              Cloud.addMenu.with(temp).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
                if (err) {
                  console.log(err);
                  if (err.responseInfo && err.responseInfo.body && err.responseInfo.body.code == "MENU_NOT_ALLOW_IN_WEEKEND") {
                    _this.alert.removeClass('hidden alert-success').addClass("alert-danger").html(_i18nMsg["Can not add menu in weekend"]);
                  }
                } else {
                  if (responseBody.code == 'MENU_EXISTED') {
                    _this.alert.removeClass('hidden alert-success').addClass("alert-danger").html(_i18nMsg["Menu existed"]);
                  } else {
                    _this.alert.removeClass('hidden alert-danger').addClass("alert-success").html(_this.messages.addSuccess);
                    _this.calendar.fullCalendar('refetchEvents');
                    $('.modal').on('hidden.bs.modal', function () {
                      _this.modalMenu.remove();
                      let myClone = _this.originalModal.clone();
                      $('.container-fluid').append(myClone);
                      _this.initialize();
                    });
                  }
                }
              })
            } else {
              // EDIT MENU
              Cloud.editMenu.with(temp).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
                if (err) {
                  console.log(err);
                  return;
                } else {
                  if (responseBody.code == 'MENU_NOT_FOUND') {
                    _this.alert.removeClass('hidden alert-success').addClass("alert-danger").html(_i18nMsg["Menu is not existed"]);
                  } else {
                    _this.alert.removeClass('hidden alert-danger').addClass("alert-success").html(_this.messages.editSuccess);
                    _this.calendar.fullCalendar('refetchEvents');
                    $('.modal').on('hidden.bs.modal', function () {
                      _this.modalMenu.remove();
                      let myClone = _this.originalModal.clone();
                      $('.container-fluid').append(myClone);
                      _this.initialize();
                    });
                  }
                }
              })
            }
          } else {
            // swal(`Dữ liệu vừa nhập không chính xác !`, {
            //   icon: "warning",
            //   button: false,
            // });
            _this.alert.removeClass('hidden alert-success').addClass("alert-danger").html(_this.messages.dataInvalid);
          }
        } else {
          // swal(`Thời gian và món ăn không được để trống !`, {
          //   icon: "warning",
          //   button: false,
          // });
          _this.alert.removeClass('hidden alert-success').addClass("alert-danger").html( _i18nMsg["Food must not empty"] );
        }
      } else {
        // swal(`Vui lòng chọn ngày !`, {
        //   icon: "warning",
        //   button: false,
        // });
        _this.alert.removeClass('hidden alert-success').addClass("alert-danger").html( _i18nMsg["Please select a date"]);
      }
    });
  }

  initSelect2Food() {
    let _this = this;
    for (let i = 0; i < _this.rangeTimeLength; i++){
      $('#food' + i).select2({ width: '100%', tags: true });
      $('#food'+i).on("select2:select", function (evt) {
        var element = evt.params.data.element;
        var $element = $(element);
        
        $element.detach();
        $(this).append($element);
        $(this).trigger("change");
        // if ($(this).find(":selected").length > 1) {
        //   var $second = $(this).find(":selected").eq(-2);
        //   $second.after($element);
        // } else {
        //   $element.detach();
        //   $(this).prepend($element);
        // }

        // $(this).trigger("change");
      });
      // on unselect, put the selected item last
      $("#food"+i).on("select2:unselect", function (evt) {
        var element = evt.params.data.element;
        $(this).append(element);
      });
    }
  }

  initDeleteMenu() {
    let _this = this;
    $('#deleteMenu').on('click', () => {
      let id = _this.modalMenu.attr('data-menuId');
      swal({
        title: this.messages.deletePopup,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3f51b5',
        cancelButtonColor: '#ff4081',
        confirmButtonText: 'Great ',
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
            closeModal: true
          }
        }
      }).then((value) => {
        if (value) {
          Cloud.deleteMenu.with({ id: id,  _csrf: $('[name="_csrf"]').val() }).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
            if (err) {
              console.log(err);
              return;
            } else if (responseBody) {
              swal({
                title: this.messages.deleteSuccessfully,
                icon: 'success',
                button: {
                  text: this.messages.continue,
                  value: true,
                  visible: true,
                  className: "btn btn-primary"
                }
              }).then((value) => {
                //THEN RELOAD PAGE IF NEEDED 
                location.reload();
              })
            }
          })
        }
      });
    });
  }

  
  // initDateRangePicker() {
  //   let _this = this;
  //   $('input[name="duration"]').daterangepicker({
  //     locale: {
  //       "format": "DD/MM/YYYY"
  //     },
  //     minDate: moment(),
  //     startDate: moment(),
  //     endDate: moment().add(7,'days'),
  //   }, function (start, end, label) {
  //     _this.dateUseStart = start.format('YYYY-MM-DD');
  //     _this.dateUseEnd = end.format('YYYY-MM-DD');
  //     console.log("A new date selection was made: " + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));
  //   });
  // }
}