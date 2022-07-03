class IndexAccountSABackendEKP {
    constructor() {
      this.initialize();
    }
  
    initialize() {
      this.form = new FormAccountSABackendEKP(this);
    }
  }
  
  class FormAccountSABackendEKP {
    constructor(opts) {
      _.extend(this, opts);
  
      this.formId = 'formSA';
      this.formObj = $('#' + this.formId);
  
      this.headline = this.formObj.find('.panel-title');
      this.alert = this.formObj.find('.alert');
      this.btnSubmit = this.formObj.find('button[type="submit"]');
      this.btnReset = this.formObj.find('button[type="reset"]');
  
      this.initialize();
    }
  
    initialize() {
      let _this = this;
      _this.initValidation();
    }
  
    initValidation() {
      let _this = this;
      _this.formObj.formValidation({
        button: {
          selector: '#btnFormSA',
          disabled: 'disabled'
        },
        fields: {
          password: {
            validators: {
            }
          },
          passwordConfirm: {
            validators: {
              identical: {
                compare: function () {
                  return form.querySelector('[name="password"]').value;
                },
                message: 'The password and its confirm are not the same'
              }
            }
          },
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
          console.log('----- FORM SA ----- [SUBMIT][START]');
          let $form = $(e.target);
          let formData = $form.serializeArray();
          let tmpData = {};
          _.each(formData, (item) => {
            tmpData[item.name] = item.value;
          });
  
          //reset form validator
          Cloud.registerSA.with(tmpData).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
            if (responseBody.code && responseBody.code == 'PASSWORD_IS_NOT_MATCH') {
              _this.alert.removeClass('hidden alert-success').addClass("alert-danger").html(responseBody.message);
              return;
            } else if (err) {
              _this.alert.removeClass('hidden alert-success').addClass("alert-danger").html(_this.messages.error);
              return;
            } else {
              // _this.alert.removeClass('hidden alert-danger').addClass("alert-success").html(_this.messages.editSuccess);
              location.href = '/backend/login';
            }
          });
  
          console.log('----- FORM SA ----- [SUBMIT][END]');
        });
    }
  }