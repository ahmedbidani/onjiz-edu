class IndexReportStudentBackendEKP extends BaseBackendEKP {
  constructor() {
    super();
    this.initialize();
  }

  initialize() {
    //DO NOT LOAD UNNESSESARY CLASS
    //Init form + list if page have BOTH  
    this.list = new ListReportStudentBackendEKP(this);
  }
}


class ListReportStudentBackendEKP  {
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
    _this.initTimePicker();
    _this.initDatePicker();
  }

  exportDatable(branchId, classId, dateStart, dateEnd) {
    $.ajax({
      type: "GET",
      url: "/api/v1/backend/report/export?date=" + dateStart + "&dateEnd=" + dateEnd + "&branchId=" + branchId + "&classId="+ classId,
      //data: { date: "date", dateEnd: "dateEnd" ,branchId: "branchId", classId: "classId"},
      success: function (result) {
        const data = result.dataListStudent;
        const fileName = 'Report_StudentAttendance_' + dateStart + "_" + dateEnd;
        const exportType = 'xls';
        window.exportFromJSON({ data, fileName, exportType })  
      }
    })
  }

  routingPrepare(branchId, classId, date, dateEnd) {
    window.location = `/backend/report/student-attendance/filter?date=` + date + `&dateEnd=` + dateEnd + `&branchId=` + branchId + `&classId=`+ classId;
  }
  initDataTable(dateChoosed,dateEndChoosed) {
    let _this = this;
    let params = {};

    let searchParams = new URLSearchParams(window.location.search);
    params.classId = _this.tableObj.attr('data-classActive') || searchParams.get('classId');

    params.date = dateChoosed ? moment(dateChoosed, "DD/MM/YYYY").format("DD-MM-YYYY") : moment().startOf('month').format("DD-MM-YYYY");
    params.dateEnd = dateEndChoosed ? moment(dateEndChoosed, "DD/MM/YYYY").format("DD-MM-YYYY") : moment().endOf('month').format("DD-MM-YYYY");
    params.branchActive = _this.tableObj.attr('data-branchActive') || searchParams.get('branchId');
    if (params.branchActive == null) params.branchActive = '0';
    
    if (!(params.classId && params.classId != '0' && params.classId != 'undefined' && params.classId != 'null')) params.classId = -1;
    $(".js-select2-class").val(params.classId).change();    
    // Onclick btn filter
    $('#filterBtn').on('click', (e) => {
      e.preventDefault();
      let classID = $(".js-select2-class option:selected").val();
      //_this.prepareDatable(params.branchActive, classID,params.date,params.dateEnd);
      _this.routingPrepare(params.branchActive, classID,params.date,params.dateEnd);
    })
    
    $('#exportBtn').on('click', (e) => {
      e.preventDefault();
      let classID = $(".js-select2-class option:selected").val();
      let timeStart = searchParams.get('date') ? moment(searchParams.get('date'), "DD/MM/YYYY").format("DD-MM-YYYY") : moment().startOf('month').format("DD-MM-YYYY");
      let timeEnd = searchParams.get('dateEnd') ? moment(searchParams.get('dateEnd'), "DD/MM/YYYY").format("DD-MM-YYYY") : moment().endOf('month').format("DD-MM-YYYY");
      _this.exportDatable(params.branchActive, classID, timeStart, timeEnd);
      //_this.routingPrepare(params.branchActive, classID,params.date,params.dateEnd);
    });
  }
  

  initTimePicker() {
    if ($("#timepicker-example").length) {
      $('#timepicker-example').datetimepicker({
        format: 'HH:mm',
        icons: {
          up: "mdi mdi-arrow-up",
          down: "mdi mdi-arrow-down"
        }
      });
    }
  }
  initDatePicker() {
    let searchParams = new URLSearchParams(window.location.search);
    let dateTimeStart = searchParams.get('date');
    let dateTimeEnd = searchParams.get('dateEnd');
    var start = moment().startOf('month');
    var end = moment().endOf('month');
    if (dateTimeStart) start = moment(dateTimeStart.split("-").reverse().join("-"));
    if (dateTimeEnd) end = moment(dateTimeEnd.split("-").reverse().join("-"));
  
    $('.shawCalRanges').daterangepicker({
      dateLimit: {
        'months': 1,
      },
      locale: {
        format: 'DD/MM/YYYY'
      },
      startDate: start,
      endDate: end,
      ranges: {
          'Today': [moment(), moment()],
          'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
          'Last 7 Days': [moment().subtract(6, 'days'), moment()],
          'Last 30 Days': [moment().subtract(29, 'days'), moment()],
          'This Month': [moment().startOf('month'), moment().endOf('month')],
          'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        },
        alwaysShowCalendars: true,
      },
      function(start, end) {
        window.curBackendEKP.list.initDataTable(start, end);
      }
    );

  }
}

