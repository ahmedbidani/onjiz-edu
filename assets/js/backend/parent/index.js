class FormIndexParentBackendEKP extends BaseBackendEKP {
  constructor(opts) {
    super();
    _.extend(this, opts);

    // this.elId = 'thumbnail';
    // this.frm = $('#' + this.elId);

    this.formId = 'formParent';
    this.formObj = $('#' + this.formId);
    if (this.formObj.length) {
      this.headline = this.formObj.find('.panel-title');
      this.alert = this.formObj.find('.alert');
      this.btnSubmit = this.formObj.find('button[type="submit"]');
      this.btnReset = this.formObj.find('button[type="reset"]');

      //set read only for student feild
      $('.js-process-basic-multiple').select2({ disabled: 'readonly' });

      this.initialize();
    }

  }
  initialize() {
    let _this = this;
    //_this.initUploadFileExcel();
    _this.initUploadFile();
    _this.initUpload();
    _this.initValidation();
    $('.js-process-basic-multiple').select2();
  }

  initForm() {
    let _this = this;
  }

  initValidation() {
    let _this = this;
    _this.formObj.formValidation({
      button: {
        selector: '#btnFormParent',
        disabled: 'disabled'
      },
      fields: {
        //Can combine both html5 mode and js mode
        //Refer: http://formvalidation.io/examples/attribute/
        /*alias: {
          validators: {
            notEmpty: {
              message: 'The title is required and cannot be empty'
            }
          }
        },*/
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
        console.log('----- FORM USER ----- [SUBMIT][START]');
        let $form = $(e.target);
        let formData = $form.serializeArray();
        let tmpData = {};
        _.each(formData, (item) => {
          if (item.name == 'classes' || item.name == 'students') {
            if (tmpData[item.name] == undefined) {
              tmpData[item.name] = [item.value];
            } else if (item.value != '') {
              tmpData[item.name].push(item.value);
            }
          } else {
            tmpData[item.name] = item.value;
          }
          //prepare upload data
          if (_this.uploadedFiles) {
            tmpData['thumbnail'] = _this.uploadedFiles;
          }
        });
        let manner = _this.formObj.attr('data-manner');

        //prepare upload data
        if (_this.uploadedFiles) {
          tmpData['avatar'] = _this.uploadedFiles;
        }

        //reset form validator
        if (manner === 'edit') {
          Cloud.editParent.with(tmpData).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
            if (responseBody.code && responseBody.code == 'PARENT_PASSWORD_IS_NOT_MATCH') {
              _this.alert.removeClass('hidden alert-success').addClass("alert-danger").html(responseBody.message);
              return;
            } else if (err) {
              _this.alert.removeClass('hidden alert-success').addClass("alert-danger").html(_this.messages.error);
              return;
            } else {
              if (responseBody.code && responseBody.code == 'E010') {
                _this.alert.removeClass('hidden alert-success').addClass("alert-danger").html(responseBody.message);
                return;
              } else if (responseBody.code && responseBody.code == 'E011') {
                _this.alert.removeClass('hidden alert-danger').addClass("alert-danger").html(responseBody.message);
                return;
              } else if (responseBody.code && responseBody.code == 'E012') {
                _this.alert.removeClass('hidden alert-danger').addClass("alert-danger").html(responseBody.message);
                return;
              }
              _this.alert.removeClass('hidden alert-danger').addClass("alert-success").html(_this.messages.editSuccess);
            }
            //cloud success
          });
        } else {
          Cloud.addParent.with(tmpData).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
            if (responseBody.code && responseBody.code == 'PARENT_PASSWORD_IS_NOT_MATCH') {
              _this.alert.removeClass('hidden alert-success').addClass("alert-danger").html(responseBody.message);
              return;
            } else if (responseBody.code && responseBody.code == 'USER_IS_EXISTED') {
              _this.alert.removeClass('hidden alert-danger').addClass("alert-danger").html(responseBody.message);
              return;
            } else if (responseBody.code && responseBody.code == 'EMAIL_IS_EXISTED') {
              _this.alert.removeClass('hidden alert-danger').addClass("aler-danger").html(responseBody.message);
              return;
            } else if (err) {
              _this.alert.removeClass('hidden alert-success').addClass("alert-danger").html(_this.messages.error);
              return;
            } else {
              if (responseBody.code && responseBody.code == 'E010') {
                _this.alert.removeClass('hidden alert-success').addClass("alert-danger").html(responseBody.message);
                return;
              } else if (responseBody.code && responseBody.code == 'E011') {
                _this.alert.removeClass('hidden alert-danger').addClass("alert-danger").html(responseBody.message);
                return;
              } else if (responseBody.code && responseBody.code == 'E012') {
                _this.alert.removeClass('hidden alert-danger').addClass("alert-danger").html(responseBody.message);
                return;
              }

              _this.alert.removeClass('hidden alert-danger').addClass("alert-success").html(_this.messages.addSuccess);
            }
            //cloud success
          });


        }
        //THEN RELOAD TABLE IF NEEDED
        // window.curBackendEKP.list.initDataTable();
        console.log('----- FORM Parent ----- [SUBMIT][END]');
      });
  }
  // initUploadFileExcel() {
  //   // $(document).ready(function () {
  //   //   $('input[type="file"]').click(function () {
  //   //     var demovalue = $(this).val();

  //   //   });
  //   // })
  //   let _this = this;
  //   let inputFiles = _this.formObj.find('[type=file]');
  //   if (inputFiles.length) {
  //     if (_this.uploadedFiles == undefined) {
  //       _this.uploadedFiles = {};
  //     }
  //     inputFiles.each((i, input) => {
  //       $(input).on('change', (e) => {
  //         let _file = e.currentTarget.files[0];
  //         let _data = {
  //           file: _file
  //         }
  //         Cloud.importParentExcel.with(_data).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
  //           if (err) {
  //             console.log(err);
  //             //_this.error.removeClass('hidden');
  //             return;
  //           }
  //           //save thumb data to object uploadedFiles
  //           console.log(responseBody);
  //           _this.uploadedFiles = responseBody;

  //         })
  //         window.location.replace('/backend/student')
  //       });
  //     });
  //   }
  // }

  initUpload() {
    $('.dropify').dropify();
  }
  initUploadFile() {
    let _this = this;

    let inputFiles = _this.formObj.find('[type=file]');
    if (inputFiles.length) {
      if (_this.uploadedFiles == undefined) {
        _this.uploadedFiles = '';
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
            Cloud.uploadParentThumbnail.with(_data).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
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
              console.log('responseBody', responseBody);
              _this.uploadedFiles = responseBody;

            })
            let _input = $(e.currentTarget);
            _input.parents('.fileinput').parent().prev().addClass('loading');
          } else if (_file != undefined) {
            $(e.currentTarget).parents('.fileinput').find('.has-error').html('Undefined.');
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
      _this.formObj.attr('data-id', datas.id);
      //Update form fields (input + textarea) base on name of field
      _.each(datas, (value, key) => {
        if (key !== 'status') {
          //Status is radiobuton -> no update
          _this.formObj.find('[name="' + key + '"]').val(value);
          if (key === 'students') {
            _.forEach(value, element => {
              _this.formObj.find('[name="' + key + '"] option[value="' + element.id + '"]').prop('selected', true);
            })
          }
        } else {
          //Update status radiobutton
          if (value == 1) {
            _this.formObj.find('#statusActive')[0].checked = true;
            _this.formObj.find('#statusDraft')[0].checked = false;
            _this.formObj.find('#statusTrash')[0].checked = false;
          } else if (value == 0) {
            _this.formObj.find('#statusActive')[0].checked = false;
            _this.formObj.find('#statusDraft')[0].checked = true;
            _this.formObj.find('#statusTrash')[0].checked = false;
          } else {
            _this.formObj.find('#statusActive')[0].checked = false;
            _this.formObj.find('#statusDraft')[0].checked = false;
            _this.formObj.find('#statusTrash')[0].checked = true;
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

}
