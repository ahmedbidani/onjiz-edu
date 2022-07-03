class IndexAccountFrontendEKP extends BaseBackendEKP {
    constructor() {
      super();
      this.initialize();
    }
  
    initialize() {
      //DO NOT LOAD UNNESSESARY CLASS
      //Init form + list if page have BOTH  
      this.form = new AccountFrontendEKP(this);
    }
  }
  
  class AccountFrontendEKP {
    constructor(opts) {
      _.extend(this, opts);

      this.formId = 'formAccount';
		  this.formObj = $('#' + this.formId);
			this.alert = this.formObj.find('.alert');
      this.initialize();
    }
  
    initialize() {
      let _this = this;
      _this.initValidation();
    }

    initValidation() {
		  let _this = this;
		  let _options = {
			framework: 'bootstrap4',
			button: {
				selector: '#btnFormAccount',
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
			}
		};
		_this.formObj
		.formValidation(_options)
		.on('success.form.fv', function (e) {
			// Prevent form submission
			e.preventDefault();
			console.log('----- FORM ACCOUNT ----- [SUBMIT][START]');
			let $form = $(e.target);
			let formData = $form.serializeArray();
			let tmpData = {};
			_.each(formData, (item) => {
                tmpData[item.name] = item.value;
				//prepare upload data
				if (_this.uploadedFiles) {
					tmpData['thumbnail'] = _this.uploadedFiles;
				}
			});
			let manner = _this.formObj.attr('data-manner');

			//prepare upload data
			if (_this.uploadedAvatar) {
				tmpData['avatar'] = _this.uploadedAvatar;
			}

			//reset form validator
			if (manner === 'edit') {
				Cloud.editProfile.with(tmpData).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
					if (err) {
						if(responseBody.message){
							_this.alert.removeClass('hidden alert-success').addClass("alert-danger").html(responseBody.message);
            }
            console.log(err);
            return;
          } else if (responseBody) {
						if(responseBody.message){
							_this.alert.removeClass('hidden alert-success').addClass("alert-danger").html(responseBody.message);
						} else {
								_this.alert.removeClass('hidden alert-danger').addClass("alert-success").html(_this.messages.editSuccess);
						}
				  }
					//cloud success
				});
			} 
			//THEN RELOAD TABLE IF NEEDED 
			// window.curBackendEKP.list.initDataTable();
			// window.location.reload();
			console.log('----- FORM ACCOUNT ----- [SUBMIT][END]');
		});
  } 
}