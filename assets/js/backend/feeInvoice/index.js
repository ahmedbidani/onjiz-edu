class IndexFeeInvoiceBackendEKP extends BaseBackendEKP {
  constructor() {
    super();
    this.initialize();
  }

  initialize() {
    //DO NOT LOAD UNNESSESARY CLASS
    //Init form + list if page have BOTH
    this.formTakePayment = new FormTakePaymentFeeInvoiceBackendEKP(this);
    this.list = new ListFeeInvoiceBackendEKP(this);

  }
}

class FormTakePaymentFeeInvoiceBackendEKP {
  constructor(opts) {
    _.extend(this, opts);
    this.formId = 'formTakePayment';
    this.formObj = $('#' + this.formId);
    this.title = $('.modal-title');
    this.alert = this.formObj.find('.alert');
    this.btnSubmit = this.formObj.find('button[type="submit"]');
    this.btnReset = this.formObj.find('button[type="reset"]');

    this.initialize();
  }

  initialize() {
    let _this = this;

    const currencyFormat = num => (Math.round(num * 1000) / 1000).toFixed(_this.formObj.attr('data-decimalPlaces')).replace('.', _this.formObj.attr('data-decimalPoint')).replace(/\B(?=(\d{3})+(?!\d))/g, _this.formObj.attr('data-numberSeperatorSymbol'));

    _this.currencyFormat = currencyFormat;
    _this.initValidation();
    _this.onChangePaidAmount();
    _this.initDatePicker();
    $('.js-process-basic-multiple').select2();
  }

