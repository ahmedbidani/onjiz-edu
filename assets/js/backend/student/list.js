class IndexListStudentBackendEKP extends BaseBackendEKP {
  constructor() {
    super();
    this.initialize();
  }

  initialize() {
    //DO NOT LOAD UNNESSESARY CLASS
    //Init form + list if page have BOTH
    this.list = new ListIndexStudentBackendEKP(this);
  }
}


class ListIndexStudentBackendEKP {
  constructor(opts) {
    _.extend(this, opts);

    this.langUrl = this.lang == 'en' ? '' : '/js/backend/datatable.json';
    this.tblId = 'tblStudent';
    this.tableObj = $('#' + this.tblId);
    this.checkAll = null;
    this.listChecked = '';
    this.initialize();
  }

  initialize() {
    let _this = this;
    _this.initDataTable();
    $('.js-select2').select2();
    _this.handleItemActions();
    _this.handleExportAction(_this);
    _this.initMoreAction();
    _this.initCheckAll();
  }

  handleExportAction(_this) {
    $('#exportBtn').on('click', (e) => {
      e.preventDefault();
      let filterParams = this._initFilterParams(_this);
      Cloud.exportStudents.with(filterParams).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
        if (err) {
          console.log(err);
          return;
        } else if (responseBody) {
          const data = responseBody.listStudents;
          const fileName = 'Export_Students_' + moment().format('YYYY-MM-DD HH:mm:ss');
          const exportType = 'xls';
          window.exportFromJSON({ data, fileName, exportType });
        }
      });
    });
  }

  _initFilterParams(_this) {
    //ONCLICK EDIT LINK
    let filterParams = new URLSearchParams(window.location.search);
    let params = {};
    params.classId = _this.tableObj.attr('data-classActive') || filterParams.get('classId');
    params.branchActive = _this.tableObj.attr('data-branchActive') || filterParams.get('branchId');
    if (params.branchActive == null) params.branchActive = '0';
    params.status = filterParams.get('status') || '1';
    params.gender = filterParams.get('gender') || '2';
    params.keyword = filterParams.get('keyword') || '';
    //TOKEN
    params.csrf = this.tableObj.attr('data-csrf');
    return params;
  }
  prepareDatable(branchID, classId, status, gender, keyword) {
    let _this = this;
    let table = this.tableObj.DataTable({
      "language": {
        "url": this.langUrl
      },
      "processing": true,
      "serverSide": true,
      "ajax": "/api/v1/backend/student/search?branchId=" + branchID + "&classId=" + classId + "&status=" + status + "&gender=" + gender + "&keyword=" + keyword,
      "drawCallback": function (settings) {
        // Here the response
        console.log(settings.json)
      },
      //Add column data (JSON) mapping from AJAX to TABLE
      "columns": [
        { "data": "id" },
        { "data": "ordinalNumber"},
        { "data": "code" },
        { "data": "fullName" },
        { "data": "dateOfBirth" },
        { "data": "gender" },
        { "data": "parents" },
        // { "data": "mothers" },
        { "data": "currentAddress" },
        { "data": "status" },
        { "data": "tool" }
      ],
      //Define first column without order
      columnDefs: [
        { "orderable": false, "targets": [0, -2, -1, -3, -4, -5] }
      ],
      "order": [[1, "DESC"]],
      "iDisplayLength": 50,
      "bLengthChange": false,
      // "aLengthMenu": [[20, 50, 100, -1], [20, 50, 100, "All"]],
      //"buttons": ['copy', 'excel', 'csv', 'pdf', 'print'],
      "pagingType": "numbers",
      "sDom": "<'row'<'col-sm-6'><'col-sm-6 mb-10'B>>" + "<'row'<'col-sm-6'l><'col-sm-6'f>>" + "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-5'i><'col-sm-7'p>>",
      //"sDom": "<'row'<'col-sm-6'l><'col-sm-6'f>>" + "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-5'i><'col-sm-7'p>>",
      "bDestroy": true,
      "searching": false,
      "initComplete": function (settings, json) {
        _this.initCheckedList();
        _this.initSwitchStatus();
      }
    });
  }
  routingPrepare(branchId, classId, status, gender, keyword) {
    window.location = '/backend/student/filter?branchId=' + branchId + '&classId=' + classId + '&status=' + status + '&gender=' + gender + '&keyword=' + keyword;
  }
  initDataTable() {
    let _this = this;
    let params = this._initFilterParams(_this);
    _this.prepareDatable(params.branchActive, params.classId, params.status, params.gender, params.keyword);
    $("#filterKeyword").val(params.keyword);

    if (!(params.classId && params.classId != '0' && params.classId != 'undefined' && params.classId != 'null')
      && params.classId != '3') params.classId = -1;
    if (!(params.classId && params.classId != '0' && params.classId != 'undefined' && params.classId != 'null')
      && params.classId != '-1') params.classId = 3;

    $(".js-select2-class").val(params.classId).change();
    $(".js-select2-status").val(params.status).change();
    $(".js-select2-gender").val(params.gender).change();

    // Onclick btn filter
    $('#filterBtn').on('click', (e) => {
      e.preventDefault();
      let classID = $(".js-select2-class option:selected").val();
      let status = $(".js-select2-status option:selected").val();
      let gender = $(".js-select2-gender option:selected").val();
      let keyword = $("#filterKeyword").val();
      _this.routingPrepare(params.branchActive, classID, status, gender, keyword);
    })

  }

  handleItemActions() {
    let _this = this;
    //ONCLICK EDIT LINK
    // ONCLICK REMOVE (TRASH) LINK
    _this.tableObj.on('click', '.remove-row', function (e) {
      let id = $(this).attr('data-id');
      _this.initSweetAlert(id, _this);
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
        _this.initSweetAlert(ids, _this);
      } else if (_this.listChecked != '') {
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

  getEventTarget(e) {
    e = e || window.event;
    return e.target || e.srcElement;
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
        let csrf = this.tableObj.attr('data-csrf');
        Cloud.trashStudent.with({ ids: id, _csrf: csrf }).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
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

  initSwitchStatus() {
    // let _this = this;
    $(document).ready(function () {
      $('.switchStatus').change(function () {
        let id = $(this).attr('data-id');
        // _this.initSwitchStatusAlert(id);
        Cloud.switchStatusStudent.with({ id: id, _csrf: $('[name="_csrf"]').val() }).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
          if (err) {
            console.log(err);
            return;
          } else if (responseBody) {
            location.reload();
          }
        })
      });
    });
  }

}
