class IndexProfileBackendEKP extends BaseBackendEKP {
  constructor() {
    super();
    this.initialize();
  }

  initialize() {
    this.form = new FormIndexProfileBackendEKP(this);
  }
}

class FormIndexProfileBackendEKP {
  constructor(opts) {
    _.extend(this, opts);

    this.elId = 'thumbnail';
    this.frm = $('#' + this.elId);

    this.formId = 'formProfile';
    this.formObj = $('#' + this.formId);

    this.headline = this.formObj.find('.panel-title');
    this.alert = this.formObj.find('.alert');
    this.btnSubmit = this.formObj.find('button[type="submit"]');
    this.btnReset = this.formObj.find('button[type="reset"]');
    this.btnImage = this.frm.find('button[type=submit]');

    this.initialize();
  }

  initialize() {
    let _this = this;
    _this.initValidation();
    _this.initUploadFile();
    _this.initUpload();
  }

  initForm() {
    let _this = this;
  }

  initValidation() {
    let _this = this;
    _this.formObj.formValidation({
      button: {
       selector: '#btnFormProfile',
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
        console.log('----- FORM PROFILE ----- [SUBMIT][START]');
        let $form = $(e.target);
        let formData = $form.serializeArray();
        let tmpData = {};
        _.each(formData, (item) => {
          tmpData[item.name] = item.value;
        });
        //prepare upload data
        if (_this.uploadedFiles) {
          tmpData['avatar'] = _this.uploadedFiles;
        }

        //reset form validator
        tmpData.id = _this.formObj.attr('data-id');
        Cloud.editUser.with(tmpData).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
          if (responseBody.code && responseBody.code == 'PASSWORD_IS_NOT_MATCH') {
            _this.alert.removeClass('hidden alert-success').addClass("alert-danger").html(responseBody.message);
            return;
          } else if (err) {
            _this.alert.removeClass('hidden alert-success').addClass("alert-danger").html(_this.messages.error);
            return;
          } else {
            _this.alert.removeClass('hidden alert-danger').addClass("alert-success").html(_this.messages.editSuccess);
          }
        });

        //THEN RELOAD TABLE IF NEEDED
        //window.curBackendEKP.list.initDataTable();
        console.log('----- FORM User ----- [SUBMIT][END]');
      });
  }
  initUpload() {
    $('.dropify').dropify();
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
              ext: _ext,
              _csrf: $('[name="_csrf"]').val()
            };
            Cloud.uploadThumbnail.with(_data).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
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
}



// parasails.registerPage('edit-profile', {
//   //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
//   //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
//   //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
//   data: {

//     // Main syncing/loading state for this page.
//     syncing: false,

//     // Form data
//     formData: { /* … */ },

//     // For tracking client-side validation errors in our form.
//     // > Has property set to `true` for each invalid property in `formData`.
//     formErrors: { /* … */ },

//     // Server error state for the form
//     cloudError: '',

//   },

//   //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
//   //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
//   //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
//   beforeMount: function() {
//     // Attach raw data exposed by the server.
//     _.extend(this, SAILS_LOCALS);

//     // Set the form data.
//     this.formData.fullName = this.me.fullName;
//     this.formData.emailAddress = this.me.emailChangeCandidate ? this.me.emailChangeCandidate : this.me.emailAddress;
//   },

//   //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
//   //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
//   //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
//   methods: {

//     submittedForm: function() {

//       // Redirect to the account page on success.
//       // > (Note that we re-enable the syncing state here.  This is on purpose--
//       // > to make sure the spinner stays there until the page navigation finishes.)
//       this.syncing = true;
//       window.location = '/account';

//     },

//     handleParsingForm: function() {

//       // Clear out any pre-existing error messages.
//       this.formErrors = {};

//       var argins = this.formData;

//       // Validate name:
//       if(!argins.fullName) {
//         this.formErrors.password = true;
//       }

//       // Validate email:
//       if(!argins.emailAddress) {
//         this.formErrors.emailAddress = true;
//       }

//       // If there were any issues, they've already now been communicated to the user,
//       // so simply return undefined.  (This signifies that the submission should be
//       // cancelled.)
//       if (Object.keys(this.formErrors).length > 0) {
//         return;
//       }

//       return argins;
//     },

//   }
// });