  initValidation() {
    let _this = this;
    _this.formObj.formValidation({
      button: {
        selector: '#btnFormTakePayment',
        disabled: 'disabled'
      },
      fields: {
        //Can combine both html5 mode and js mode
        //Refer: http://formvalidation.io/examples/attribute/
        /*alias: {
          validators: {
            notEmpty: {
              message: 'The title is required and cannot be empty'
            }
          }
        },*/
      },
      err: {
        clazz: 'invalid-feedback'
      },
      control: {
        // The CSS class for valid control
        valid: 'is-valid',

        // The CSS class for invalid control
        invalid: 'is-invalid'
      },
      row: {
        invalid: 'has-danger'
      },
      onSuccess: function (e) {
        //e.preventDefault();
        //console.log('FORM can submit OK');
      }
    })
      .on('success.form.fv', function (e) {
        // Prevent form submission
        e.preventDefault();
        console.log('----- FORM TAKE PAYMENT FEE INVOICE ----- [SUBMIT][START]');

        let tmpData = {};
        tmpData.paymentMethod = $('#paymentMethod').val();
        tmpData.paymentCode = $('#paymentCode').val();
        tmpData.paymentDate = $('#paymentDate').val();
        tmpData.paidAmount = $('#paidAmount').attr('data-value');
        tmpData._csrf = $('[name="_csrf"]').val();

        let manner = _this.formObj.attr('data-manner');
        //reset form validator
        if (manner === 'edit') {
          tmpData.id = _this.formObj.attr('data-edit-id');
          Cloud.takePaymentFeeInvoice.with(tmpData).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
            if (err) {
              if (responseBody.message) {
                _this.alert.removeClass('d-none').addClass("alert-warning").html(responseBody.message);
                setTimeout(function () {
                  _this.alert.removeClass('alert-warning').addClass("d-none");
                }, 3000);
                return;
              } else {
                _this.alert.removeClass('d-none').addClass("alert-danger").html(_this.messages.error);
                setTimeout(function () {
                  _this.alert.removeClass('alert-danger').addClass("d-none");
                }, 3000);
                return;
              }
            } else {
              _this.alert.removeClass('d-none').addClass("alert-success").html(_this.messages.editSuccess);
              setTimeout(function () {
                _this.alert.removeClass('alert-success').addClass("d-none");
              }, 3000);
            }
            //cloud success
          });
        }
        //THEN RELOAD TABLE IF NEEDED
        let classId = $('#classId').val();
        let studentId = $('#studentId').val();
        window.curBackendEKP.list.initDataTable('', classId, studentId);
        console.log('----- FORM TAKE PAYMENT FEE INVOICE ----- [SUBMIT][END]');
      });
  }

  //Function render FORM DATA from AJAX
  //@param {String} status Form status: add or edit
  //@param {String} datas JSON data from AJAX
  renderFormData(data) {
    let _this = this;

    if (data) {
      //map id -> form to edit
      _this.formObj.attr('data-edit-id', data.id);

      $('#paymentMethod').val(data.paymentMethod);
      $('#paymentCode').val(data.paymentCode);
      if (data.paymentDate) {
        let dateFormat = $('#date').attr('data-dateFormat');
        $('#paymentDate').val(moment(data.paymentDate, 'YYYY-MM-DD').format(dateFormat));
      }


      $('#titleFormTakePayment').val(data.title);
      $('#totalAmountFormTakePayment').val(_this.currencyFormat(data.totalAmount));

      $('#itemsFormTakePayment').html('');
      if (data.items.length > 0) {
        for (let item of data.items) {
          $('#itemsFormTakePayment').append(
            `<div class="row align-items-md-center mb-1">
              <div class="col-md-3"><input type="text" class="form-control" value="${item.itemTitle}" disabled/></div>
              <div class="col-md-3"><input type="text" class="form-control" style="text-align: end;" value="${_this.currencyFormat(item.amountPerItem)}" disabled/></div>
              <div class="col-md-3"><input type="text" class="form-control" value="${item.numberOfItems}" disabled/></div>
              <div class="col-md-3"><input type="text" class="form-control" style="text-align: end;" value="${_this.currencyFormat(item.totalPerItem)}" disabled/></div>
            </div>`
          )
        }
      }

      $('#bodyTblPaymentHistory').html('');
      if (data.payments.length > 0) {
        $('#paymentHistoryContainer').removeClass('hidden');
        for (let payment of data.payments) {
          $('#bodyTblPaymentHistory').append(
            `<tr>
              <th>${payment.paymentDate}</th>
              <th>${payment.paymentMethod == 0 ? _('Cash') : payment.paymentMethod == 2 ? _('Stripe') : _('Bank')}</th>
              <th>${payment.note}</th>
            </tr>`
          )
        }
      } else {
        $('#paymentHistoryContainer').addClass('hidden');
      }

      if (data.status == 1) {
        //handle if fee invoice is paid
        $('#paymentMethod').prop('disabled', true);
        $('#paymentCode').prop('disabled', true);
        $('#paymentDate').prop('disabled', true);
        $('#btnFormTakePayment').prop('disabled', true);
        $('#paidAmount').addClass('hidden');
        $('#paidCompletely').removeClass('hidden');
        $('#paidCompletely').val(_this.currencyFormat(data.paidAmount));
        $('#paymentMethod').prop('disabled', true);
      } else {
        $('#paymentMethod').prop('disabled', false);
        $('#paymentCode').prop('disabled', false);
        $('#paymentDate').prop('disabled', false);
        $('#btnFormTakePayment').prop('disabled', false);
        $('#paidCompletely').addClass('hidden');
        $('#paymentMethod').prop('disabled', false);

        //handle paid amount with currencyFormat
        $('#paidAmount').removeClass('hidden');
        $('#paidAmount').val(_this.currencyFormat(data.paidAmount));
        $('#paidAmount').attr('data-value', data.paidAmount);
      }

    }
  }

  onChangePaidAmount() {
    let _this = this;

    //focus to input => remove val
    $('#paidAmount').focus(() => {
      $('#paidAmount').val('')
    })

    //format to currency if blur
    $('#paidAmount').blur(() => {
      let value = $('#paidAmount').val();
      if (value == '') {
        $('#paidAmount').val(_this.currencyFormat($('#paidAmount').attr('data-value')));
      } else {
        $('#paidAmount').attr('data-value', value);
        $('#paidAmount').val(_this.currencyFormat($('#paidAmount').attr('data-value')));
      }
    })
  }

  initDatePicker() {
    let dateFormat = $('#date').attr('data-dateFormat').toLowerCase();
    $('#date').datepicker({
      format: dateFormat,
      todayHighlight: true,
      autoclose: true
    });
  }
}

class ListFeeInvoiceBackendEKP {
  constructor(opts) {
    _.extend(this, opts);
    this.langUrl = this.lang == 'en' ? '' : '/js/backend/datatable.json';
    this.tblId = 'tblFeeInvoice';
    this.tableObj = $('#' + this.tblId);
    this.checkAll = null;
    this.listChecked = '';
    this.initialize();
  }

  initialize() {
    let _this = this;
    // $('.js-height-scrollbar').perfectScrollbar();
    _this.initDataTable('', '-1', '');
    _this.initSelectStudents('', '');
    _this.handleItemActions();
    _this.onChangeTableFeeInvoice();
  }

