class IndexListParentBackendEKP extends BaseBackendEKP {
  constructor() {
    super();
    this.initialize();
  }

  initialize() {
    //DO NOT LOAD UNNESSESARY CLASS
    //Init form + list if page have BOTH
    this.list = new ListIndexParentBackendEKP(this);
  }
}

class ListIndexParentBackendEKP {
  constructor(opts) {
    _.extend(this, opts);
    this.langUrl = this.lang == 'en' ? '' : '/js/backend/datatable.json';
    this.tblId = 'tblParent';
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
    _this.handleExportAction(_this);
    _this.initMoreAction();
    _this.initCheckAll();
  }

  _initFilterParams(_this) {
    //ONCLICK EDIT LINK
    let filterParams = new URLSearchParams(window.location.search);
    let params = {};
    params.classId = _this.tableObj.attr('data-classActive') || filterParams.get('classId');
    params.branchActive = _this.tableObj.attr('data-branchActive') || filterParams.get('branchId');
    if (params.branchActive == null) params.branchActive = '0';
    params.status = filterParams.get('status') || '0';
    params.gender = filterParams.get('gender') || '2';
    params.keyword = filterParams.get('keyword') || '';
    //TOKEN
    params.csrf = this.tableObj.attr('data-csrf');
    return params;
  }

  handleExportAction(_this) {
    $('#exportBtn').on('click', (e) => {
      e.preventDefault();
      let filterParams = this._initFilterParams(_this);
      Cloud.exportParents.with(filterParams).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
        if (err) {
          console.log(err);
          return;
        } else if (responseBody) {
          const data = responseBody.listParents;
          const fileName = 'Export_Parents_' + moment().format('YYYY-MM-DD HH:mm:ss');
          const exportType = 'xls';
          window.exportFromJSON({ data, fileName, exportType });
        }
      });
    });
  }

  initDataTable() {
    let _this = this;
    let params = {};
    let searchParams = new URLSearchParams(window.location.search);
    params.classId = _this.tableObj.attr('data-classActive') || searchParams.get('classId');
    params.status = searchParams.get('status') || '1';
    params.branchId = searchParams.get('branchId') || '';
    params.keyword = searchParams.get('keyword') || '';
    //cloud success
    var table = this.tableObj.DataTable({
      "language": {
        "url": this.langUrl
      },
      "processing": true,
      "serverSide": true,
      "ajax": "/api/v1/backend/parent/list/search?branchId=" + params.branchId + "&classId=" + params.classId + "&status=" + params.status + "&keyword=" + params.keyword,
      //Add column data (JSON) mapping from AJAX to TABLE
      "columns": [
        { "data": "id" },
        { "data": "ordinalNumber"},
        { "data": "fullName" },
        { "data": "emailAddress" },
        { "data": "phone" },
        { "data": "student" },
        { "data": "activated" },
        { "data": "status" },
        { "data": "tool" },
      ],
      //Define first column without order
      columnDefs: [
        { "orderable": false, "targets": [0, -4, -3, -2, -1] }
      ],
      "order": [[1, "asc"]],
      "iDisplayLength": 50,
      "bLengthChange": false,
      //"buttons": ['copy', 'excel', 'csv', 'pdf', 'print'],
      "pagingType": "numbers",
      //"sDom": "<'row'<'col-sm-6'><'col-sm-6 mb-10'B>>" + "<'row'<'col-sm-6'l><'col-sm-6'f>>" + "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-5'i><'col-sm-7'p>>",
      //"sDom": "<'row'<'col-sm-6'l><'col-sm-6'f>>" + "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-5'i><'col-sm-7'p>>",
      "bDestroy": true,
      "searching": false,
      "initComplete": function (settings, json) {
        _this.initCheckedList();
        _this.initSwitchStatus();
      },

      //export excel and pdf
      "dom": 'Bfrtip',
      "buttons": [
        {
          "className": 'btn btn-success mb-20',
          "text": 'Xuất danh sách Excel',
          "extend": 'excelHtml5',
          "filename": 'DANH SÁCH PHỤ HUYNH ' + _this.tableObj.attr('data-classActiveTitle').toUpperCase(),
          "title": 'DANH SÁCH PHỤ HUYNH ' + _this.tableObj.attr('data-classActiveTitle').toUpperCase(),
          "exportOptions": {
            "columns": [1, 2, 3, 4] // export with specificed columns
          }
        },
        {
          "className": 'btn btn-success mb-20',
          "text": 'Xuất danh sách PDF',
          "extend": 'pdfHtml5',
          "filename": 'DANH SÁCH PHỤ HUYNH ' + _this.tableObj.attr('data-classActiveTitle').toUpperCase(),
          "title": 'DANH SÁCH PHỤ HUYNH ' + _this.tableObj.attr('data-classActiveTitle').toUpperCase(),
          "exportOptions": {
            "columns": [1, 2, 3, 4] // export with specificed columns
          }
        }],
    });

    $("#filterKeyword").val(params.keyword);

    if (!(params.classId && params.classId != '0' && params.classId != 'undefined' && params.classId != 'null')
      && params.classId != '3') params.classId = -1;
    if (!(params.classId && params.classId != '0' && params.classId != 'undefined' && params.classId != 'null')
      && params.classId != '-1') params.classId = 3;

    $(".js-select2-class").val(params.classId).change();
    $(".js-select2-status").val(params.status).change();

    // Onclick event to query data by Branch
    $('#filterBtn').on('click', (e) => {
      e.preventDefault();
      let classId = $(".js-select2-class option:selected").val()
      let status = $(".js-select2-status option:selected").val()
      let keyword = $("#filterKeyword").val()
      _this.routingPrepare(params.branchId, classId, status, keyword);
    })
  }

  routingPrepare(branchId, classId, status, keyword) {
    window.location = '/backend/parent/filter?branchId=' + branchId + '&classId=' + classId + '&status=' + status + '&keyword=' + keyword;
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
      } else if (_this.listChecked != '') {
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
  //GET TARGET
  getEventTarget(e) {
    e = e || window.event;
    return e.target || e.srcElement;
  }
  //END GET TARGET

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
        Cloud.trashParent.with({ ids: id, _csrf: csrf }).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
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
        // _this.initSwitchStatusAlert(id);
        Cloud.switchStatusParent.with({ id: id, _csrf: $('[name="_csrf"]').val() }).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
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
