class IndexPickUpBackendEKP extends BaseBackendEKP {
  constructor() {
    super();
    this.initialize();
  }

  initialize() {
    //DO NOT LOAD UNNESSESARY CLASS
    //Init form + list if page have BOTH  
    this.list = new ListIndexPickUpBackendEKP(this);
  }
}

class ListIndexPickUpBackendEKP {
  constructor(opts) {
    _.extend(this, opts);
    this.langUrl = this.lang == 'en' ? '' : '/js/backend/datatable.json';
    this.dataOrigin = [];
    this.tblId = 'tblPickUp';
    this.tableObj = $('#' + this.tblId);
    this.modalUpdatePickUp = 'updatePickUp';
    this.modalObj = $('#' + this.modalUpdatePickUp);
    this.chkAll = null;
    this.initialize();
  }


  initialize() {
    let _this = this;
    _this.initDataTable();
    _this.initTimePicker();
    _this.handlerModalEvent();
    _this.initDatePicker();
  }

  initTimePicker() {
    if ($("#timepicker-example").length) {
      $('#timepicker-example').datetimepicker({
        format: 'HH:mm',
        icons: {
          up: "mdi mdi-arrow-up",
          down: "mdi mdi-arrow-down"
        }
      });
    }
  }

  validateHhMm(value) {
    var isValid = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test(value);
    return isValid;
  }

