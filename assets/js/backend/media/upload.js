
class MediaUpload extends BaseBackendEKP {
	constructor(opts) {
		super();
		//private
		this.inputEl = opts.inputEl;
		this.formEl = opts.formEl;
		this.url = opts.url;
		this.method = opts.method;
		this.messages = opts.messages;
		this.dropZone = this.formEl.find('.upload-zone');
		this.filesContainer = this.formEl.find('.file-list');
		this.selectedMedias = [];
		this.arrayMedias = [];
        // this.hasNewFileUploaded = false;
        this.text = {
            AGO: 'ago',
            TIME: {
                DAY: 'day',
                HOUR: 'hour',
                MINUTE: 'minute',
                SECOND: 'second'
            }
		}
		this.mediaPage = 1;
		this.isSystemTabOpen = false;
		//init components
		this.initialize();
	}
	initialize() {
		this.initStartMedias();
		this.initTabEvents();
		this.initUploadFileWidget();
		this.initActions();
		this.initLoadMore();
		this.initHeightScrollbar();
	}
	
	initStartMedias() {
		var photoIds = $( "input[name=photos]" ).val();
		if(photoIds.length) {
			this.selectedMedias = photoIds.split(',');
		}
		console.log(this.selectedMedias);
	}
    //Component
	initTabEvents() {
		this.formEl.find('a[data-toggle="tab"]').on('shown.bs.tab', (e) => {
			// e.target // newly activated tab
			// e.relatedTarget // previous active tab
			if ($(e.target).attr('aria-controls') === 'fromComputer') {
				this.formEl.find('#btn-upload-all').show();
				this.formEl.find('#btn-select').hide();
			} else if ($(e.target).attr('aria-controls') === 'fromSystem') {
				this.formEl.find('#btn-upload-all').hide();
                this.formEl.find('#btn-select').show();
								//get list medias
				if (!this.isSystemTabOpen) {
					this.reloadListMedia(this.mediaPage);
				}
				this.isSystemTabOpen = true;
			}
		});
	}

	initLoadMore() {
		$('#mediaLoadMore').click(() => {
			this.mediaPage += 1;
			this.reloadListMedia(this.mediaPage);
		})
	}

	initHeightScrollbar() {
    $('.js-height-scrollbar').perfectScrollbar();
	}
	