  initDataTable(feeInvoiceIds, classId, studentId) {
    let _this = this;
    let params = {};
    //ONCLICK EDIT LINK
    // let searchParams = new URLSearchParams(window.location.search);
    // params.classId = _this.tableObj.attr('data-classActive') || searchParams.get('classId');
    // params.branchActive = _this.tableObj.attr('data-branchActive') || searchParams.get('branchId');

    // if (!(params.classId && params.classId != '0' && params.classId != '' && params.classId != 'undefined' && params.classId != 'null')) params.classId = -1;
    // $(".js-select2-class").val(params.classId).change();

    //cloud success
    var table = this.tableObj.DataTable({
      "language": {
        "url": this.langUrl
      },
      "processing": true,
      "serverSide": true,
      "ajax": `/api/v1/backend/feeInvoice/search?ids=${feeInvoiceIds}&classId=${classId}&studentId=${studentId}`,
      //Add column data (JSON) mapping from AJAX to TABLE
      "columns": [
        { "data": "code" },
        { "data": "fullName" },
        { "data": "dateOfBirth" },
        { "data": "gender" },
        { "data": "class" },
        { "data": "title" },
        { "data": "totalAmount" },
        { "data": "method" },
        { "data": "status" },
        { "data": "action" }
      ],
      //Define first column without order
      columnDefs: [
        { "orderable": false, "targets": [0, 1, 2, 3, 4, -1] }
      ],
      "order": [],
      "iDisplayLength": 50,
      "bLengthChange": false,
      "aLengthMenu": [[10, 20, 50, -1], [10, 20, 50, "All"]],
      "pagingType": "numbers",
      "sDom": "<'row'<'col-sm-6'l><'col-sm-6'f>>" + "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-5'i><'col-sm-7'p>>",
      // "paging": false,
      "searching": false,
      "bDestroy": true,
      "initComplete": function (settings, json) {
        console.log('init datatable fee invoice complete!');
      }
    });
  }

  initSelectStudents(classId, studentId) {
    Cloud.searchStudentFeeInvoice.with({ classId: classId, studentId: studentId }).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
      if (err) {
        console.log(err);
      } else {
        let listStudents = responseBody.data;

        $('#studentId').html('');
        $('#studentId').append(new Option(responseBody.allStudents, ''));
        for (let studentObj of listStudents) {
          $('#studentId').append(new Option(studentObj.fullName, studentObj._id));
        }
      }
      //cloud success
    });
  }

  onChangeTableFeeInvoice() {
    let _this = this;

    $('#classId').change(() => {
      let classId = $('#classId').val();
      //let studentId = $('#studentId').val();
      _this.initDataTable('', classId, '');
      _this.initSelectStudents(classId, '');
    })
    $('#studentId').change(() => {
      let studentId = $('#studentId').val();
      let classId = $('#studentId').val();
      _this.initDataTable('', classId, studentId);
    })
  }

  handleItemActions() {
    let _this = this;
    //ONCLICK EDIT LINK
    _this.tableObj.on('click', '.take-payment-row', function (e) {
      e.preventDefault();
      let id = $(this).attr('data-id');
      //get AJAX data
      Cloud.getFeeInvoice.with({ id: id }).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
        if (err) {
          console.log(err);
          return;
        }
        //AJAX success
        let _data = responseBody.feeInvoice;
        let _currentForm = window.curBackendEKP.formTakePayment;
        //Render data from response to form
        _currentForm.renderFormData(_data);
      })
    });
    //END ONCLICK EDIT LINK

    //ONCLICK REMOVE (TRASH) LINK
    _this.tableObj.on('click', '.remove-row', function (e) {
      let id = $(this).attr('data-id');
      _this.initSweetAlert(id)

    });
    //END ONCLICK REMOVE (TRASH) LINK
  }

  //TRASH
  initSweetAlert(id) {
    let _this = this;
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
        Cloud.deleteFeeInvoice.with({ ids: id, _csrf: $('[name="_csrf"]').val() }).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
          if (err) {
            console.log(err);
            return;
          } else if (responseBody) {
            swal({
              title: this.messages.deleteSuccessfully,
              icon: 'success',
              closeOnClickOutside: false,
              button: {
                text: this.messages.continue,
                value: true,
                visible: true,
                className: "btn btn-primary"
              }
            }).then((value) => {
              //   //THEN RELOAD PAGE IF NEEDED
              // location.reload();

              //RELOAD TABLE
              _this.initDataTable('', '', '');
            })
          }
        })
      }
    });
  }
  //END TRASH

}