  handlerModalEvent() {
    let _this = this;
    let objChoosed = null;
    $('#updatePickUp').on('show.bs.modal', function (e) {
      console.log('show');
      let arrDataOrigin = _this.dataOrigin;
      // prepared array arrDataOrigin
      let obj = {};
      for (let item of arrDataOrigin) {
        obj[item.id] = item;
      };
      objChoosed = obj[e.relatedTarget.dataset.pickupid];
      //Render data from response to form
      if (objChoosed) {
        console.log('objChoosed', objChoosed);
        //map id -> modal to edit
        _this.modalObj.attr('data-edit-id', objChoosed.id);
        //Update data to field
        _.each(objChoosed, (value, key) => {
          if (key == 'student') {
            //change avatar of student
            if (value.avatar != '') {
              $('#studentAvatar').attr('src', value.avatar);
            } else if (value.gender == 0) {
              $('#studentAvatar').attr('src', '/images/female-kid.png');
            } else $('#studentAvatar').attr('src', '/images/male-kid.png');
            _.each(value, (valueStudent, key) => {
              if (key == 'code') {
                let code = valueStudent.split('_');
                code = code[1] ? code[1] : code[0];
                _this.modalObj.find('[name=code]').text(code);
              } else {
                _this.modalObj.find(`[name="${key}"]`).text(valueStudent);
              }
            })
          } else if (key == 'classObj') {
            _.each(value, (valueClass, key) => {
              if (key != 'code')
              _this.modalObj.find(`[name="${key}"]`).text(valueClass);
            })
          } else if (key == 'arrParent') {
            let strHtml = '';
            _.each(value, (itemParent) => {
              strHtml +=
                `<div class="col-12 col-md-6">
                  <div class="form-check">
                      <label class="form-check-label" for="${itemParent.id}">
                          <input id="${itemParent.id}" type="radio" class="form-check-input" name="radioParent"
                              value="${itemParent.id}" ${objChoosed.parent ? (itemParent.id == objChoosed.parent.id ? "checked" : '') : ''}>
                          <i class="input-helper"></i> 
                          <div class="media">
                              <div class="pr-10">
                                <img class="mr-3 img-sm rounded-circle"
                                    src="${itemParent.avatar != '' ? itemParent.avatar : itemParent.gender == 0 ? '/images/female.png' : '/images/male.png'}"
                                    alt="...">
                              </div>
                              <div class="media-body">
                                  <h5>${itemParent.fullName}</h5>
                                  <i class="mdi mdi-cellphone-iphone"></i>
                                  <span>${itemParent.phone}</span>
                              </div>
                          </div>
                      </label>
                  </div>
                </div>`
            })
            $('#updatePickUp').find('.listParent').html(strHtml);
          } else if (key == 'time') {
            if (value != '')
            _this.modalObj.find(`[name="${key}"]`).val(value);
          }
          _this.modalObj.find(`[name="${key}"]`).text(value);
        });
      }
    })
    // Submit update pickup
    $('#btnUpdatePickUp').click(() => {
      let params = {};
      params.id = this.modalObj.attr('data-edit-id');
      params.classId = objChoosed.classObj.id;
      params.studenId = objChoosed.student.id;
      params.date = moment(objChoosed.date, "YYYY-MM-DD").format("DD-MM-YYYY");
      params.time = $('#timePickUp').val();
      params.parent = $('input[name=radioParent]:checked').val();
      if (!params.time || !params.parent) {
        swal(this.messages.dataInvalid, {
          icon: "warning",
          button: false,
        });
      } else if (!_this.validateHhMm(params.time)) {
        swal(this.messages.hourFormatInvalid, {
          icon: "error",
          button: false,
        });
      } else {
        params._csrf = $('[name="_csrf"]').val();
        console.log('params', params);
        Cloud.editPickUp.with(params).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
          if (err) {
            console.log(err)
          } else {
            swal(this.messages.editSuccess, {
              icon: "success",
              button: false,
            });
            $('#updatePickUp').modal('hide');
            _this.initDataTable(params.date);
          }
        });
      }
    })
  }

  initDataTable(dateChoosed) {
    let _this = this;
    let _i18nMsg = i18n[_this.lang];
    let params = {};
    //ONCLICK EDIT LINK
    let searchParams = new URLSearchParams(window.location.search);
    params.classId = _this.tableObj.attr('data-classActive');
    params.date = dateChoosed ? moment(dateChoosed, "DD/MM/YYYY").format("DD-MM-YYYY") : moment().format("DD-MM-YYYY");
    params.branchId = searchParams.get('branchId') || '';
    params.keyword = searchParams.get('keyword') || '';
    //cloud success
    var table = this.tableObj.DataTable({
      "language": {
        "url": this.langUrl
      },
      "processing": true,
      "serverSide": true,
      "ajax": {
        url:  `/api/v1/backend/class-${params.classId}/pickup?date=${params.date}&branchId=${params.branchId}&keyword=${params.keyword}`,
        async: true,
        error: function (xhr, error, code)
        {
          if(xhr.responseJSON && xhr.responseJSON.code == 'PICKUP_NOT_ALLOWED') {
            swal(_i18nMsg['Pickup is not allowed'], {
              icon: "warning",
              button: false,
            });
          } else {
            swal(this.messages.dataInvalid, {
              icon: "warning",
              button: false,
            });
          }
            console.log(xhr);
            console.log(code);
        }
      },
      "drawCallback": function (settings) {
        // Here the response
        _this.dataOrigin = settings.json.dataOrigin;
        console.log(settings.json);
      },
      //Add column data (JSON) mapping from AJAX to TABLE
      "columns": [
        { "data": "code" },
        { "data": "student" },
        { "data": "time" },
        { "data": "parent" },
        { "data": "tool" },
      ],
      //Define first column without order
      columnDefs: [
        { "orderable": false, "targets": [0, -3, -2, -1] }
      ],
      "order": [],
      "iDisplayLength": 50,
      "bLengthChange" : false,
      //"buttons": ['copy', 'excel', 'csv', 'pdf', 'print'],
      "pagingType": "numbers",
      //"sDom": "<'row'<'col-sm-6'><'col-sm-6 mb-10'B>>" + "<'row'<'col-sm-6'l><'col-sm-6'f>>" + "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-5'i><'col-sm-7'p>>",
      "sDom": "<'row'<'col-sm-6'l><'col-sm-6'f>>" + "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-5'i><'col-sm-7'p>>",
      "bDestroy": true,
      "searching": false,
    });
    
    $(".js-select2-class").val(params.classId).change();
    $("#filterKeyword").val(params.keyword);
    
    //// Onclick event to query data 
    $('#filterBtn').on('click', (e) => {
      e.preventDefault();
      let keyword = $("#filterKeyword").val();
      let classID = $(".js-select2-class option:selected").val()
      _this.routingPrepare(params.branchId, classID, keyword);
    })
  }

  routingPrepare(branchId,classId, keyword) {
    window.location = '/backend/pickup/filter?branchId=' + branchId + '&classId='+ classId + '&keyword='+ keyword;
  }
  
  initDatePicker() {
    //init datepicker
    let _this = this;
    let inpDate = $('.datePickUp input');
    let curDate = moment().format("DD/MM/YYYY");
    inpDate.datepicker({
      format: 'dd/mm/yyyy',
      todayHighlight: true,
      orientation: 'bottom right',
      autoclose: true,
      endDate: new Date()
    }).datepicker('setDate', curDate).on("changeDate", function (e) {
      console.log("hihi" + inpDate.val());
      _this.initDataTable(inpDate.val())
    });
  }
}