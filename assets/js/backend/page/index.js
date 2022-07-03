class IndexFormPageBackendEKP extends BaseBackendEKP {
  constructor() {
    super();
    this.initialize();
  }

  initialize() {
    //DO NOT LOAD UNNESSESARY CLASS
    //Init form + list if page have BOTH  
    this.form = new FormIndexPageBackendEKP(this);
  }
}

class FormIndexPageBackendEKP {
  constructor(opts) {
    _.extend(this, opts);
    this.formId = 'formPage';
    this.formObj = $('#' + this.formId);

    this.headline = this.formObj.find('.card-title');
    this.alert = this.formObj.find('.alert'); 
    this.btnSubmit = this.formObj.find('button[type="submit"]');
    this.btnReset = this.formObj.find('button[type="reset"]');
    this.editorInstance = $('#description').summernote({
      tabsize: 2,
      height: 100
    });

    this.initialize();
  }

  initialize() {
    let _this = this;
    _this.initUploadFile();
    _this.initValidation();
    _this.initEditorPostForm();
    $('.js-process-basic-multiple').select2();
  }

  initForm() {
    let _this = this;
  }
  
  initEditorPostForm = function () {
    if ($('#editorDescription').length > 0) {
      $('#editorDescription').summernote({
        height: 200, // set editor height
        minHeight: null, // set minimum height of editor
        maxHeight: null, // set maximum height of editor
        focus: true // set focus to editable area after initializing summernote
      });
    }
  }
  initValidation() {
    let _this = this;
    let manner = _this.formObj.attr('data-manner');
    if (manner != 'edit') {
      _this.renderSeoAttributes();
    }
    _this.formObj.formValidation({
      button: {
        selector: '#btnFormPage',
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
    })
      .on('success.form.fv', function (e) {
        // Prevent form submission
        e.preventDefault();
        console.log('----- FORM POST ----- [SUBMIT][START]');
        let $form = $(e.target);
        let formData = $form.serializeArray();
        let tmpData = {};
        _.each(formData, (item) => {
          if (item.name == 'categories' || item.name == 'tags') {
            if (tmpData[item.name] == undefined) {
              tmpData[item.name] = [item.value];
            } else if (item.value != '') {
              tmpData[item.name].push(item.value);
            }
          } else {
            tmpData[item.name] = item.value;
          }
        });
        //prepare upload data
        if (_this.uploadedFiles) {
          tmpData['thumbnail'] = _this.uploadedFiles;
        }
        //reset form validator
        if (manner === 'edit') {
          tmpData.id = _this.formObj.attr('data-edit-id');
          Cloud.editPost.with(tmpData).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
            if (err) {
              if (err.responseInfo.statusCode == 400) {
                _this.alert.removeClass('hidden alert-success').addClass("alert-danger").html(responseBody.message);
              } else {
                _this.alert.removeClass('hidden alert-success').addClass("alert-danger").html(_this.messages.error);
              }
              return;
            } else {
              _this.alert.removeClass('hidden alert-danger').addClass("alert-success").html(_this.messages.editSuccess);
            }
          });
        } else {
          Cloud.addPost.with(tmpData).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
            if (err) {
              if (err.responseInfo.statusCode == 400) {
                _this.alert.removeClass('hidden alert-success').addClass("alert-danger").html(responseBody.message);
              } else {
                _this.alert.removeClass('hidden alert-success').addClass("alert-danger").html(_this.messages.error);
              }
              return;
            } else {
              $('.alert').removeClass('hidden alert-danger').addClass("alert-success").html(_this.messages.addSuccess);
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
            Cloud.uploadPostThumbnail.with(_data).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
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
      //End handle static data
    }
  }

  renderSeoAttributes() {
    $('#title').on('input', function (e) {
      var title = $('#title').val();
      $("#metaTitle").val(title);
    });

    $('#description').on('input', function (e) {
      var description = $('#description').val();
      $("#metaDescription").val(description);
    });
  }


}

