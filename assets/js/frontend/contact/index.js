class IndexContactFrontendEKP extends BaseBackendEKP {
  constructor() {
    super();
    this.initialize();
  }

  initialize() {
    //DO NOT LOAD UNNESSESARY CLASS
    //Init form + list if page have BOTH  
    this.form = new FormIndexContactFrontEnd(this);
  }
}

class FormIndexContactFrontEnd {
  constructor(opts) {
    _.extend(this, opts);
    this.formId = 'formContact';
    this.formObj = $('#' + this.formId);
    this.alert = this.formObj.find('.alert');
    this.btnSubmit = this.formObj.find('button[type="submit"]');

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
        selector: '#btnFormContact',
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
        e.preventDefault();
        console.log('FORM can submit OK');
      }
    })
      .on('success.form.fv', function (e) {
        // Prevent form submission
        e.preventDefault();
        console.log('----- FORM CONTACT ----- [SUBMIT][START]');
        let $form = $(e.target);
        let formData = $form.serializeArray();
        let tmpData = {};
        _.each(formData, (item) => {
          tmpData[item.name] = item.value;
        });
        Cloud.sendMessage.with(tmpData).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
          if (err) {
            if (responseBody.message) {
              _this.alert.removeClass('hidden').addClass("alert-warning").html(responseBody.message);
              setTimeout(function () {
                _this.alert.removeClass('alert-warning').addClass("hidden");
              }, 3000);
              return;
            } else {
              _this.alert.removeClass('hidden').addClass("alert-danger").html(_this.messages.sendMessageFail);
              setTimeout(function () {
                _this.alert.removeClass('alert-danger').addClass("hidden");
              }, 3000);
              return;
            }
          } else {
            _this.alert.removeClass('hidden').addClass("alert-success").html(_this.messages.sendMessageSuccessfully);
            setTimeout(function () {
              _this.alert.removeClass('alert-success').addClass("hidden");
            }, 5000);
            //redirect to home
            //window.location.href = '/';
          }
          //cloud success
        });
        //THEN RELOAD TABLE IF NEEDED 
        console.log('----- FORM CONTACT ----- [SUBMIT][END]');
      });
  }
}