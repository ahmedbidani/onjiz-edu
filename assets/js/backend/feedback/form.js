class IndexFormFeedbackBackendEKP extends BaseBackendEKP {
	constructor() {
		super();
		this.initialize();
	}

	initialize() {
		//DO NOT LOAD UNNESSESARY CLASS
		//Init form + list if page have BOTH
		this.form = new FormIndexFeedbackBackendEKP(this);
	}
}

class FormIndexFeedbackBackendEKP {
	constructor(opts) {
		_.extend(this, opts);
		this.formId = 'formFeedback';
		this.formObj = $('#' + this.formId);

		this.headline = this.formObj.find('.panel-title');
		this.alert = this.formObj.find('.alert');
		this.initialize();
	}

	initialize() {
		let _this = this;
		//_this.initUploadFile();
		_this.initValidation();
		_this.handleCmtActions();
	}

	initValidation() {
		let _this = this;
		let _options = {
			framework: 'bootstrap4',
			button: {
				selector: '#btnFeedback',
				disabled: 'disabled'
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
		};
		//init
		_this.formObj
			.formValidation(_options)
			//on valid
			.on('success.form.fv', e => {
				// Prevent form submission
				e.preventDefault();
				console.log('----- FORM ALBUM ----- [SUBMIT][START]');

				let formData = _this.formObj.serializeArray();
				let tmpData = {};
				_.each(formData, item => {
					if (item.name === 'idFeedback') {
						tmpData.id = item.value;
					} else {
						tmpData[item.name] = item.value;
					}
				});

        Cloud.editFeedback.with(tmpData).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
          if (err) {
            console.log(err);
            return;
          } else if (responseBody) {
            swal({
              title: this.messages.sendSuccessfully,
              icon: 'success',
              button: {
                text: this.messages.continue,
                value: true,
                visible: true,
                className: "btn btn-primary"
              }
            }).then((value) => {
              //THEN RELOAD PAGE IF NEEDED
              location.reload();
            })
          }
        })
				console.log('----- FORM FOOD ----- [SUBMIT][END]');
			});
	}

	initUploadFile() {
		let _this = this;
		let messages = _this.messages;
		//init upload
		if (typeof (MediaUpload) != 'undefined') {
			this.mediaUploadModel = new MediaUpload({
				url: '/api/v1/backend/media/uploadThumbnail',
				method: 'POST',
				inputEl: $('#formMedia #inputUpload'),
				formEl: $('#formMedia'),
				messages: messages
			});
			$('#addNewMedia').on('select.btn.clicked', () => {
				this.selectedMedias = this.mediaUploadModel.getSelectedMedias();
				//reset upload modal
				this.mediaUploadModel.resetAll();
			});
		}
	}

	handleCmtActions() {
    let _this = this;
    //ONCLICK EDIT LINK
    // ONCLICK REMOVE (TRASH) LINK
    _this.formObj.on('click', '.remove-row', function (e) {
			let id = $(this).attr('data-id');
			let indexCmt = $(this).attr('data-index-cmt');
			let objFeedback = { id: id, indexCmt: indexCmt };
      _this.initSweetAlert(objFeedback);
    });
	}

	initSweetAlert(objFeedback) {
    swal({
      title: this.messages.deletePopup,
      icon: 'warning',
      cancelButtonColor: '#ff4081',
      buttons: {
        cancel: {
          text: this.messages.cancel,
          value: null,
          visible: true,
          className: "btn btn-danger",
          closeModal: true,
        },
        confirm: {
          text: "OK",
          value: true,
          visible: true,
          className: "btn btn-primary",
          closeModal: true
        }
      }
    }).then((value) => {
      if (value) {
        Cloud.editFeedback.with({ id: objFeedback.id, message: objFeedback.message,  _csrf: $('[name="_csrf"]').val() }).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
          if (err) {
            console.log(err);
            return;
          } else if (responseBody) {
            swal({
              title: this.messages.deleteSuccessfully,
              icon: 'success',
              button: {
                text: this.messages.continue,
                value: true,
                visible: true,
                className: "btn btn-primary"
              }
            }).then((value) => {
              //THEN RELOAD PAGE IF NEEDED
              location.reload();
            })
          }
        })
      }
    });
  }
}
