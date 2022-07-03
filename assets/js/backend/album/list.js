class IndexListAlbumBackendEKP extends BaseBackendEKP {
	constructor() {
		super();
		this.initialize();
	}

	initialize() {
		//DO NOT LOAD UNNESSESARY CLASS
		//Init form + list if page have BOTH  
		this.list = new ListIndexAlbumBackendEKP(this);
	}
}


class ListIndexAlbumBackendEKP {
	constructor(opts) {
		_.extend(this, opts);
		this.langUrl = this.lang == 'en' ? '' : '/js/backend/datatable.json';
		this.tblId = 'tblAlbum';
		this.tableObj = $('#' + this.tblId);
		this.checkAll = null;
		this.listChecked = '';
		this.initialize();
	}

	initialize() {
		let _this = this;
		_this.initDataTable();
		_this.handleItemActions();
		_this.initMoreAction();
		_this.initCheckAll();
	}


	getEventTarget(e) {
		e = e || window.event;
		return e.target || e.srcElement;
	}

	initCheckedList() {
		let _this = this;
		$('.js-checkbox-item').on("click", (e) => {
			let target = _this.getEventTarget(e);
			if (target.checked) {
				_this.listChecked = _this.listChecked + target.defaultValue + ';';
				console.log('_this.listChecked', _this.listChecked);
			} else {
				let str = target.defaultValue + ';';
				let result = _this.listChecked.replace(str, '');
				_this.listChecked = result;
				console.log('_this.listChecked', _this.listChecked);
			}
		});
	}

	initSweetAlert(id) {
		swal({
			title: this.messages.deletePopup,
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3f51b5',
			cancelButtonColor: '#ff4081',
			confirmButtonText: 'Great ',
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
				let csrf = this.tableObj.attr('data-csrf');
				Cloud.trashAlbum.with({ ids: id,  _csrf: csrf }).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
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
							//THEN RELOAD TABLE
							window.curBackendEKP.list.initDataTable();
						})
					}
				})
			}
		});
	}

	initDataTable() {
		let _this = this;
		let params = {};
		let searchParams = new URLSearchParams(window.location.search);
		params.type = searchParams.get('type') || '0';
		params.status = searchParams.get('status') || '-1';
		//cloud success  
		var table = this.tableObj.DataTable({
			"language": {
				"url": this.langUrl
			},
			"processing": true,
			"serverSide": true,
			"ajax": `/api/v1/backend/album/search?status=${params.status}`,
			//Add column data (JSON) mapping from AJAX to TABLE
			"columns": [
				{ "data": "id" },
				{ "data": "photos" },
				{ "data": "title" },
				{ "data": "classObj" },
				{ "data": "status" },
				{ "data": "tool" },
			],
			//Define first column without order
			columnDefs: [
				{
					"orderable": false,
					"targets": [0, -3, -2, -1]
				}
			],
			"order": [[1, "asc"]],
			"iDisplayLength": 50,
			"aLengthMenu": [[10, 20, 50, -1], [10, 20, 50, "All"]],
			//"buttons": ['copy', 'excel', 'csv', 'pdf', 'print'],
			"pagingType": "numbers",
			// "sDom": "<'row'<'col-sm-6'l><'col-sm-6'f>>" + "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-5'i><'col-sm-7'p>>",
			"bDestroy": true,
			"initComplete": function (settings, json) {
				_this.initCheckedList();
				_this.initSwitchStatus();
			}
		});
	}

	handleItemActions() {
		let _this = this;
		// ONCLICK REMOVE (TRASH) LINK
		_this.tableObj.on('click', '.remove-row', function (e) {
			let id = $(this).attr('data-id');
			_this.initSweetAlert(id);
		});
	}

	initMoreAction() {
		let _this = this;
		let btnTrash = $('.dropdown-menu .act-trash-group');

		btnTrash.on('click', (e) => {
			e.preventDefault();
			let ids = '';
			if (_this.checkAll.value != '') {
				ids = _this.checkAll.value;
				_this.initSweetAlert(ids);
			} else if(_this.listChecked != '') { 
				ids = _this.listChecked.slice(0, -1);
				_this.initSweetAlert(ids);
			} else {
			swal(_this.messages.chooseItem)
			};
		});
	}

	initCheckAll() {
		this.checkAll = new CheckBoxBackendEKP({
			isChkAll: true,
			selector: '#js-check-all',
			childSelector: '.js-checkbox-item',
			onChange: function (e, value) { 
				console.log(value);
			}
		});
	}

	initSwitchStatus() {
		let _this = this;
		$(document).ready(function () {
			$('.switchStatus').change(function () {
				let id = $(this).attr('data-id');
				let csrf = _this.tableObj.attr('data-csrf');
				Cloud.switchStatusAlbum.with({ id: id,  _csrf: csrf }).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
					if (err) {
						console.log(err);
						return;
					} else if (responseBody) {
						//THEN RELOAD TABLE
						window.curBackendEKP.list.initDataTable();
					}
				})
			});
		});
	}
}