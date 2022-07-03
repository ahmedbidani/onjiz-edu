class IndexFormImportBackendEKP extends BaseBackendEKP {
    constructor() {
      super( );
      this.initialize();
    }
  
    initialize() {
      //DO NOT LOAD UNNESSESARY CLASS
      //Init form + list if page have BOTH  
      this.form = new FormIndexImportBackendEKP(this);
    }
  }
  
  class FormIndexImportBackendEKP {
    constructor(opts) {
      _.extend(this, opts);
      this.formId = 'formImport';
      this.formObj = $('#' + this.formId);
      this.headline = this.formObj.closest('.panel').find('.panel-title');
      this.alert = this.formObj.closest('.panel').find('.alert');
      this.btnSubmit = this.formObj.find('button[type="submit"]');
      this.btnReset = this.formObj.find('button[type="reset"]');
      this.initialize();
    }
  
    initialize() {
      let _this = this;
      _this.initUploadFile();
    }
  
    initUploadFile() {
      
      let _this = this;
      let _classObj = _this.formObj.attr('data-class');
      let inputFiles = _this.formObj.find('[type=file]');
      if (inputFiles.length) {
        if (_this.uploadedFiles == undefined) {
          _this.uploadedFiles = {};
        }
        let value = $('input').val();
        inputFiles.each((i, input) => {
          $(input).on('change', (e) => {
            let _file = e.currentTarget.files[0];
            let _data = {
              file: _file,
              classObj: _classObj,
              _csrf: $('[name="_csrf"]').val()
            }
            Cloud.importStudentExcel.with(_data).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
                  if (err) {
                    console.log(err);
                    let title = _this.messages.cannotImport;
                    if (err.responseInfo.body.code == 'STUDENT_ERROR_IMPORT') title = _this.messages.error + ', ' + err.responseInfo.body.message;
                    swal({
                      title: title,
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
                  } else {
                    //save thumb data to object uploadedFiles
                    console.log(responseBody);
                    _this.uploadedFiles = responseBody;
                    swal({
                      title: _this.messages.importSuccessfully,
                      icon: 'success',
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
            })    
          });
        });
      }
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
        //End handle static data
      }
    }
  }
  
  