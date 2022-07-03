class IndexFormStudentBackendEKP extends BaseBackendEKP {
  constructor() {
    super();
    this.initialize();
  }

  initialize() {
    //DO NOT LOAD UNNESSESARY CLASS
    //Init form + list if page have BOTH  
    this.form = new FormIndexStudentBackendEKP(this);
  }
}

class FormIndexStudentBackendEKP {
  constructor(opts) {
    _.extend(this, opts);
    this.formId = 'formStudent';
    this.formObj = $('#' + this.formId);

    this.headline = this.formObj.find('.panel-title');
    this.alert = this.formObj.find('.alert');
    this.btnSubmit = this.formObj.find('button[type="submit"]');
    this.btnReset = this.formObj.find('button[type="reset"]');

    this.initialize();
    this.initSelect2();
  }

  initialize() {
    let _this = this;
    _this.initUpload();
    _this.initUploadFile();
    _this.initValidation();
    $('.js-process-basic-multiple').select2();
  } 

  initUpload() {
    $('.dropify').dropify();
  }

  initValidation() {
    let _this = this;
    _this.formObj.formValidation({
      button: {
        selector: '#btnFormStudent',
        disabled: 'disabled'
      },
      fields: {
      },
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
    }).on('success.form.fv', function (e) {
      // Prevent form submission
      e.preventDefault();
      console.log('----- FORM SCHEDULE ----- [SUBMIT][START]');
      let $form = $(e.target);
      let formData = $form.serializeArray();
      let tmpData = {};
      _.each(formData, (item) => {
        if (item.name == 'classes') {
          if (tmpData[item.name] == undefined) {
            tmpData[item.name] = [item.value];
          } else if (item.value != '') {
            tmpData[item.name].push(item.value);
          }
        } else if (item.name == 'guardians') {
          tmpData.guardians = $('#guardian').val();
        } else {
          tmpData[item.name] = item.value;
        }
        //prepare upload data
        if (_this.uploadedFiles) {
          tmpData['thumbnail'] = _this.uploadedFiles;
        }

      });
      //reset form validator
      let manner = _this.formObj.attr('data-manner');
      if (manner === 'edit') {
        Cloud.editStudent.with(tmpData).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
          if (err) { 
            $.toast({
              heading: 'Error',
              text: _this.messages.error,
              position: 'bottom-center',
              loaderBg:'#ff6849',
              icon: 'error',
              hideAfter: 3000
            });
            return;
          } else {
            $.toast({
              heading: 'Successfully',
              text: _this.messages.editSuccess,
              position: 'bottom-center',
              loaderBg:'#ff6849',
              icon: 'success',
              hideAfter: 3000
            });
          }
        });
      } else {
        Cloud.addStudent.with(tmpData).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
          if (err) {
            $.toast({
              heading: 'Error',
              text: _this.messages.error,
              position: 'bottom-center',
              loaderBg:'#ff6849',
              icon: 'error',
              hideAfter: 3000
            }); 
            return;
          } else {
            $.toast({
              heading: 'Successfully',
              text: _this.messages.addSuccess,
              position: 'bottom-center',
              loaderBg:'#ff6849',
              icon: 'success',
              hideAfter: 3000
            });
          }
        });
      }
    });
  }

  initUploadFile() {
    let _this = this;

    let inputFiles = _this.formObj.find('[type=file]');
    if (inputFiles.length) {
      if (_this.uploadedFiles == undefined) {
        _this.uploadedFiles = null;
      }
      inputFiles.each((i, input) => {
        $(input).on('change', (e) => {
          let _file = e.currentTarget.files[0];
          let _ext = _this.getFileExtension(_file, ['.png', '.jpg', '.jpeg', '.gif']);
          if (_file && _this.checkValidFile(_file, ['.png', '.jpg', '.jpeg', '.gif'])) {
            let _data = {
              thumbnail: _file,
              ext: _ext
            };
            Cloud.uploadStudentThumbnail.with(_data).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
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
            $(e.currentTarget).parents('.fileinput').find('.has-error').html('Validation.Message.Extension');
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
      // file = {
      //   lastModified: 1521080262000,
      //   name: "icon-clock.png",
      //   size:1882,
      //   type: "image/png",
      //   webkitRelativePath: ""
      // }
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
  //Function render FORM DATA from AJAX
  //@param {String} status Form status: add or edit
  //@param {String} datas JSON data from AJAX

  renderFormData(status, datas) {
    let _this = this;
    if (status && status === 'edit') {
      _this.formObj.attr('data-manner', 'edit');
    } else {
      _this.formObj.attr('data-manner', 'add');
    }
    if (datas) {
      //map id -> form to edit
      _this.formObj.attr('data-edit-id', datas.id);
      //Update form fields (input + textarea) base on name of field
      _.each(datas, (value, key) => {
        if (key !== 'status') {
          //Status is radiobuton -> no update
          _this.formObj.find('[name="' + key + '"]').val(value);
        } else {
          //Update status radiobutton
          if (value == 1) {
            _this.formObj.find('#statusActive')[0].checked = true;
            _this.formObj.find('#statusDraft')[0].checked = false;
          } else {
            _this.formObj.find('#statusActive')[0].checked = false;
            _this.formObj.find('#statusDraft')[0].checked = true;
          }
        }
      });

      //Handle static data like title, headline, button when change from add to edit and otherwise
      //reset form validator
      if (status === 'edit') {
        _this.headline.text(_this.messages.headlineUpdate);
        _this.alert.html(_this.messages.editSuccess);
        _this.btnSubmit.text(_this.messages.update);
      } else {
        _this.headline.text(_this.messages.headlineAdd);
        _this.alert.html(_this.messages.addSuccess);
        _this.btnSubmit.text(_this.messages.add);
      }
    }
  }

	initSelect2() {
		$(".multiChoose").select2();
	}

}

