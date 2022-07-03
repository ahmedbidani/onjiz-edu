class IndexUserBackendEKP extends BaseBackendEKP {
	constructor() {
		super();
		this.initialize();
	}

	initialize() {
		//DO NOT LOAD UNNESSESARY CLASS
		//Init form + list if page have BOTH  
		this.form = new FormIndexUserBackendEKP(this);
		
	}
}

class FormIndexUserBackendEKP {
	constructor(opts) {
		_.extend(this, opts);

		// this.elId = 'thumbnail';
		// this.frm = $('#' + this.elId);

		this.formId = 'formUser';
		this.formObj = $('#' + this.formId);
		if (this.formObj.length) {
			this.headline = this.formObj.find('.panel-title');
			this.alert = this.formObj.find('.alert');
			this.btnSubmit = this.formObj.find('button[type="submit"]');
			this.btnReset = this.formObj.find('button[type="reset"]');

			this.initialize();
		}

	}
	initialize() {
		let _this = this;
		_this.initUploadFile();
		_this.initValidation();
    _this.initEditorPostForm();
		$('.js-process-basic-multiple').select2();
	}
  
  initEditorPostForm = function () {
    if ($('#editorDescription').length > 0) {
      $('#editorDescription').summernote({
        height: 100, // set editor height
        minHeight: null, // set minimum height of editor
        maxHeight: null, // set maximum height of editor
        focus: true // set focus to editable area after initializing summernote
      });
    }
  }
	
	initValidation() {
		let _this = this;
		let _options = {
			framework: 'bootstrap4',
			button: {
				selector: '#btnFormUser',
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
			}
		};
		_this.formObj
		.formValidation(_options)
		.on('success.form.fv', function (e) {
			// Prevent form submission
			e.preventDefault();
			console.log('----- FORM USER ----- [SUBMIT][START]');
			let $form = $(e.target);
			let formData = $form.serializeArray();
			let tmpData = {};
			_.each(formData, (item) => {
				if (item.name == 'classes' || item.name == 'parents' || item.name == 'subjects') {
					if (tmpData[item.name] == undefined) {
						tmpData[item.name] = [item.value];
					} else if (item.value != '') {
						tmpData[item.name].push(item.value);
					}
				} else if (item.name == 'role') { 
					tmpData.role = $('#role').val();
				}else {
					tmpData[item.name] = item.value;
				}
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
				Cloud.editUser.with(tmpData).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
					if (err) {
						if(responseBody.message)
						  {
							// swal({
							// 	title: responseBody.message,
							// 	icon: 'error',
							// 	button: {
							// 	  text: _this.messages.error,
							// 	  value: true,
							// 	  visible: true,
							// 	  className: "btn btn-primary"
							// 	}
							//   }).then((value) => {
							// 	//THEN RELOAD PAGE IF NEEDED 
							//   })
							_this.alert.removeClass('hidden alert-success').addClass("alert-danger").html(responseBody.message);
						  }
						console.log(err);
						return;
					  } else if (responseBody) {
						if(responseBody.message)
						{
						  // swal({
							//   title: responseBody.message,
							//   icon: 'warning',
							//   button: {
							// 	text: _this.messages.error,
							// 	value: true,
							// 	visible: true,
							// 	className: "btn btn-primary"
							//   }
							// }).then((value) => {
							//   //THEN RELOAD PAGE IF NEEDED 
							// })
							_this.alert.removeClass('hidden alert-success').addClass("alert-danger").html(responseBody.message);
						}else{
							  // swal({
								// title: 'Cập nhật thành công !',
								// icon: 'success',
								// button: {
							 	// text: this.messages.continue,
							  // 	value: true,
							  // 	visible: true,
							  // 	className: "btn btn-primary"
								// }
							  // }).then((value) => {
								// //THEN RELOAD PAGE IF NEEDED 
								// window.location.replace('/backend/user')
							  // })
								_this.alert.removeClass('hidden alert-danger').addClass("alert-success").html(_this.messages.editSuccess);
						}
				  }
					//cloud success
				});
			} else {
				Cloud.addUser.with(tmpData).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
					if (err) {
						if(responseBody.message)
						  {
							// swal({
							// 	title: responseBody.message,
							// 	icon: 'error',
							// 	button: {
							// 	  text: _this.messages.error,
							// 	  value: true,
							// 	  visible: true,
							// 	  className: "btn btn-primary"
							// 	}
							//   }).then((value) => {
							// 	//THEN RELOAD PAGE IF NEEDED 
							//   })
							_this.alert.removeClass('hidden alert-success').addClass("alert-danger").html(responseBody.message);
						  }
						console.log(err);
						return;
					  } else if (responseBody) {
						  if(responseBody.message)
						  {
							// swal({
							// 	title: responseBody.message,
							// 	icon: 'warning',
							// 	button: {
							// 	  text: _this.messages.error,
							// 	  value: true,
							// 	  visible: true,
							// 	  className: "btn btn-primary"
							// 	}
							//   }).then((value) => {
							// 	//THEN RELOAD PAGE IF NEEDED 
							//   })
							_this.alert.removeClass('hidden alert-success').addClass("alert-danger").html(responseBody.message);
						  }else{
								// swal({
						  	// 	title: 'Thêm mới thành công !',
						  	// 	icon: 'success',
						  	// 	button: {
								// text: this.messages.continue,
								// value: true,
								// visible: true,
								// className: "btn btn-primary"
						  	// 	}
								// }).then((value) => {
						  	// 	//THEN RELOAD PAGE IF NEEDED 
						 		//  window.location.replace('/backend/user')
								// })
								_this.alert.removeClass('hidden alert-danger').addClass("alert-success").html(_this.messages.addSuccess);
					  	}
					}
					//cloud success
				});


			}
			//THEN RELOAD TABLE IF NEEDED 
			// window.curBackendEKP.list.initDataTable();
			console.log('----- FORM User ----- [SUBMIT][END]');
		});
	}

	initUploadFile() {
		$('.dropify').dropify();
		let _this = this;

		let inputFiles = _this.formObj.find('[type=file]');
		if (inputFiles.length) {
			if (_this.uploadedAvatar == undefined) {
				_this.uploadedAvatar = "";
			}
			inputFiles.each((i, input) => {
				$(input).on('change', (e) => {
					let _file = e.currentTarget.files[0];
					let _ext = _this.getFileExtension(_file, UPLOAD.EXTENSION);
					if (_file && _this.checkValidFile(_file, UPLOAD.EXTENSION)) {
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
							//save thumb data to object uploadedAvatar
							console.log(responseBody);
							_this.uploadedAvatar = responseBody;
							
						})
						let _input = $(e.currentTarget);
						_input.parents('.fileinput').parent().prev().addClass('loading');
					} else if (_file != undefined) {
						$(e.currentTarget).parents('.fileinput').find('.has-error').html('error file extension');
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