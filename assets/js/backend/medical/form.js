class IndexFormMedicalBackendEKP extends BaseBackendEKP {
  constructor() {
    super();
    this.initialize();
  }

  initialize() {
    //DO NOT LOAD UNNESSESARY CLASS
    //Init form + list if page have BOTH  
    this.form = new FormIndexMedicalBackendEKP(this);
  }
}

class FormIndexMedicalBackendEKP {
  constructor(opts) {
    _.extend(this, opts);
    this.formId = 'formMedical';
    this.formObj = $('#' + this.formId);

    this.headline = this.formObj.find('.card-title');
    this.alert = this.formObj.find('.alert');
    this.btnSubmit = this.formObj.find('button[type="submit"]');
    this.btnReset = this.formObj.find('button[type="reset"]');


    this.initialize();
  }

  initialize() {
    let _this = this;
    _this.initValidation();
    //_this.initEditorEventForm();
    _this.initChangeEventType();
    _this.initTimePicker();
    _this.initDateRangePicker();
    $('.js-process-basic-multiple').select2();
  }


  initValidation() {
    let _this = this;
    let manner = _this.formObj.attr('data-manner');

    _this.formObj.formValidation({
        button: {
          selector: '#btnFormMedical',
          disabled: 'disabled'
        },
        fields: {},
        err: {
          clazz: 'invalid-feedback'
        },
        control: {
          // The CSS class for valid control
          valid: 'is-valid',

          // The CSS class for invalid control
          invalid: 'is-invalid'
        },
        row: {
          invalid: 'has-danger'
        },
        onSuccess: function (e) {
          //e.preventDefault();
          //console.log('FORM can submit OK');
        }
      })
      .on('success.form.fv', function (e) {
        // Prevent form submission
        e.preventDefault();
        console.log('----- FORM POST ----- [SUBMIT][START]');
        let $form = $(e.target);
        let formData = $form.serializeArray();
        let tmpData = {};
        _.each(formData, (item) => {
          if (item.name != 'recurringDay') {
            tmpData[item.name] = item.value;
          }
        });

        if (manner === 'edit') {
          tmpData.id = _this.formObj.attr('data-edit-id');
          Cloud.editMedical.with(tmpData).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
            if (err) {
              if (err.responseInfo.statusCode == 400) {
                _this.alert.removeClass('hidden alert-success').addClass("alert-danger").html(responseBody.message);
              } else {
                _this.alert.removeClass('hidden alert-success').addClass("alert-danger").html(_this.messages.error);
                setTimeout(function () {
                  _this.alert.removeClass('alert-danger').addClass("hidden alert-success");
                }, 3000);
              }
              return;
            } else {
              _this.alert.removeClass('hidden alert-danger').addClass("alert-success").html(_this.messages.editSuccess);
              setTimeout(function () {
                _this.alert.removeClass('alert-success').addClass("hidden alert-danger");
              }, 3000);
            }
            $('#btnFormMedical').removeAttr("disabled");
            $('#btnFormMedical').removeClass("disabled");
          });
        } else {
          Cloud.addMedical.with(tmpData).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
            if (err) {
              if (err.responseInfo.statusCode == 400) {
                _this.alert.removeClass('hidden alert-success').addClass("alert-danger").html(responseBody.message);
              } else {
                _this.alert.removeClass('hidden alert-success').addClass("alert-danger").html(_this.messages.error);
                setTimeout(function () {
                  _this.alert.removeClass('alert-danger').addClass("hidden alert-success");
                }, 3000);
              }
              return;
            } else {
              $('.alert').removeClass('hidden alert-danger').addClass("alert-success").html(_this.messages.addSuccess);
              setTimeout(function () {
                _this.alert.removeClass('alert-success').addClass("hidden alert-danger");
              }, 3000);
            }
          });
        }
        console.log('----- FORM CATEGORY ----- [SUBMIT][END]');
      });
  }

  initUploadFile() {
    let _this = this;
    $('.dropify').dropify();

    let inputFiles = _this.formObj.find('[type=file]');
    if (inputFiles.length) {
      if (_this.uploadedFiles == undefined) {
        _this.uploadedFiles = "";
      }
      inputFiles.each((i, input) => {
        $(input).on('change', (e) => {
          let _file = e.currentTarget.files[0];
          let _ext = _this.getFileExtension(_file, ['.png', '.jpg', '.jpeg', '.gif']);
          if (_file && _this.checkValidFile(_file, ['.png', '.jpg', '.jpeg', '.gif'])) {
            let _data = {
              thumbnail: _file,
              ext: _ext,
              _csrf: $('[name="_csrf"]').val()
            };
            Cloud.uploadEventThumbnail.with(_data).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
              if (err) {
                if (err.responseInfo && err.responseInfo.data && err.responseInfo.data.raw == "E_EXCEEDS_UPLOAD_LIMIT" || err.responseInfo && err.responseInfo.statusCode == 500) {
                  swal({
                    title: _this.messages.cannotUploadExcceedMaxSize,
                    icon: 'error',
                    button: {
                      text: _this.messages.continue,
                      value: true,
                      visible: true,
                      className: "btn btn-primary"
                    }
                  }).then((value) => {
                    //THEN RELOAD PAGE IF NEEDED 
                    window.location.reload();
                  })
                }
                console.log(err);
                //_this.error.removeClass('hidden');
                return;
              }
              //save thumb data to object uploadedFiles
              console.log(responseBody);
              _this.uploadedFiles = responseBody;

            })
            let _input = $(e.currentTarget);
            _input.parents('.fileinput').parent().prev().addClass('loading');
          } else if (_file != undefined) {
            $(e.currentTarget).parents('.fileinput').find('.has-error').html('Undefined');
          } else {
            $(e.currentTarget).parents('.fileinput').find('.has-error').html('');
          }
        });
      });
    }
  }

  checkValidFile(file, _ext) {
    let _this = this;
    let valid = false;

    _.each(_ext, (ext, i) => {
      if (file.name.indexOf(ext) != -1) {
        valid = true;
      }
    });
    return valid;
  }

  getFileExtension(file, _ext) {
    let _this = this;
    let pos = '';
    _.each(_ext, (ext, i) => {
      if (file.name.indexOf(ext) != -1) {
        pos = ext;
      }
    });
    return pos;
  }

  initChangeEventType() {
    if ($("#typeSingle").is(":checked")) {
      $('#singleTimeContainer').removeClass('hidden');
      $('#recurringTimeContainer').addClass('hidden');
    }

    $("#typeSingle").change(() => {
      if ($("#typeSingle").is(":checked")) {
        $('#singleTimeContainer').removeClass('hidden');
        $('#recurringTimeContainer').addClass('hidden');
      } else {
        $('#singleTimeContainer').addClass('hidden');
        $('#recurringTimeContainer').removeClass('hidden');
      }
    })

    if ($("#typeRecurring").is(":checked")) {
      $('#singleTimeContainer').addClass('hidden');
      $('#recurringTimeContainer').removeClass('hidden');
    }

    $("#typeRecurring").change(() => {
      if ($("#typeRecurring").is(":checked")) {
        $('#singleTimeContainer').addClass('hidden');
        $('#recurringTimeContainer').removeClass('hidden');
      } else {
        $('#singleTimeContainer').removeClass('hidden');
        $('#recurringTimeContainer').addClass('hidden');
      }
    })
  }

  initTimePicker() {
    $('.bootstrap-datetimepicker-input').bootstrapMaterialDatePicker({
      date: false,
      format: 'HH:mm',
      switchOnClick: true
    });
  }

  initDateRangePicker() {
    let _this = this;

    $('input[name="singleDuration"]').daterangepicker({
      locale: {
        "format": "DD/MM/YYYY  HH:mm"
      },
      timePicker: true,
      minDate: moment(),
      startDate: moment(),
      endDate: moment().add(7, 'days'),
    }, function (start, end, label) {
      _this.singleEventDateStart = start.format('YYYY-MM-DD');
      _this.singleEventTimeStart = start.format('HH:mm');
      _this.singleEventDateEnd = end.format('YYYY-MM-DD');
      _this.singleEventTimeEnd = end.format('HH:mm');
      console.log("A new date selection was made: " + start.format('YYYY-MM-DD HH:mm') + ' to ' + end.format('YYYY-MM-DD HH:mm'));
    });

    $('input[name="recurringDuration"]').daterangepicker({
      locale: {
        "format": "DD/MM/YYYY"
      },
      minDate: moment(),
      startDate: moment(),
      endDate: moment().add(7, 'days'),
    }, function (start, end, label) {
      _this.recurringEventDateStart = start.format('YYYY-MM-DD');
      _this.recurringEventDateEnd = end.format('YYYY-MM-DD');
      console.log("A new date selection was made: " + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));
    });

    if (_this.formObj.attr('data-dateStart') != '') {
      $('input[name="singleDuration"]').data('daterangepicker').setStartDate(_this.formObj.attr('data-dateStart') + ' ' + _this.formObj.attr('data-timeStart'));
      $('input[name="singleDuration"]').data('daterangepicker').setEndDate(_this.formObj.attr('data-dateEnd') + ' ' + _this.formObj.attr('data-timeEnd'));

      $('input[name="recurringDuration"]').data('daterangepicker').setStartDate(_this.formObj.attr('data-dateStart'));
      $('input[name="recurringDuration"]').data('daterangepicker').setEndDate(_this.formObj.attr('data-dateEnd'));
    }
  }

}
