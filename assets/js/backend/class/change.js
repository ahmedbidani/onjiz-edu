class IndexChangeClassBackendEKP extends BaseBackendEKP {
  constructor() {
    super();
    this.initialize();
  }

  initialize() {
    //DO NOT LOAD UNNESSESARY CLASS
    this.view = new ViewIndexStudentBackendEKP(this);
  }
}

class ViewIndexStudentBackendEKP {
  constructor(opts) {
    _.extend(this, opts);
    this.checkAll = null;
    this.listChecked = '';
    this.tblId = 'tblClass';
    this.tableObj = $('#' + this.tblId);
    this.langUrl = this.lang == 'en' ? '' : '/js/backend/datatable.json';
    this.handleSelectionMenu();
    this.initMoreAction();
    this.initCheckAll();
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
      } else {
        let str = target.defaultValue + ';';
        let result = _this.listChecked.replace(str, '');
        _this.listChecked = result;
      }
    });
  }
  moveStudent(id) {
    let classID = $(".js-select2-class option:selected").val();
    let classID2 = $('#menuNewClass').val();
    let csrf = this.tableObj.attr('data-csrf');
    Cloud.moveStudent.with({ ids: id, oldClass: classID, newClass: classID2, _csrf: csrf }).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
      let titleMoveStudent = this.messages.moveStudent;
      let titleSuccessfully = this.messages.successfully;
      if (err) {
        console.log(err);
        return;
      } else if (responseBody) {
        // title1 = this.messages.moveSuccessfully,
        swal({
          title: titleMoveStudent + ' ' + responseBody.fullNameStds + ' ' + titleSuccessfully,
          icon: 'success',
          button: {
            text: this.messages.continue,
            value: true,
            visible: true,
            className: "btn btn-primary"
          }
        }).then((value) => {
          //THEN RELOAD TABLE
          window.location.reload();
        })
      }
    })
  }

  promoteStudent(id) {
    let classID2 = $('#menuNewClass').val();
    let csrf = this.tableObj.attr('data-csrf');
    Cloud.promoteStudent.with({ ids: id, newClass: classID2, _csrf: csrf }).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
      if (err) {
        console.log(err);
        return;
      } else if (responseBody) {
        swal({
          title: this.messages.promoteSuccessfully,
          icon: 'success',
          button: {
            text: this.messages.continue,
            value: true,
            visible: true,
            className: "btn btn-primary"
          }
        }).then((value) => {
          //$('#tblClass').DataTable().ajax.reload();
          window.location.reload();
        })
      }
    })
  }


  routingPrepare(classId, keyword) {
    window.location = '/backend/class/change?classId=' + classId + '&keyword=' + keyword;
  }

  handleSelectionMenu() {
    //let branchId = $('#menuSelect3').val();
    let _this = this;

    let searchParams = new URLSearchParams(window.location.search);

    let classId = _this.tableObj.attr('data-classActive') || searchParams.get('classId');
    if (classId == undefined) classId = -1;
    let keywordFilter = searchParams.get('keyword') || '';

    $("#filterKeyword").val(keywordFilter);
    $(".js-select2-class").val(classId).change();

    $('#filterBtn').on('click', (e) => {
      e.preventDefault();
      classId = $(".js-select2-class option:selected").val();
      keywordFilter = $("#filterKeyword").val();
      _this.routingPrepare(classId, keywordFilter);

    })

    //let classId = $('#menuOldClass').find(":selected").val();
    if (classId != '') {
      var tableNoData = $('#tblClass').DataTable({
        "language": {
          "url": this.langUrl
        },
        "processing": false,
        "serverSide": true,
        "ajax": "/api/v1/backend/student/studentClass?classId=" + classId + "&keyword=" + keywordFilter,
        //Add column data (JSON) mapping from AJAX to TABLE
        "columns": [
          { "data": "fullName" },
          { "data": "dateOfBirth" },
          { "data": "gender" },
          { "data": "id" }
        ],
        //Define first column without order
        // columnDefs: [
        //   {
        //     "bSortable": true,
        //     "targets": [0]
        //   }
        // ],
        "order": [[0, "desc"]],
        "iDisplayLength": 50,
        "bLengthChange": false,
        //"aLengthMenu": [[10, 20, 50, -1], [10, 20, 50, "All"]],
        "pagingType": "numbers",
        "sDom": "<'row'<'col-sm-6'l><'col-sm-6'f>>" + "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-5'i><'col-sm-7'p>>",
        "bDestroy": false,
        "searching": false,
        "initComplete": function (settings, json) {
          _this.initCheckedList();
        }
      });
    }


    $('#menuNewClass').on('change', function (e) {
      let classID2 = $('#menuNewClass').find(":selected").val();
      var tableNewClass = $('#tblNewClass').DataTable({
        "language": {
          "url": this.langUrl
        },
        "processing": true,
        "serverSide": true,
        "ajax": "/api/v1/backend/student/studentClass?checkBox=-1&classId=" + classID2,
        //Add column data (JSON) mapping from AJAX to TABLE
        "columns": [
          { "data": "fullName" },
          { "data": "dateOfBirth" },
          { "data": "gender" }
        ],
        //Define first column without order
        columnDefs: [
          {
            "orderable": true,
            "targets": [0, -3, -2, -1]
          }
        ],
        "order": [[0, "asc"]],
        "iDisplayLength": 50,
        "bLengthChange": false,
        //"aLengthMenu": [[10, 20, 50, -1], [10, 20, 50, "All"]],
        "pagingType": "numbers",
        "sDom": "<'row'<'col-sm-6'l><'col-sm-6'f>>" + "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-5'i><'col-sm-7'p>>",
        "bDestroy": true,
        "searching": false,

      });
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
  initMoreAction() {
    let _this = this;
    let ids = '';
    document.getElementById("btn-move-class").onclick = function () {
      if (_this.checkAll.value != '') {
        ids = _this.checkAll.value;
        _this.moveStudent(ids);
      } else if (_this.listChecked != '') {
        ids = _this.listChecked.slice(0, -1);
        _this.moveStudent(ids);
      } else {
        swal(_this.messages.chooseItem)
      };
    };
  }
}
