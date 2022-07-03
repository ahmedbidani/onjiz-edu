class IndexFeeInvoiceStatisticBackendEKP extends BaseBackendEKP {
  constructor() {
    super();
    this.initialize();
  }

  initialize() {
    //DO NOT LOAD UNNESSESARY CLASS
    this.list = new ListFeeInvoiceStatisticBackendEKP(this);

  }
}

class ListFeeInvoiceStatisticBackendEKP {
  constructor(opts) {
    _.extend(this, opts);
    this.langUrl = this.lang == 'en' ? '' : '/js/backend/datatable.json';
    this.i18n = i18n[this.lang];
    this.tblId = 'tblFeeInvoiceStatistic';
    this.tableObj = $('#' + this.tblId);
    this.initialize();
  }

  initialize() {
    let _this = this;
    _this.initDataTable($('#filterBranch').val(), $('#filterClass').val(), $('#status').val());
    _this.initFilter();
  }

  initDataTable(branchId, classId, status) {
    let _this = this;
    //cloud success  
    var table = this.tableObj.DataTable({
      "language": {
        "url": this.langUrl
      },
      "processing": true,
      "serverSide": true,
      "ajax": `/api/v1/backend/feeInvoice/statistic?branchId=${branchId}&classId=${classId}&status=${status}`,
      //Add column data (JSON) mapping from AJAX to TABLE
      "columns": [
        { "data": "code" },
        { "data": "firstName" },
        { "data": "paidInvoices" },
        { "data": "unpaidInvoices" }
      ],
      //Define first column without order
      columnDefs: [
        { "orderable": false, "targets": [2,3] }
      ],
      "order": [[1, "ASC"]],
      "iDisplayLength": 10,
      "aLengthMenu": [[10, 20, 50, -1], [10, 20, 50, "All"]],
      "pagingType": "numbers",
      "sDom": "<'row'<'col-sm-6'l><'col-sm-6'f>>" + "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-5'i><'col-sm-7'p>>",
      // "paging": false,
      "bDestroy": true,
      "initComplete": function (settings, json) {
        console.log('init datatable fee invoice complete!');
      }
    });
  }

  initFilter() {
    let _this = this;
    $('.js-select2-branch').on('change', (e) => {
      e.preventDefault();
      let branchID = $(".js-select2-branch option:selected").val()
      $.ajax({
        type: "GET",
        url: "/api/v1/backend/branch/get/" + branchID,
        dataType: "json",
        success: function (data) {
          //data will hold an object with your response data, no need to parse
          $('#filterClass')
            .find('option')
            .remove()
            .end();
          var option = '';
          option += '<option value="0">' + _this.i18n['All Class'] + '</option>';
          for (let classes of data.classes) {
            option += '<option value="' + classes.id + '">' + classes.title + '</option>';
          }
          $('#filterClass').append(option);
        }
      })
    });
    
    $('#filterBtn').click(() => {
      let branchId = $('#filterBranch').val();
      let classId = $('#filterClass').val();
      let status = $('#status').val();
      this.initDataTable(branchId, classId, status);
    });
  }

}