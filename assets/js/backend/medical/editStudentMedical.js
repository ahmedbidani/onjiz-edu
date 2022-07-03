class IndexEditMedicalBackendEKP extends BaseBackendEKP {
  constructor() {
    super();
    this.initialize();
  }

  initialize() {
    //DO NOT LOAD UNNESSESARY CLASS
    //Init form + list if page have BOTH  
    this.form = new EditStudentIndexMedicalBackendEKP(this);
  }
}

class EditStudentIndexMedicalBackendEKP {
  constructor(opts) {
    _.extend(this, opts);
    this.formId = 'formMedical';
    this.formObj = $('#' + this.formId);

    this.headline = this.formObj.find('.card-title');
    this.alert = this.formObj.find('.alert');
    this.btnSubmit = this.formObj.find('button[type="submit"]');
    this.btnReset = this.formObj.find('button[type="reset"]');

    /** init value for time start and time end */
    // this.singleEventDateStart = moment().format("YYYY-MM-DD");
    // this.singleEventDateEnd = moment().add(7, 'days').format("YYYY-MM-DD");
    // this.singleEventTimeStart = moment().format("HH:mm");
    // this.singleEventTimeEnd = moment().format("HH:mm");
    // this.recurringEventDateStart = moment().format("YYYY-MM-DD");
    // this.recurringEventDateEnd = moment().add(7, 'days').format("YYYY-MM-DD");

    this.initialize();
  }

  initialize() {
    let _this = this;
    //_this.initUploadFile();
    _this.initValidation();
    //_this.initEditorEventForm();
    _this.initChangeEventType();
    _this.initTimePicker();
    _this.initDateRangePicker();
    $('.js-process-basic-multiple').select2();
  }

  // initEditorEventForm = function () {
  //   if ($('#editorDescription').length > 0) {
  //     $('#editorDescription').summernote({
  //       height: 200, // set editor height
  //       minHeight: null, // set minimum height of editor
  //       maxHeight: null, // set maximum height of editor
  //       focus: true // set focus to editable area after initializing summernote
  //     });
  //   }
  //   if ($('#editorMotto').length > 0) {
  //     $('#editorMotto').summernote({
  //       height: 100, // set editor height
  //       minHeight: null, // set minimum height of editor
  //       maxHeight: null, // set maximum height of editor
  //       focus: true // set focus to editable area after initializing summernote
  //     });
  //   }
  // }

  initValidation() {
    let _this = this;
    let manner = _this.formObj.attr('data-manner');

    _this.formObj.formValidation({
        button: {
          selector: '#btnFormStudentMedical',
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

        //prepare recurringDay data
        let recurringDay = [];
        // if (tmpData.type == '1') {
        //   $.each($("input[name='recurringDay']:checked"), function () {
        //     recurringDay.push($(this).val());
        //   });
        //   tmpData.dateStart = _this.recurringEventDateStart;
        //   tmpData.dateEnd = _this.recurringEventDateEnd;
        // } else {
        //   tmpData.dateStart = _this.singleEventDateStart;
        //   tmpData.dateEnd = _this.singleEventDateEnd;
        //   tmpData.timeStart = _this.singleEventTimeStart;
        //   tmpData.timeEnd = _this.singleEventTimeEnd;
        //   tmpData.recurringDay = [];
        // }
        // tmpData.recurringDay = recurringDay;
        //prepare upload data
        // if (_this.uploadedFiles) {
        //   tmpData['thumbnail'] = _this.uploadedFiles;
        // }
        //reset form validator
        //if (manner === 'edit') {
        tmpData.id = _this.formObj.attr('data-edit-id');

        Cloud.editStudentMedical.with(tmpData).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
          if (err) {
            if (err.responseInfo.statusCode == 400) {
              _this.alert.removeClass('hidden alert-success').addClass("alert-danger").html(responseBody.message);
            } else {
              _this.alert.removeClass('hidden alert-success').addClass("alert-danger").html(_this.messages.error);
                setTimeout(function () {
                  _this.alert.removeClass('alert-danger').addClass("hidden alert-success");
                }, 3000);
              // $.toast({
              //   heading: 'Error',
              //   text: _this.messages.error,
              //   position: 'bottom-center',
              //   loaderBg:'#ff6849',
              //   icon: 'error',
              //   hideAfter: 3000
              // }); 
            }
            return;
        } else {
          _this.alert.removeClass('hidden alert-danger').addClass("alert-success").html(_this.messages.editSuccess);
          setTimeout(function () {
            _this.alert.removeClass('alert-success').addClass("hidden alert-danger");
          }, 3000);
            // $.toast({
            //   heading: 'Successfully',
            //   text: _this.messages.addSuccess,
            //   position: 'bottom-center',
            //   loaderBg:'#ff6849',
            //   icon: 'success',
            //   hideAfter: 3000
            // });
          }
          $('#formMedical').removeAttr("disabled");
            $('#formMedical').removeClass("disabled");
        });
        // } else {
        //   Cloud.addEvent.with(tmpData).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
        //     if (err) {
        //       if (err.responseInfo.statusCode == 400) {
        //         _this.alert.removeClass('hidden alert-success').addClass("alert-danger").html(responseBody.message);
        //       } else {
        //         _this.alert.removeClass('hidden alert-success').addClass("alert-danger").html(_this.messages.error);
        //         setTimeout(function () {
        //           _this.alert.removeClass('alert-danger').addClass("hidden alert-success");
        //         }, 3000);
        //       }
        //       return;
        //     } else {
        //       $('.alert').removeClass('hidden alert-danger').addClass("alert-success").html(_this.messages.addSuccess);
        //       setTimeout(function () {
        //         _this.alert.removeClass('alert-success').addClass("hidden alert-danger");
        //       }, 3000);
        //     }
        //   });
        // }
        console.log('----- FORM CATEGORY ----- [SUBMIT][END]');
      });
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