	initUploadFileWidget() {
		let _this = this;
		// Example File Upload
		// -------------------
		this.formEl.fileupload({
			url: this.url,
			type: this.method,
			dropzone: this.dropZone,
			filesContainer: this.filesContainer,
			uploadTemplateId: false,
			downloadTemplateId: false,
			replaceFileInput: false,
			uploadTemplate: tmpl(
				'{% for (let i=0, file; file=o.files[i]; i++) { %}' +
				'<div class="file-item-wrap template-upload fade col-lg-3 col-md-4 col-sm-6 {%=file.type.search("image") !== -1? "image" : "other-file"%}">' +
				'<div class="file-item">' +
				'<div class="preview vertical-align">' +
				'<div class="file-action-wrap">' +
				'<div class="file-action">' +
				'{% if (!i && !o.options.autoUpload) { %}' +
				'<i class="icon md-upload start" data-toggle="tooltip" data-original-title="Upload file" aria-hidden="true"></i>' +
				'{% } %}' +
				'{% if (!i) { %}' +
				'<i class="icon md-close cancel" data-toggle="tooltip" data-original-title="Stop upload file" aria-hidden="true"></i>' +
				'{% } %}' +
				'</div>' +
				'</div>' +
				'</div>' +
				'<div class="info-wrap">' +
				'<div class="title">{%=file.name%}</div>' +
				'</div>' +
				'<div class="progress progress-striped active" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" role="progressbar">' +
				'<div class="progress-bar progress-bar-success" style="width:0%;"></div>' +
				'</div>' +
				'</div>' +
				'</div>' +
				'{% } %}'
			),
			downloadTemplate: tmpl(
				'{% for (let i=0, file; file=o.files[i]; i++) { %}' +
				'<div class="file-item-wrap template-download fade col-lg-3 col-md-4 col-sm-6 {%=file.type.search("image") !== -1? "image" : "other-file"%}">' +
				'<div class="file-item">' +
				'<div class="preview vertical-align">' +
				'<div class="file-action-wrap">' +
				'<div class="file-action">' +
				'<i class="icon md-delete delete" data-toggle="tooltip" data-original-title="Delete files" aria-hidden="true"></i>' +
				'</div>' +
				'</div>' +
				'<img src="{%=file.url%}"/>' +
				'</div>' +
				'<div class="info-wrap">' +
				'<div class="title">{%=file.name%}</div>' +
				'</div>' +
				'</div>' +
				'</div>' +
				'{% } %}'
			),
			forceResize: true,
			previewCanvas: false,
			previewMaxWidth: false,
			previewMaxHeight: false,
			previewThumbnail: false
		})
		.on('fileuploadprocessalways', (e, data) => {
			console.log('fileuploadprocessalways');
			let length = data.files.length;
			
			for (let i = 0; i < length; i++) {
				if (!data.files[i].type.match(/^image\/(gif|jpeg|png|svg\+xml)$/)) {
					data.files[i].filetype = 'other-file';
				} else {
					data.files[i].filetype = 'image';
				}
			}
		})
		// .on('fileuploadprocessstop', (e, data) => {
		// 	console.log('fileuploadprocessstop');
		// })
		// .on('fileuploadprocess', (e, data) => {
		// 	console.log('fileuploadprocess');
		// })
		// .on('fileuploadprocessdone', (e, data) => {
		// 	console.log('fileuploadprocessdone');
		// })
		// .on('fileuploadprocessfail', (e, data) => {
		// 	console.log('fileuploadprocessfail');
		// })
		// .on('fileuploadprocessstart', (e, data) => {
		// 	console.log('fileuploadprocessstart');
		// })
		.on('fileuploadadded', (e) => {
			let $this = $(e.target);
	
			if ($this.find('.file-item-wrap').length > 0) {
				$this.addClass('has-file');
				$this.find('.file-item-wrap').removeClass('in').addClass('show');
			} else {
				$this.removeClass('has-file');
			}
		})
		.on('fileuploadfinished', (e) => {
			let $this = $(e.target);
	
			if ($this.find('.file-item-wrap').length > 0) {
				$this.addClass('has-file');
			} else {
				$this.removeClass('has-file');
			}
		})
		// .on('fileuploaddestroy', (e, data) => {
		// 	let $this = $(e.target);
		// 	console.log('fileuploaddestroy', data);
		// })
		// .on('fileuploaddestroyed', (e, data) => {
		// 	let $this = $(e.target);
	
		// 	if ($this.find('.file-item-wrap').length > 0) {
		// 		$this.addClass('has-file');
		// 	} else {
		// 		$this.removeClass('has-file');
		// 	}
		// 	console.log('fileuploaddestroyed', data);
		// })
		.on('fileuploadfail', (e, data) => {
			if (data.jqXHR && data.jqXHR.responseJSON && data.jqXHR.responseJSON.raw == "E_EXCEEDS_UPLOAD_LIMIT" || data.jqXHR && data.jqXHR.status == 500) {
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
			// window.location.reload();
			console.log('fileuploadfail', data);
			return;
		})
		// .on('fileuploadsubmit', (e, data) => {
		// 	console.log('fileuploadsubmit - data', data);
	  	// })
		.on('fileuploaddone', (e, resp) => {
			let $this = $(e.target);
			console.log('fileuploaddone - data', resp);
			if (resp.result) {
				// this.hasNewFileUploaded = true;
				//remove all file UI
				this.formEl.find('.file-item-wrap').remove();
				$this.removeClass('has-file');
                //save results
                let _rs = (resp.result.data ? resp.result.data : resp.result);
                this.selectedMedias = this.selectedMedias.concat((_rs.length > 0 ?_rs.map(item=>item.id) : []));
				//active select tab
				this.formEl.find('a[aria-controls="fromSystem"]').tab('show');
			}
		})
		.on('fileuploadchange', (e, data) => {
			console.log('fileuploadchange - data', data);
		})
		.on('click', (e) => {
			if (!$(e.target).parents('.upload-zone').length) {
                return;
            }
	
			if ($(e.target).parents('.upload-zone').find('.file-item-wrap').length === 0) {
				_this.inputEl.trigger('click');
			}
		});
  
		$(document).bind('dragover', (e) => {
			let dropZone = _this.dropZone;
			let timeout = window.dropZoneTimeout;
			if (!timeout) {
				dropZone.addClass('show');
			} else {
				clearTimeout(timeout);
			}
			let found = false;
			let node = e.target;
			do {
				if (node === dropZone[0]) {
					found = true;
					break;
				}
				node = node.parentNode;
			} while (node !== null);
			if (found) {
				dropZone.addClass('hover');
			} else {
				dropZone.removeClass('hover');
			}
			window.dropZoneTimeout = setTimeout(() => {
				window.dropZoneTimeout = null;
				dropZone.removeClass('in hover');
			}, 100);
		});
	  	this.inputEl.on('click', (e) => {
			e.stopPropagation();
	  	});
	}
	initActions() {
		let btnUploadAll = this.formEl.find('#btn-upload-all');
		let btnSelect = this.formEl.find('#btn-select');
		let btnRemoveImg = $('.list-medias-inner .action-remove');
		if (btnUploadAll) {
			btnUploadAll.on('click', (e) => {
				e.preventDefault();
				var filesList = this.inputEl.prop('files');
				this.formEl.fileupload('send', {files: filesList})
			})
		}
		
		if (btnSelect) {
			btnSelect.on('click', (e) => {
				e.preventDefault();
				$('#addNewMedia').modal('hide');
				$('#addNewMedia').trigger('select.btn.clicked');
				
				if(this.selectedMedias.length > 0){
					//Save ids to hidden field to submit form
					var _tmpStrSelectedMedias  = this.selectedMedias.join(',');
					$( "input[name=photos]" ).val(_tmpStrSelectedMedias);
					//end save ids
					$("#list-medias-inner").html("");
					for (let data of this.arrayMedias) {
						for (let mediaId of this.selectedMedias) {
							if (mediaId == data.id) {
								$("#list-medias-inner").append(
									`<li>
										<div class="el-card-avatar"> 
											<img class="img-fluid" src="${data.thumbnail.sizes.thumbnail.path}" alt="${data.title}">
											<a class="btn btn-primary btn-xs action-remove" data-id="${data.id}" href="javascript:void(0)" role="button">Remove</a>
										</div>
									</li>`
								);
							}
						}
					}
				}
			})
		}
		
		if (btnRemoveImg) {
			let _this = this;
			btnRemoveImg.on('click', (e) => {
				e.preventDefault();
				let dataIdRemoved = $(e.currentTarget).attr('data-id');
				$(e.currentTarget).parents('li').remove();
				var index = _this.selectedMedias.indexOf(dataIdRemoved);
				if (index > -1) {
					_this.selectedMedias.splice(dataIdRemoved, 1);
					$( "input[name=photos]" ).val(_this.selectedMedias.join(','));
				}
			})
		}
    }
    //Functions
    reloadListMedia(page) {
        let _cont = $('#mediaContent');
        // _cont.find('.media-list ul').html('');
				//load new medias
        Cloud.listMedia.with({page: page, limit: 10}).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
            if (err) {
                return;
            } else {
				//cloud success
				this.arrayMedias.push(...responseBody.data);
				if (responseBody.data.length > 0) {
					this.buildListMedia(responseBody.data);
					//Init
					let checkboxItem = _cont.find('.selectable-item');
					if (checkboxItem) {
						var _this = this;
						//Get checked media then insert to selectedMedias
						checkboxItem.change(function(e) { 
							var chkbx = $(this);
							var dataChecked = chkbx.attr('data-id');
							if(chkbx.is(':checked')) {
								var index = _this.selectedMedias.indexOf(dataChecked);
								if (index == -1) {
									_this.selectedMedias.push(dataChecked);
								}
							} else {
								var index = _this.selectedMedias.indexOf(dataChecked);
								if (index > -1) {
									_this.selectedMedias.splice(dataChecked, 1);
								}
							}
						})
						//End checked media then insert to selectedMedias
	
					}
				} else {
					$('#mediaLoadMore').addClass('d-none');
				}
			}
        });
    }
    buildListMedia(data) {
        let _cont = $('#mediaContent');
        let _listCont = _cont.find('.media-list ul');
        if (data.length > 0) {
            let _strItems = '';
            for (let _dataItem of data) {
                if (_dataItem.thumbnail) {
                    _strItems += this.buildMedia(_dataItem);
                }
            }
            _listCont.append(_strItems);
            //init list media
            if (typeof(MediaGridTable) != 'undefined') {
                this.listMedia = new MediaGridTable();
            }
        }
    }
    buildMedia(data) {
		let checked = '';
		if(this.selectedMedias.length > 0){
			for (let media of this.selectedMedias) {
				if (media == data.id) {
					checked = 'checked';
				}
			}
		}
		let _path = '';
		if(Object.keys(data.thumbnail.sizes).length) {
			_path = data.thumbnail.sizes.thumbnail.path;
		} else {
			_path = data.thumbnail.path;
		}
		//<div class="title">${data.title}</div>
        return (
			
            `<li>
                <div class="media-item">
                    <div class="checkbox-custom checkbox-primary checkbox-lg">
                        <input type="checkbox" class="selectable-item" id="media_${data.id}" data-id="${data.id}" ${checked}/>
                        <label for="media_${data.id}"></label>
                    </div>
                    <div class="image-wrap">
                        <img class="image img-rounded" src="${_path}" alt="${data.title}">
                    </div>
                    <div class="info-wrap">
                        <div class="dropdown">
                            <span class="icon md-settings" data-toggle="dropdown"
                                aria-expanded="false" role="button"
                                data-animation="scale-up"></span>
                            <div class="dropdown-menu dropdown-menu-right" role="menu">
                                <a class="dropdown-item" href="${data.thumbnail.path}"><i
                                        class="icon md-download"
                                        aria-hidden="true"></i>Download</a>
                                <a class="dropdown-item action-delete" href="javascript:void(0)"><i
                                        class="icon md-delete"
                                        aria-hidden="true"></i>Delete Permanently</a>
                            </div>
                        </div>
                        <div class="time">${this.getLastPeriod(data.createdAt, 'fullday')}</div>
                        <div class="media-item-actions btn-group">
                            <button class="btn btn-icon btn-pure btn-default"
                                data-original-title="Edit" data-toggle="tooltip"
                                data-container="body" data-placement="top"
                                data-trigger="hover" type="button">
                                <i class="icon md-edit" aria-hidden="true"></i>
                            </button>
                            <button class="btn btn-icon btn-pure btn-default"
                                data-original-title="Download" data-toggle="tooltip"
                                data-container="body" data-placement="top"
                                data-trigger="hover" type="button">
                                <i class="icon md-download" aria-hidden="true"></i>
                            </button>
                            <button class="btn btn-icon btn-pure btn-default"
                                data-original-title="Delete" data-toggle="tooltip"
                                data-container="body" data-placement="top"
                                data-trigger="hover" type="button">
                                <i class="icon md-delete" aria-hidden="true"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </li>`
        )
    }
    getLastPeriod(time, fullday) {
        let _ago = moment() - moment(time);
        let _days = _ago / (1000 * 60 * 60 * 24);
        let _hours = _ago / (1000 * 60 * 60);
        let _minutes = _ago / (1000 * 60);
        if (_days > 1) {
        if (fullday == 'fullday') {
            return moment(time).format('DD MMM YYYY');
        }
            return Math.floor(_days) + ' ' + this.text.TIME.DAY + ' ' + this.text.AGO;
        }
        if (_hours < 24)
            return Math.floor(_hours) + ' ' + this.text.TIME.HOUR + ' ' + this.text.AGO;
        if (_minutes < 60)
            return Math.floor(_minutes) + ' ' + this.text.TIME.MINUTE + ' ' + this.text.AGO;
	}
	getSelectedMedias() {
		let _selectedMediaIds = this.listMedia.getSelectedMedias();
		let _found = [];
		for (let media of this.arrayMedias) {
			if (_selectedMediaIds.indexOf(media.id) != -1) {
				_found.push(media);
			}
		}
		return (_found.length > 0? _found : []);
	}
	resetAll() {
		//active first tab
		this.formEl.find('a[aria-controls="fromComputer"]').tab('show');
	}
}
  