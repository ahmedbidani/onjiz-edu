class IndexFormMenuBackendEKP extends BaseBackendEKP {
  constructor() {
    super();
    this.initialize();
  }

  initialize() {
    let _this = this;
    _this.countSlot = 1;
    _this.menuFormContent = $('.menuFormContent');
    _this.getMenu();
    _this.initTimePicker();
    _this.initDatePicker();
    _this.initRepeater();
    _this.submitFormMenu();
    $('#classes').select2();
    $('#food0').select2();
  }


  getMenu() {
    let _this = this;
    let manner = _this.menuFormContent.attr('data-manner');
    let temp = {};
    temp.courseSession = _this.menuFormContent.attr('data-coursesession');
    temp.id = _this.menuFormContent.attr('data-menuid');
    if (manner == 'edit') {
      Cloud.getMenu.with(temp).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
        if (err) {
          console.log(err);
          return;
        } else {
          let slotFeedings = responseBody.menuObj.slotFeedings;
          let listFoods = responseBody.foods;
          let renderListFood = '';
          _this.countSlot = slotFeedings.length + 1;
          for (let i = 0; i < slotFeedings.length; i++) {
            let foodListIds = slotFeedings[i].foods;
            let htmlOption = '';
            _.each(listFoods, function (food, idx) {
              htmlOption += `<option value="${food.id}" ${foodListIds.indexOf(food.id) != -1 ? 'selected' : ''}>${food.title}</option>`
            });

            renderListFood +=
              `<div data-repeater-item class="row">
                <div class="col-6">
                  <div class="form-group">
                    <label>Thời gian:</label>
                    <div class="input-group date timeSlotFeedings" id="timeSlotFeedings${i == 0 ? '' : i}" data-target-input="nearest">
                      <div class="input-group timeSlotFeedings" data-target="#timeSlotFeedings${i == 0 ? '' : i}"
                        data-toggle="datetimepicker" id="timeSlotFeedings${i}">
                        <input type="text" name="slotFeedings[${i}][time]" class="form-control datetimepicker-input" id="timeSlotFeedings${i == 0 ? '' : i}" 
                        data-target="#timeSlotFeedings${i == 0 ? '' : i}" value="${slotFeedings[i].time}">
                        <div class="input-group-addon input-group-append">
                          <i class="mdi mdi-clock input-group-text"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="row">
                    <div class="col-11">
                      <div class="form-group">
                        <label class="form-control-label">`+ _i18nMsg["Feeding"] + `</label>
                        <select id="food${i}" name="slotFeedings[${i}][foods][]" class="form-control js-process-basic-multiple select2-multiple select2-hidden-accessible" 
                        data-placeholder="<%= __('Choose') %>" multiple="" data-select2-id="food${i}" tabindex="-1" aria-hidden="true">
                          ${htmlOption}
                          </select>
                      </div>
                    </div>
                    <div class="col-1 d-flex align-items-center">
                      <button data-repeater-delete type="button" class="btn btn-danger btn-sm icon-btn ml-2">
                        <i class="mdi mdi-delete"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>`;
          }

          $('.slotFeedings').empty();
          $('.slotFeedings').append(renderListFood);
          for (let i = 0; i < slotFeedings.length; i++) {
            // datetime
            $(`#timeSlotFeedings${i == 0 ? '' : i}`).datetimepicker({
              format: 'HH:mm',
              icons: {
                up: "mdi mdi-arrow-up",
                down: "mdi mdi-arrow-down"
              }
            });
            // create select2
            $('#food' + i).select2();
          }
        }
      });
    }
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

  initTimePicker(element, idx) {
    let timeSlotFeedingsItem = 'timeSlotFeedings';
    if (idx) {
      timeSlotFeedingsItem += idx;
      element.find(".timeSlotFeedings").attr('id', timeSlotFeedingsItem);
      element.find(".timeSlotFeedings").attr('data-target', '#' + timeSlotFeedingsItem);
      element.find(".datetimepicker-input").attr('id', timeSlotFeedingsItem);
      element.find(".datetimepicker-input").attr('data-target', '#' + timeSlotFeedingsItem);
      element.find("#food0").attr('id', "food" + idx);
      // change id select2
      element.find("#food" + idx).attr('data-select2-id', "food" + idx);
      //remove span duplicated by repeater
      element.find('span:last-child', this).remove();
      if ($('#' + timeSlotFeedingsItem).length) {
        $('#' + timeSlotFeedingsItem).datetimepicker({
          format: 'HH:mm',
          icons: {
            up: "mdi mdi-arrow-up",
            down: "mdi mdi-arrow-down"
          }
        });
      }
    } else {
      $(".timeSlotFeedings").attr('id', timeSlotFeedingsItem);
      $(".timeSlotFeedings").attr('data-target', '#' + timeSlotFeedingsItem);
      $(".datetimepicker-input").attr('id', timeSlotFeedingsItem);
      $(".datetimepicker-input").attr('data-target', '#' + timeSlotFeedingsItem);
      if ($('#' + timeSlotFeedingsItem).length) {
        $('#' + timeSlotFeedingsItem).datetimepicker({
          format: 'HH:mm',
          icons: {
            up: "mdi mdi-arrow-up",
            down: "mdi mdi-arrow-down"
          }
        });
      }
    }
  }

  initRepeater() {
    let _this = this;
    $('.repeater').repeater({
      defaultValues: {
        'text-input': 'foo'
      },
      show: function () {
        $(this).slideDown();
        $(this).find(".datetimepicker-input").attr('id', "timeSlotFeedings" + _this.countSlot)
        _this.initTimePicker($(this), _this.countSlot);
        $('#food' + _this.countSlot).select2();
        _this.countSlot++;
      },
      hide: function (deleteElement) {
        _this.initSweetAlert($(this), deleteElement);
      },
      isFirstItemUndeletable: true
    });
  }

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

  submitFormMenu() {
    let _this = this;
    $('#submitFormMenu').on('click', () => {
      let manner = _this.menuFormContent.attr('data-manner');
      // prepare data
      let temp = {};
      temp.classIds = $('#classes').val();
      console.log('classes: ', temp.classIds);
      if ($('#dateMenu').val() != '') {
        temp.dateUse = moment($('#dateMenu').val(), "DD/MM/YYYY").format("YYYY-MM-DD");
        temp.slotFeedings = $('.repeater').repeaterVal().slotFeedings;
        console.log('submitFormMenu: ', temp.slotFeedings);
        if (temp.slotFeedings) {
          //check data slot feedings empty
          let isValid = true;
          let oFormData = $('.repeater').serializeArray();
          for (let iIndex in oFormData) {
            if (oFormData[iIndex].value == '' || oFormData[iIndex].value == 0) { isValid = false; }
          }
          if (isValid) {
            temp._csrf = $('[name="_csrf"]').val();
            if (manner == 'add') {
              // ADD MENU
              console.log('addMenu: ', $('.repeater').repeaterVal());
              Cloud.addMenu.with(temp).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
                if (err) {
                  console.log(err);
                  return;
                } else {
                  if (responseBody.code == 'MENU_EXISTED') {
                    swal(`Menu ngày ${$('#dateMenu').val()} đã tồn tại !`, {
                      icon: "warning",
                      button: false,
                    });
                  } else {
                    swal("Tạo mới thành công !", {
                      icon: "success",
                      button: false,
                      timer: 1500,
                    });
                  }
                }
              })
            } else {
              // EDIT MENU
              console.log('editMenu: ', $('.repeater').repeaterVal());
              Cloud.editMenu.with(temp).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
                if (err) {
                  console.log(err);
                  return;
                } else {
                  if (responseBody.code == 'MENU_NOT_FOUND') {
                    swal(`Menu không tồn tại !`, {
                      icon: "warning",
                      button: false,
                    });
                  } else {
                    swal(_this.messages.editSuccess, {
                      icon: "success",
                      button: false,
                      timer: 1500,
                    });
                  }
                }
              })
            }
          } else {
            swal(`Dữ liệu vừa nhập không chính xác !`, {
              icon: "warning",
              button: false,
            });
          }
        } else {
          swal(`Thời gian và món ăn không được để trống !`, {
            icon: "warning",
            button: false,
          });
        }
      } else {
        swal(`Vui lòng chọn ngày !`, {
          icon: "warning",
          button: false,
        });
      }
    });
  }
}