class IndexListUserBackendEKP extends BaseBackendEKP {
  constructor() {
    super();
    this.initialize();
  }

  initialize() {
    //DO NOT LOAD UNNESSESARY CLASS
    //Init form + list if page have BOTH
    // this.form = new FormIndexUserBackendEKP(this);
    this.list = new ListIndexUserBackendEKP(this);

  }
}

class ListIndexUserBackendEKP {
  constructor(opts) {
    _.extend(this, opts);

    this.langUrl = this.lang == 'en' ? '' : '/js/backend/datatable.json';
    this.tblId = 'tblUser';
    this.tableObj = $('#' + this.tblId);
    if (this.tableObj.length) {
      this.checkAll = null;
      this.listChecked = '';
      this.initialize();
    }
  }
  initialize() {
    let _this = this;
    _this.initDataTable();
    _this.handleItemActions();
    _this.initMoreAction();
    _this.initCheckAll();
  }

  prepareDatable(keyword, userType, status) {
    let _this = this;
    let params = {};
    let url = new URL(window.location);
    let searchParams = new URLSearchParams(url.search);
    let ajax = "/api/v1/backend/user/list/search? =-1";
    params.userType = userType || "-1";
    params.status = status || 1;
    if(params.userType != -1 || params.status != -1) {
      ajax = "/api/v1/backend/user/list/search?keyword="+ keyword +"&userType=" + params.userType + "&status=" + params.status;
    }

    //cloud success
    var table = this.tableObj.DataTable({
      "language": {
        "url": this.langUrl
      },
      "processing": true,
      "serverSide": true,
      "ajax": ajax,
      //Add column data (JSON) mapping from AJAX to TABLE
      "columns": [
        { "data": "id" },
        { "data": "ordinalNumber"},
        { "data": "userName"},
        { "data": "fullName" },
        { "data": "phone" },
        { "data": "birthday" },
        { "data": "emailAddress" },
        { "data": "classes" },
        { "data": "status" },
        { "data": "tool"}
      ],
      //Define first column without order
      columnDefs: [
        { "orderable": false, "targets": [0, -1, -2, 2, 3, 5] }
      ],
      "order": [[1, "DESC"]],
      "iDisplayLength": 50,
      "aLengthMenu": [[10, 20, 50, -1], [10, 20, 50, "All"]],
      //"buttons": ['copy', 'excel', 'csv', 'pdf', 'print'],
      "pagingType": "numbers",
      "searching": false,
      //"sDom": "<'row'<'col-sm-6'><'col-sm-6 mb-10'B>>" + "<'row'<'col-sm-6'l><'col-sm-6'f>>" + "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-5'i><'col-sm-7'p>>",
      //"sDom": "<'row'<'col-sm-6'l><'col-sm-6'f>>" + "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-5'i><'col-sm-7'p>>",
      "bDestroy": true,
      "initComplete": function (settings, json) {
        _this.initCheckList();
        _this.initSwitchStatus();
      },

      //export excel and pdf
      "dom": 'Bfrtip',
      "buttons": [
      {
          "className" : 'btn btn-success mb-20',
          "text": 'Xuất danh sách Excel',
          "extend": 'excelHtml5',
          "filename" : 'DANH SÁCH GIÁO VIÊN',
          "title": 'DANH SÁCH GIÁO VIÊN',
          "exportOptions": {
            "columns": [ 1, 2, 3, 4 ] // export with specificed columns
          }
      },
      {
          "className" : 'btn btn-success mb-20',
          "text": 'Xuất danh sách PDF',
          "extend": 'pdfHtml5',
          "filename" : 'DANH SÁCH GIÁO VIÊN',
          "title": 'DANH SÁCH GIÁO VIÊN',
          "exportOptions": {
            "columns": [ 1, 2, 3, 4 ] // export with specificed columns
          }
      }],
    });
  }

  initDataTable() {
    let _this = this;
    let params = {};
    let url = new URLSearchParams(window.location.search);
    let keyword = url.get('keyword') || '';
    //let url2 = new URL(window.location);
    params.userType = url.get('userType') || "-1";
    params.status = url.get('status') || 1;

    $("#filterKeyword").val(keyword);
    $(".js-select2-userType").val(params.userType).change();

    _this.prepareDatable(keyword, params.userType, params.status);

    $('#filterBtn').on('click', (e) => {
      e.preventDefault();
      keyword = $("#filterKeyword").val();
      params.userType = $(".js-select2-userType option:selected").val();
      window.location = '/backend/user?keyword=' + keyword +"&userType=" + params.userType + "&status=" + params.status;
    })
  }
  handleItemActions() {
    let _this = this;


    //ONCLICK DUPPLICATE LINK
    _this.tableObj.on('click', '.duplicate-row', function (e) {
      e.preventDefault();
      let id = $(this).attr('data-id');
      //get AJAX data
      Cloud.getUser.with({ id: id }).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
        if (err) {
          console.log(err);
          return;
        }
        //AJAX success
        let _data = Object.assign({ id: id }, responseBody);
        let _currentForm = window.curBackendEKP.form;
        //Render data from response to form
        _currentForm.renderFormData('add', _data);
      })
    });
    //END ONCLICK DUPPLICATE LINK

    //ONCLICK REMOVE (TRASH) LINK
    _this.tableObj.on('click', '.remove-row', function (e) {
      let id = $(this).attr('data-id');
      _this.initSweetAlert(id)
    });
    //END ONCLICK REMOVE (TRASH) LINK
    // //ONCLICK REMOVE (TRASH) LINK
    // _this.tableObj.on('click', '.remove-row', function (e) {
    //   let id = $(this).attr('data-id');
    //   // confirm dialog
    //   alertify.confirm(this.messages.deletePopup, function () {
    //     // user clicked "ok"
    //     e.preventDefault();
    //     //get AJAX data
    //     Cloud.trashUser.with({ ids: id }).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
    //       if (err) {
    //         console.log(err);
    //         return;
    //       }
    //       //THEN RELOAD TABLE IF NEEDED
    //       window.curBackendEKP.list.initDataTable();
    //     })
    //   }, function () {
    //     // user clicked "cancel" => do nothing
    //   });
    // });
    // //END ONCLICK REMOVE (TRASH) LINK
  }

  //CHECK MORE
  initCheckList() {
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
  //END CHECK MORE

  //GET TARGET
  getEventTarget(e) {
    e = e || window.event;
    return e.target || e.srcElement;
  }
  //END GET TARGET

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
        swal(_this.messages.chooseItem);
      }
    });
  }
  //CHECK ALL
  initCheckAll() {
    this.checkAll = new CheckBoxBackendEKP({
      isChkAll: true,
      selector: '#js-check-all',
      childSelector: '.js-checkbox-item',
      onChange: function (e, value) {
        console.log("===========================ONCHANGE SELECT ELEMENT============================");
        console.log(value);
      }
    });
  }
  //END CHECK ALL
  initSweetAlert(id) {
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
        //get AJAX data
        Cloud.trashUser.with({ ids: id, _csrf: $('[name="_csrf"]').val() }).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
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

	initSwitchStatus() {
		// let _this = this;
		$(document).ready(function () {
			$('.switchStatus').change(function () {
				let id = $(this).attr('data-id');
        Cloud.switchStatusUser.with({ id: id, _csrf: $('[name="_csrf"]').val() }).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
					if (err) {
						console.log(err);
						return;
					} else if (responseBody) {
            //THEN RELOAD TABLE
            window.curBackendEKP.list.initDataTable();
					}
				})
				// _this.initSwitchStatusAlert(id);
			});
		});
	}
}
