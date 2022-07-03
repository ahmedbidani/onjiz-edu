class IndexListPostBackendEKP extends BaseBackendEKP {
  constructor() {
    super();
    this.initialize();
  }

  initialize() {
    //DO NOT LOAD UNNESSESARY CLASS
    //Init form + list if page have BOTH
    this.list = new ListIndexPostBackendEKP(this);
  }
}

class ListIndexPostBackendEKP {
  constructor(opts) {
    _.extend(this, opts);

    this.langUrl = this.lang == 'en' ? '' : '/js/backend/datatable.json';
    this.tblId = 'tblPost';
    this.tableObj = $('#' + this.tblId);
    this.checkAll = null;
    this.listChecked = '';
    this.initialize();
  }

  initialize() {
    let _this = this;
    //_this.initDataTable(_this);
    _this.initDataTable1();
    _this.handleItemActions();
    _this.initMoreAction();
    _this.initCheckAll();
    _this.initCheckList();
  }

  _initFilterParams(_this) {
    //ONCLICK EDIT LINK
    let filterParams = new URLSearchParams(window.location.search);
    let params = {};
    params.categoryId = _this.tableObj.attr('data-classActive') || filterParams.get('categoryId');
    // params.tagId = _this.tableObj.attr('data-classActive') || filterParams.get('tagId');
    params.branchActive = _this.tableObj.attr('data-branchActive') || filterParams.get('branchId');
    if(params.branchActive == null) params.branchActive = '0';
    params.tagId = filterParams.get('tagId') || '-1';
    params.status = filterParams.get('status') || '1';
    params.keyword = filterParams.get('keyword') || '';
    //TOKEN
    params.csrf = this.tableObj.attr('data-csrf');
    return params;
  }

  prepareDatable(categoryId, tagId, status, keyword) {
    let _this = this;
    let table = this.tableObj.DataTable({
      "language": {
        "url": this.langUrl
      },
      "processing": true,
      "serverSide": true,
      "ajax": "/api/v1/backend/post/search?categoryId=" + categoryId + "&tagId=" + tagId + "&status=" + status + "&keyword=" + keyword,
      //Add column data (JSON) mapping from AJAX to TABLE
      "columns": [
        { "data": "id" },
        { "data": "thumbnail" },
        { "data": "title" },
        { "data": "categories" },
        { "data": "tags" },
        { "data": "author" },
        { "data": "status" },
        { "data": "tool" }
      ],
      //Define first column without order
      columnDefs: [
        { "orderable": false, "targets": [0, 1, 3, 4, -1, -2, ] }
      ],
      "order": [],
      "iDisplayLength": 50,
      "bLengthChange" : false,
      "aLengthMenu": [[10, 20, 50, -1], [10, 20, 50, "All"]],
      //"buttons": ['copy', 'excel', 'csv', 'pdf', 'print'],
      "pagingType": "numbers",
      //"sDom": "<'row'<'col-sm-6'><'col-sm-6 mb-10'B>>" + "<'row'<'col-sm-6'l><'col-sm-6'f>>" + "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-5'i><'col-sm-7'p>>",
      "sDom": "<'row'<'col-sm-6'l><'col-sm-6'f>>" + "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-5'i><'col-sm-7'p>>",
      "bDestroy": true,
      "searching": false,
      "initComplete": function (settings, json) {
        _this.initCheckList();
        _this.initSwitchStatus();
      }
    })
  }

  initDataTable(_this) {
    let params = {};
    let searchParams = new URLSearchParams(window.location.search);
    params.status = searchParams.get('status') || '-1';
    let type = this.tableObj.attr('data-type');
    //cloud success
    var table = this.tableObj.DataTable({
      "language": {
        "url": this.langUrl
      },
      "processing": true,
      "serverSide": true,
      "ajax": "/api/v1/backend/post/search?status=" + params.status + "&&type=" + type,
      //Add column data (JSON) mapping from AJAX to TABLE
      "columns": [
        { "data": "id" },
        { "data": "thumbnail" },
        { "data": "title" },
        { "data": "categories" },
        { "data": "tags" },
        { "data": "author" },
        { "data": "status" },
        { "data": "tool" }
      ],
      //Define first column without order
      columnDefs: [
        { "orderable": false, "targets": [0, 1, 3, 4, -1, -2, ] }
      ],
      "order": [],
      "iDisplayLength": 50,
      "aLengthMenu": [[10, 20, 50, -1], [10, 20, 50, "All"]],
      //"buttons": ['copy', 'excel', 'csv', 'pdf', 'print'],
      "pagingType": "numbers",
      //"sDom": "<'row'<'col-sm-6'><'col-sm-6 mb-10'B>>" + "<'row'<'col-sm-6'l><'col-sm-6'f>>" + "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-5'i><'col-sm-7'p>>",
      "sDom": "<'row'<'col-sm-6'l><'col-sm-6'f>>" + "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-5'i><'col-sm-7'p>>",
      "bDestroy": true,
      "initComplete": function (settings, json) {
        _this.initCheckList();
        _this.initSwitchStatus();
      }
    });

  }

  routingPrepare(categoryId, tagId, status, keyword) {
    window.location = '/backend/post/list?categoryId=' + categoryId + '&tagId=' + tagId + '&status=' + status + '&keyword=' + keyword;
  }

  initDataTable1() {
    let _this = this;
    let params = this._initFilterParams(_this);
    _this.prepareDatable(params.categoryId, params.tagId, params.status, params.keyword);
    $("#filterKeyword").val(params.keyword);
    if (!(params.categoryId && params.categoryId != '0' && params.categoryId != 'undefined' && params.categoryId != 'null')) params.categoryId = -1;
    $(".js-select2-category").val(params.categoryId).change();
    $(".js-select2-tag").val(params.tagId).change();
    $(".js-select2-status").val(params.status).change();

    // Onclick btn filter
    $('#filterBtn').on('click', (e) => {
      e.preventDefault();
      let categoryID = $(".js-select2-category option:selected").val();
      let tagId = $(".js-select2-tag option:selected").val();
      let status = $(".js-select2-status option:selected").val();
      let keyword = $("#filterKeyword").val();
      _this.routingPrepare(categoryID, tagId, status, keyword);
    })

  }

  handleItemActions() {
    let _this = this;
    //ONCLICK REMOVE (TRASH) LINK
    _this.tableObj.on('click', '.remove-row', function (e) {
      let id = $(this).attr('data-id');
      _this.initSweetAlert(id, _this)
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
        _this.initSweetAlert(ids, _this);
      } else if(_this.listChecked != '') {
        ids = _this.listChecked.slice(0, -1);
        _this.initSweetAlert(ids, _this);
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
  initSweetAlert(id, _this) {
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
        Cloud.trashPost.with({ ids: id,  _csrf: csrf }).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
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
              // window.curBackendEKP.list.initDataTable();
              location.reload();
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
        Cloud.switchStatusPost.with({ id: id,  _csrf: csrf }).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
					if (err) {
						console.log(err);
						return;
					} else if (responseBody) {
            //THEN RELOAD TABLE
            // window.curBackendEKP.list.initDataTable();
            location.reload();
					}
				})
			});
		});
	}

}
