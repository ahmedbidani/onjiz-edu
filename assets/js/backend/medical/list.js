class IndexListMedicalBackendEKP extends BaseBackendEKP {
  constructor() {
    super();
    this.initialize();
  }

  initialize() {
    //DO NOT LOAD UNNESSESARY CLASS
    //Init form + list if page have BOTH  
    this.list = new ListIndexMedicalBackendEKP(this);
  }
}

class ListIndexMedicalBackendEKP {
  constructor(opts) {
    _.extend(this, opts);

    this.langUrl = this.lang == 'en' ? '' : '/js/backend/datatable.json';
    this.tblId = 'tblMedical';
    this.tableObj = $('#' + this.tblId);
    this.checkAll = null;
    this.listChecked = '';
    this.initialize();
  }

  initialize() {
    let _this = this;
    _this.initDataTable(_this);
    _this.handleItemActions();
    _this.initMoreAction();
    _this.initCheckAll();
    _this.initCheckList();
  }

  prepareDatable() {
    let _this = this;
    let params = {};
    let searchParams = new URLSearchParams(window.location.search);
    params.classId = searchParams.get('classId') || '';
    params.keyword = searchParams.get('keyword') || '';
    //params.status = searchParams.get('status') || '-1';
    //cloud success  
    var table = this.tableObj.DataTable({
      "language": {
        "url": this.langUrl
      },
      "processing": true,
      "serverSide": true,
      "ajax": "/api/v1/backend/medical/search?classId=" + params.classId + "&keyword=" + params.keyword,
      //Add column data (JSON) mapping from AJAX to TABLE
      "columns": [
        { "data": "id" },
        { "data": "class" },
        { "data": "date" },
        { "data": "note" },
        { "data": "detail" },
        { "data": "tool" }
      ],
      //Define first column without order
      columnDefs: [
        { "orderable": true, "targets": [0] }
      ],
      //"order": [[2, "DESC"]],
      "iDisplayLength": 50,
      "ordering": false,
      "bLengthChange": false,
      "aLengthMenu": [[10, 20, 50, -1], [10, 20, 50, "All"]],
      //"buttons": ['copy', 'excel', 'csv', 'pdf', 'print'],
      "pagingType": "numbers",
      "searching": false,
      //"sDom": "<'row'<'col-sm-6'><'col-sm-6 mb-10'B>>" + "<'row'<'col-sm-6'l><'col-sm-6'f>>" + "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-5'i><'col-sm-7'p>>",
      "sDom": "<'row'<'col-sm-6'l><'col-sm-6'f>>" + "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-5'i><'col-sm-7'p>>",
      "bDestroy": true,
      "initComplete": function (settings, json) {
        _this.initCheckList();
        _this.initSwitchStatus();
      }
    });

  }
  _initFilterParams(_this) {
    //ONCLICK EDIT LINK
    let filterParams = new URLSearchParams(window.location.search);
    let params = {};

    params.classId = _this.tableObj.attr('data-classActive') || filterParams.get('classId');
    // params.branchActive = _this.tableObj.attr('data-branchActive') || filterParams.get('branchId');
    // if (params.branchActive == null) params.branchActive = '0';
    // params.status = filterParams.get('status') || '0';
    // params.gender = filterParams.get('gender') || '2';
    params.keyword = filterParams.get('keyword') || '';
    //TOKEN
    //let arrpath = filterParams.split('/');
    //params.medicalId = arrpath[arrpath.length - 1];
    params.csrf = this.tableObj.attr('data-csrf');
    return params;
  }
  routingPrepare(classId, keyword) {
    window.location = '/backend/medical/list?classId=' + classId + '&keyword=' + keyword;
  }
  initDataTable() {
    let _this = this;
    let params = this._initFilterParams(_this);
    _this.prepareDatable();
    $("#filterKeyword").val(params.keyword);

    // if (!(params.classId && params.classId != '0' && params.classId != 'undefined' && params.classId != 'null')
    //   && params.classId != '3') params.classId = -1;
    // if (!(params.classId && params.classId != '0' && params.classId != 'undefined' && params.classId != 'null')
    //   && params.classId != '-1') params.classId = 3;

    $(".js-select2-class").val(params.classId).change();
    // $(".js-select2-status").val(params.status).change();
    // $(".js-select2-gender").val(params.gender).change();

    // // Onclick btn filter
    $('#filterBtn').on('click', (e) => {
      e.preventDefault();
      let classId = $(".js-select2-class option:selected").val();
      let keyword = $("#filterKeyword").val();
      _this.routingPrepare(classId, keyword);
    })

  }
  handleItemActions() {
    let _this = this;
    //ONCLICK REMOVE (TRASH) LINK
    _this.tableObj.on('click', '.remove-row', function (e) {
      let id = $(this).attr('data-id');
      _this.initSweetAlert(id)
    });
    //END ONCLICK REMOVE (TRASH) LINK
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
        let csrf = this.tableObj.attr('data-csrf');
        Cloud.deleteMedical.with({ ids: id,  _csrf: csrf }).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
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
		let _this = this;
		$(document).ready(function () {
			$('.switchStatus').change(function () {
        let id = $(this).attr('data-id');
        let csrf = _this.tableObj.attr('data-csrf');
        // _this.initSwitchStatusAlert(id);
        Cloud.switchStatusEvent.with({ id: id,  _csrf: csrf }).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
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