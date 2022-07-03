class FormFeeInvoiceBackendEKP extends BaseBackendEKP {
  constructor() {
    super();
    this.initialize();
  }

  initialize() {
    //DO NOT LOAD UNNESSESARY CLASS
    const currencyFormat = num => (Math.round(num * 1000) / 1000).toFixed($('#formAddFeeInvoice').attr('data-decimalPlaces')).replace('.', $('#formAddFeeInvoice').attr('data-decimalPoint')).replace(/\B(?=(\d{3})+(?!\d))/g, $('#formAddFeeInvoice').attr('data-numberSeperatorSymbol'));
    this.currencyFormat = currencyFormat;

    this.form = new AddFeeInvoiceBackendEKP(this);
    this.list = new ListFeeInvoiceBackendEKP(this);
    this.editForm = new EditFeeInvoiceBackendEKP(this);
    this.feeInvoiceIds = [];

    $('.js-height-scrollbar').perfectScrollbar();
    $('.js-process-basic-multiple').select2({ width: '100%'});
  }
}

class AddFeeInvoiceBackendEKP {
  constructor(opts) {
    _.extend(this, opts);
    this.formId = 'formAddFeeInvoice';
    this.formObj = $('#' + this.formId);
    this.title = $('.modal-title');
    this.alert = this.formObj.find('.alert');
    this.btnSubmit = this.formObj.find('button[type="submit"]');
    this.btnReset = this.formObj.find('button[type="reset"]');

    this.langUrl = this.lang == 'en' ? '' : '/js/backend/datatable.json';
    this.tblId = 'tblStudentFormAdd';
    this.tableObj = $('#' + this.tblId);
    this.checkAll = null;
    this.listChecked = '';

    this.initialize();
  }

  initialize() {
    let _this = this;
    _this.initSubmitForm();
    _this.initDatePicker();
    _this.initValidation();
    _this.initRepeater();
    _this.initCheckAll();
    _this.initGetFeeItem();
    _this.initChangeFeeItem();
    _this.initDataTableStudent('','');
    _this.onChangeTableStudent();
    $('.js-process-basic-multiple').select2();
    _this.listFeeItems = [];
  }

  initSubmitForm() {
    let _this = this;
    $('#btnNext').click(() => {
      $('#btnFormAddFeeInvoice').click();
    })
  }

  initDatePicker() {
    let dateFormat = $('#date').attr('data-dateFormat').toLowerCase();
    if(dateFormat == 'mmm dd yyyy') dateFormat = 'MM dd yyyy';
    let startDate = $('#date').attr('data-currentDate');
    $('#date').datepicker({
      format: dateFormat,
      todayHighlight: true,
      autoclose: true,
      startDate: startDate
    });
  }

  initValidation() {
    let _this = this;
    _this.formObj.formValidation({
      button: {
        selector: '#btnFormAddFeeInvoice',
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
      console.log('----- FORM FEE ITEM ----- [SUBMIT][START]');
      let $form = $(e.target);
      let formData = $form.serializeArray();
      let tmpData = {};
      _.each(formData, (item) => {
        if (!item.name.includes('items')) {
        tmpData[item.name] = item.value;
        }
      });
      tmpData.students = _this.listChecked;

      //get all array {feeItem + numberOfItems + amountPerItem} of all repeater
      let tmpItems = $('.repeaterFormAdd').repeaterVal();
      tmpData.items = tmpItems.items;
      if (tmpData.items.length == 0) {
        _this.alert.removeClass('d-none alert-success').addClass("alert-danger").html('Fee item and number per item is required!');
        setTimeout(function(){
          _this.alert.removeClass('alert-danger').addClass("d-none");
        }, 3000);
      } else {
        //check data slot items empty
        let isValid = true;
        for (let slot of tmpData.items) {
          if (slot.feeItem == '' || slot.numberOfItems == '' ) { isValid = false; }
        }
        if (isValid) {
          let manner = _this.formObj.attr('data-manner');
          //reset form validator
          if (manner === 'add') {
            Cloud.addFeeInvoice.with(tmpData).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
              if (err) {
                if (responseBody.message) {
                  _this.alert.removeClass('d-none').addClass("alert-warning").html(responseBody.message);
                  setTimeout(function(){
                    _this.alert.removeClass('alert-warning').addClass("d-none");
                  }, 3000);
                  return;
                } else {
                  _this.alert.removeClass('d-none').addClass("alert-danger").html(_this.messages.error);
                  setTimeout(function(){
                    _this.alert.removeClass('alert-danger').addClass("d-none");
                  }, 3000);
                  return;
                }
              } else {
                //hide form add, btn form add and show list edit,btn list edit
                $('#listEditFeeInvoiceContainer').removeClass('hidden');
                $('#btnPublicFeeInvoice').removeClass('hidden');
                $('#formAddFeeInvoiceContainer').addClass('hidden');
                $('#btnFormAddFeeInvoiceContainer').addClass('hidden');

                //render list edit fee invoice
                _this.feeInvoiceIds = responseBody;
                _this.list = new ListFeeInvoiceBackendEKP(_this);
                let _currentList = window.curBackendEKP.list;
                _currentList.feeInvoiceIds = responseBody;
                //Render data from response to edit
                _currentList.initDataTable(responseBody, '', '');


                let _currentForm = window.curBackendEKP.editForm;
                _currentForm.feeInvoiceIds = responseBody;
              }
              //cloud success
            });
          }
          console.log('----- FORM FEE ITEM ----- [SUBMIT][END]');
        } else {
          _this.alert.removeClass('d-none alert-success').addClass("alert-danger").html('Fee item and number per item is required!');
          setTimeout(function(){
            _this.alert.removeClass('alert-danger').addClass("d-none");
          }, 3000);
        }
      }
    });
  }

  initRepeater() {
    let _this = this;
    $('.repeaterFormAdd').repeater({
      defaultValues: {
        'text-input': 'foo'
      },
      show: function () {
        $(this).slideDown();
      },
      hide: function (deleteElement) {
        _this.initSweetAlert($(this), deleteElement);
      },
      isFirstItemUndeletable: true
    });
  }

  initGetFeeItem() {
    let _this = this;
    Cloud.searchFeeItem.with({}).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
      if (err) {
        console.log(err);
      } else {
        _this.listFeeItems = responseBody.data;
        console.log(_this.listFeeItems);
      }
      //cloud success
    });
  }

  initChangeFeeItem() {
    let _this = this;
    //on change feeItem
    _this.formObj.on('change', '.feeItemFormAdd', function (e) {
      e.preventDefault();
      //get name of field in current row
      let feeItems = _this.listFeeItems.filter(item => item.id == $(this).val());
      let feeItemName = $(this).attr('name');
      let amountPerItemName = feeItemName.replace('feeItem', 'amountPerItem');
      let numberOfItemsName = feeItemName.replace('feeItem', 'numberOfItems');
      let numberOfItemsValueName = feeItemName.replace('feeItem', 'numberOfItemsValue');
      let totalPerItemName = feeItemName.replace('feeItem', 'totalPerItem');
      console.log('select fee items: ');
      console.log(feeItems[0]);

      if (feeItems[0]) {
        //set value for other field in current row
        _this.formObj.find('input[name="' + amountPerItemName + '"]').val(_this.currencyFormat(feeItems[0].amount));
        _this.formObj.find('input[name="'+numberOfItemsName+'"]').val(1);
        _this.formObj.find('input[name="'+numberOfItemsValueName+'"]').val(1);
        _this.formObj.find('input[name="' + totalPerItemName + '"]').val(_this.currencyFormat(feeItems[0].amount));

        _this.formObj.find('input[name="' + amountPerItemName + '"]').attr('data-value', feeItems[0].amount);
        _this.formObj.find('input[name="' + totalPerItemName + '"]').attr('data-value', feeItems[0].amount);
      } else {
        _this.formObj.find('input[name="' + amountPerItemName + '"]').val(0);
        _this.formObj.find('input[name="'+numberOfItemsName+'"]').val(0);
        _this.formObj.find('input[name="'+numberOfItemsValueName+'"]').val(0);
        _this.formObj.find('input[name="' + totalPerItemName + '"]').val(0);

        _this.formObj.find('input[name="' + amountPerItemName + '"]').attr('data-value', 0);
        _this.formObj.find('input[name="' + totalPerItemName + '"]').attr('data-value', 0);
      }
      //reset totalAmount
      let totalAmountFormAdd = 0;
      let arr = $(".totalPerItemFormAdd");
      for (let i = 0; i < arr.length; i++){
        let value = parseFloat($(arr[i]).attr('data-value'));
        if (!isNaN(value)) {
          totalAmountFormAdd += value ;
        }
      }
      $('#totalAmountFormAdd').attr('data-value', totalAmountFormAdd);
      $('#totalAmountFormAdd').val(_this.currencyFormat(totalAmountFormAdd));
    })

    //on change numberOfItems
    _this.formObj.on('change', '.numberOfItemsFormAdd', function (e) {
      e.preventDefault();

      //get name of field in current row
      let numberOfItemsName = $(this).attr('name');

      let numberOfItemsValueName = numberOfItemsName.replace('numberOfItems', 'numberOfItemsValue');
      _this.formObj.find('input[name="' + numberOfItemsValueName + '"]').val(parseFloat($(this).val()));

      let feeItemName = numberOfItemsName.replace('numberOfItems', 'feeItem');
      let feeItems = _this.listFeeItems.filter(item => item.id == _this.formObj.find('select[name="' + feeItemName + '"]').val());
      let amountPerItemName = numberOfItemsName.replace('numberOfItems', 'amountPerItem');
      let totalPerItemName = numberOfItemsName.replace('numberOfItems', 'totalPerItem');
      console.log('select fee items: ');
      console.log(feeItems[0]);

      if (feeItems[0]) {
        //set value for other field in current row
        _this.formObj.find('input[name="' + amountPerItemName + '"]').val(_this.currencyFormat(feeItems[0].amount));
        _this.formObj.find('input[name="' + totalPerItemName + '"]').val(_this.currencyFormat(feeItems[0].amount * parseFloat($(this).val())));

        _this.formObj.find('input[name="'+amountPerItemName+'"]').attr('data-value',feeItems[0].amount);
        _this.formObj.find('input[name="' + totalPerItemName + '"]').attr('data-value', feeItems[0].amount * parseFloat($(this).val()));
      } else {
        _this.formObj.find('input[name="'+amountPerItemName+'"]').val(0);
        _this.formObj.find('input[name="' + totalPerItemName + '"]').val(0);

        _this.formObj.find('input[name="'+amountPerItemName+'"]').attr('data-value', 0);
        _this.formObj.find('input[name="'+totalPerItemName+'"]').attr('data-value', 0);
      }
      //reset totalAmount
      let totalAmountFormAdd = 0;
      let arr = $(".totalPerItemFormAdd");
      for (let i = 0; i < arr.length; i++){
        let value = parseFloat($(arr[i]).attr('data-value'));
        if (!isNaN(value)) {
          totalAmountFormAdd += value ;
        }
      }
      $('#totalAmountFormAdd').val(_this.currencyFormat(totalAmountFormAdd));
      $('#totalAmountFormAdd').attr('data-value', totalAmountFormAdd);
    })
  }

  initSweetAlert(element, deleteElement) {
    swal({
      title: this.messages.deleteRow,
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
        element.slideUp(deleteElement);

        let totalAmountOfDeleteItem = element.find('.totalPerItemFormAdd').attr('data-value');
        //update totalAmount
        $('#totalAmountFormAdd').val(this.currencyFormat(parseFloat($('#totalAmountFormAdd').attr('data-value')) - parseFloat(totalAmountOfDeleteItem)));
        $('#totalAmountFormAdd').attr('data-value', parseFloat($('#totalAmountFormAdd').attr('data-value')) - parseFloat(totalAmountOfDeleteItem));
      }
    });
  }

  initDataTableStudent(classId, studentId) {
    let _this = this;
    //cloud success
    var table = this.tableObj.DataTable({
      "language": {
        "url": this.langUrl
      },
      "processing": false,
      "serverSide": true,
      "ajax": `/api/v1/backend/feeInvoice/searchStudent?classId=${classId}&studentId=${studentId}`,
      //Add column data (JSON) mapping from AJAX to TABLE
      "columns": [
        { "data": "id" },
        { "data": "code" },
        { "data": "fullName" },
        { "data": "dateOfBirth" },
        { "data": "gender" }
      ],
      //Define first column without order
      // columnDefs: [
      //   { "orderable": false, "targets": [0] }
      // ],
      "order": [[1, "DESC"]],
      "pagingType": "numbers",
      "searching": false,
      "bInfo": false,
      "iDisplayLength": 10,
      "bLengthChange": false,
      // "sDom": "<'row'<'col-sm-6'l><'col-sm-6'f>>" + "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-5'i><'col-sm-7'p>>",
      "bDestroy": true,
      "initComplete": function (settings, json) {
        _this.initCheckList();
      }
    });

    table.on('xhr', function () {
      if (studentId == '') {
        var listStudents = table.ajax.json();
        $('#studentIdFormAdd').html('');
        $('#studentIdFormAdd').append(new Option(_this.messages.allStudent, ''));
        for (let studentObj of listStudents.data) {
          $('#studentIdFormAdd').append(new Option(studentObj.fullName, studentObj._id));
        }
      }
    } );

    table.on('draw', function () {
      $('.js-checkbox-item').on('change', (e) => {
        let selectItem = [];
        e.preventDefault();
        $.each($("input.js-checkbox-item:checked"), function () {
          selectItem.push($(this).val());
        });
        console.log("===========================SELECT ELEMENT LENGTH============================");
        console.log(selectItem.length);

        _this.listChecked = selectItem.toString().replace(/,/g, ';');
        console.log("===========================SELECT ELEMENT============================");
        console.log(_this.listChecked);
      });
    });
  }

  onChangeTableStudent() {
    let _this = this;

    $('#classIdFormAdd').change(() => {
      let classId = $('#classIdFormAdd').val();
      let studentId = $('#studentIdFormAdd').val();
      _this.initDataTableStudent(classId, studentId);
    })
    $('#studentIdFormAdd').change(() => {
      let studentId = $('#studentIdFormAdd').val();
      let classId = $('#classIdFormAdd').val();
      _this.initDataTableStudent(classId, studentId);
    })
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

  //CHECK ALL
  initCheckAll() {
    let _this = this;
    this.checkAll = new CheckBoxBackendEKP({
      isChkAll: true,
      selector: '#js-check-all',
      childSelector: '.js-checkbox-item',
      onChange: function (e, value) {
        console.log("===========================ONCHANGE SELECT ELEMENT============================");
        console.log(value);
        _this.listChecked = value;
      }
    });
  }
}

class ListFeeInvoiceBackendEKP {
  constructor(opts) {
    _.extend(this, opts);
    this.langUrl = this.lang == 'en' ? '' : '/js/backend/datatable.json';
    this.tblId = 'tblFeeInvoice';
    this.tableFeeInvoice = $('#' + this.tblId);
    this.initialize();
  }

  initialize() {
    let _this = this;
    _this.initSelectStudents('','');
    _this.onChangeTableFeeInvoice();
    _this.initSweetAlertPublicFeeInvoice();
  }

  initDataTable(feeInvoiceIds, classId, studentId) {
    let _this = this;

    //cloud success
    var table = this.tableFeeInvoice.DataTable({
      "language": {
        "url": this.langUrl
      },
      "processing": true,
      "serverSide": true,
      "ajax": `/api/v1/backend/feeInvoice/search?ids=${feeInvoiceIds}&studentId=${studentId}&classId=${classId}`,
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
        { "data": "tool"}
      ],
      //Define first column without order
      columnDefs: [
        { "orderable": false, "targets": [-1] }
      ],
      "order": [[1, "DESC"]],
      "paging": false,
      "searching": false,
      "bInfo" : false,
      "bDestroy": true,
      "initComplete": function (settings, json) {
        _this.handleItemActions();
        console.log('init datatable fee invoice complete!');
      }
    });
  }

  initSelectStudents(classId, studentId) {
    Cloud.searchStudentFeeInvoice.with({classId: classId, studentId: studentId}).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
      if (err) {
        console.log(err);
      } else {
        let listStudents = responseBody.data;

        $('#studentIdListEdit').html('');
        $('#studentIdListEdit').append(new Option('---', ''));
        for (let studentObj of listStudents) {
          $('#studentIdListEdit').append(new Option(studentObj.fullName, studentObj._id));
        }
      }
      //cloud success
    });
  }

  onChangeTableFeeInvoice() {
    let _this = this;

    $('#classIdListEdit').change(() => {
      let classId = $('#classIdListEdit').val();
      let studentId = $('#studentIdListEdit').val();
      _this.initDataTable(_this.feeInvoiceIds, classId, studentId);
      _this.initSelectStudents(classId, '');
    })
    $('#studentIdListEdit').change(() => {
      let studentId = $('#studentIdListEdit').val();
      let classId = $('#studentIdListEdit').val();
      _this.initDataTable(_this.feeInvoiceIds, classId, studentId);
    })
  }

  handleItemActions() {
    let _this = this;
    //ONCLICK EDIT LINK
    _this.tableFeeInvoice.on('click', '.edit-row', function (e) {
      e.preventDefault();
      let id = $(this).attr('data-id');
      //get AJAX data
      Cloud.getFeeInvoice.with({ id: id }).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
        if (err) {
          console.log(err);
          return;
        }
        //AJAX success
        let _data = responseBody;
        let _currentForm = window.curBackendEKP.editForm;
        //Render data from response to edit
        _currentForm.handlerEditFeeInvoice(_data);
      })
    });
    //END ONCLICK EDIT LINK

    //ONCLICK REMOVE LINK
    _this.tableFeeInvoice.on('click', '.remove-row', function (e) {
      let id = $(this).attr('data-id');
      _this.initSweetAlertDeleteFeeInvoice(id)

    });
    //END ONCLICK REMOVE LINK
  }

  //TRASH
  initSweetAlertDeleteFeeInvoice(id) {
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
        Cloud.deleteFeeInvoice.with({ ids: id,  _csrf: $('[name="_csrf"]').val() }).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
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
              //RELOAD TABLE
              let classId = $('#classIdListEdit').val();
              let studentId = $('#studentIdListEdit').val();
              _this.initDataTable(_this.feeInvoiceIds, classId, studentId);
            })
          }
        })
      }
    });
  }
  //END TRASH

  //TRASH
  initSweetAlertPublicFeeInvoice() {
    $('#btnPublicFeeInvoice').click(() => {
      let _this = this;
      swal({
        title: this.messages.publicFeeInvoicePopup,
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
          Cloud.publicFeeInvoice.with({ ids: _this.feeInvoiceIds,  _csrf: $('[name="_csrf"]').val() }).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
            if (err) {
              console.log(err);
              return;
            } else if (responseBody) {
              swal({
                title: this.messages.publicFeeInvoiceSuccessfully,
                icon: 'success',
                closeOnClickOutside: false,
                button: {
                  text: this.messages.continue,
                  value: true,
                  visible: true,
                  className: "btn btn-primary"
                }
              }).then((value) => {
                //REDIRECT TO PAGE FEE INVOICE
                window.location.href = '/backend/feeInvoice'
              })
            }
          })
        }
      });
    })
  }
  //END TRASH

}

class EditFeeInvoiceBackendEKP {
  constructor(opts) {
    _.extend(this, opts);
    this.formId = 'formEditFeeInvoice';
    this.formEditFeeInvoiceObj = $('#' + this.formId);
    this.alert = this.formEditFeeInvoiceObj.find('.alert');
    this.btnSubmit = this.formEditFeeInvoiceObj.find('button[type="submit"]');
    this.btnReset = this.formEditFeeInvoiceObj.find('button[type="reset"]');

    this.initialize();
  }

  initialize() {
    let _this = this;
    _this.initValidation();
    _this.listFeeItems = [];
  }

  initValidation() {
    let _this = this;
    _this.formEditFeeInvoiceObj.formValidation({
      button: {
        selector: '#btnFormEditFeeInvoice',
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
        console.log('----- FORM EDIT FEE ITEM ----- [SUBMIT][START]');
        let $form = $(e.target);
        let formData = $form.serializeArray();
        let tmpData = {};
        _.each(formData, (item) => {
          if (!item.name.includes('items')) {
          tmpData[item.name] = item.value;
          }
        });

        //get all array {feeItem + numberOfItems + amountPerItem} of all repeater
        let tmpItems = $('.repeaterFormEdit').repeaterVal();
        tmpData.items = tmpItems.items;
        if (tmpData.items.length == 0) {
          _this.alert.removeClass('d-none alert-success').addClass("alert-danger").html('Fee item and number per item is required!');
          setTimeout(function(){
            _this.alert.removeClass('alert-danger').addClass("d-none");
          }, 3000);
        } else {
          //check data slot items empty
          let isValid = true;
          for (let slot of tmpData.items) {
            if (slot.feeItem == '' || slot.numberOfItems == '' ) { isValid = false; }
          }
          if (isValid) {
            let manner = _this.formEditFeeInvoiceObj.attr('data-manner');
            //reset form validator
            if (manner === 'edit') {
              tmpData.id = _this.formEditFeeInvoiceObj.attr('data-id');
              Cloud.editFeeInvoice.with(tmpData).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
                if (err) {
                  if (responseBody.message) {
                    _this.alert.removeClass('d-none').addClass("alert-warning").html(responseBody.message);
                    setTimeout(function(){
                      _this.alert.removeClass('alert-warning').addClass("d-none");
                    }, 3000);
                    return;
                  } else {
                    _this.alert.removeClass('d-none').addClass("alert-danger").html(_this.messages.error);
                    setTimeout(function(){
                      _this.alert.removeClass('alert-danger').addClass("d-none");
                    }, 3000);
                    return;
                  }
                } else {
                  let _currentList = window.curBackendEKP.list;
                  //Render data from response to edit
                  let classId = $('#classIdListEdit').val();
                  let studentId = $('#studentIdListEdit').val();
                  _currentList.initDataTable(_this.feeInvoiceIds, classId, studentId);

                  _this.alert.removeClass('d-none').addClass("alert-success").html(_this.messages.editSuccess);
                  setTimeout(function(){
                    _this.alert.removeClass('alert-success').addClass("d-none");
                  }, 3000);
                  return;
                }
                //cloud success
              });
            }
            console.log('----- FORM EDIT FEE ITEM ----- [SUBMIT][END]');
          } else {
            _this.alert.removeClass('d-none alert-success').addClass("alert-danger").html('Fee item and number per item is required!');
            setTimeout(function(){
              _this.alert.removeClass('alert-danger').addClass("d-none");
            }, 3000);
          }
        }
      });
  }

  handlerEditFeeInvoice(data) {
    let _this = this;
    let dataFeeInvoice = data.feeInvoice;
    let listFeeItems = data.listFeeItems;
    _this.listFeeItems = listFeeItems;

    _this.formEditFeeInvoiceObj.attr('data-id', dataFeeInvoice.id);
    $('#titleFormEdit').val(dataFeeInvoice.title);
    $('#totalAmountFormEdit').val(_this.currencyFormat(dataFeeInvoice.totalAmount));

    console.log('show');
    let renderListFeeInvoice = '';
    _this.countSlot = dataFeeInvoice.items.length + 1;
    // render html & select subject
    for (let i = 0; i < dataFeeInvoice.items.length; i++) {
      // render list subjects for tag select
      let feeItemIds = [];
      let htmlOption = '';
      if (listFeeItems.length > 0) {
        _.each(listFeeItems, function (feeItem, idx) {
          feeItemIds.push(feeItem.id);
        });
      }
      _.each(listFeeItems, function (feeItem, idx) {
        htmlOption += `<option value="${feeItem.id}" ${feeItem.id == dataFeeInvoice.items[i].feeItem ? 'selected' : ''}>${feeItem.title}</option>`
      });
      renderListFeeInvoice +=
        `<div data-repeater-item class="row">
          <div class="col-3">
            <div class="form-group">
              <select name="items[${i}][feeItem]" class="form-control feeItemFormEdit"
              data-placeholder="<%= __('Choose') %>">
                <option value="">---</option>
                ${htmlOption}
              </select>
            </div>
          </div>
          <div class="col-2">
            <div class="form-group">
              <input type="text" name="items[${i}][amountPerItem]" class="form-control amountPerItemFormEdit" style="text-align: end;" disabled value="${dataFeeInvoice.items[i].amountPerItem ? _this.currencyFormat(dataFeeInvoice.items[i].amountPerItem) : '' }" data-value="${dataFeeInvoice.items[i].amountPerItem ? dataFeeInvoice.items[i].amountPerItem : '' }" />
            </div>
          </div>
          <div class="col-2">
            <div class="form-group">
                <input type="number" name="items[${i}][numberOfItems]" class="form-control numberOfItemsFormEdit" value="${dataFeeInvoice.items[i].numberOfItems ? dataFeeInvoice.items[i].numberOfItems : '' }" />
                <input type="text" name="items[${i}][numberOfItemsValue]" class="form-control hidden" value="${dataFeeInvoice.items[i].numberOfItems ? dataFeeInvoice.items[i].numberOfItems : '' }" />
            </div>
          </div>
          <div class="col-2">
            <div class="form-group">
                <input type="text" name="items[${i}][totalPerItem]" class="form-control totalPerItemFormEdit" style="text-align: end;" disabled value="${dataFeeInvoice.items[i].totalPerItem ? _this.currencyFormat(dataFeeInvoice.items[i].totalPerItem) : '' }" data-value="${dataFeeInvoice.items[i].totalPerItem ? dataFeeInvoice.items[i].totalPerItem : '' }" />
            </div>
          </div>
          <div class="col-3 d-flex align-items-center">
            <button data-repeater-delete type="button" class="btn btn-danger btn-sm icon-btn ml-2">
              <i class="mdi mdi-delete"></i>
            </button>
          </div>
        </div>`
    }
    $('.itemsFormEdit').empty();
    $('.itemsFormEdit').append(renderListFeeInvoice);
    _this.initRepeaterFormEdit();
    _this.initChangeFeeItemFormEdit();
  }

  initRepeaterFormEdit() {
    let _this = this;
    $('.repeaterFormEdit').repeater({
      defaultValues: {
        'text-input': 'foo'
      },
      show: function () {
        $(this).slideDown();
      },
      hide: function (deleteElement) {
        _this.initSweetAlertFormEdit($(this), deleteElement);
      },
      isFirstItemUndeletable: true
    });
  }

  initSweetAlertFormEdit(element, deleteElement) {
    swal({
      title: this.messages.deleteRow,
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
        element.slideUp(deleteElement);

        let totalAmountOfDeleteItem = element.find('.totalPerItemFormEdit').attr('data-value');
        //update totalAmount
        $('#totalAmountFormEdit').val(this.currencyFormat(parseFloat($('#totalAmountFormEdit').attr('data-value')) - parseFloat(totalAmountOfDeleteItem)));
        $('#totalAmountFormEdit').attr('data-value', parseFloat($('#totalAmountFormEdit').attr('data-value')) - parseFloat(totalAmountOfDeleteItem));
      }
    });
  }

  initChangeFeeItemFormEdit() {
    let _this = this;
    //on change feeItem
    _this.formEditFeeInvoiceObj.on('change', '.feeItemFormEdit', function (e) {
      e.preventDefault();
      //get name of field in current row
      let feeItems = _this.listFeeItems.filter(item => item.id == $(this).val());
      let feeItemName = $(this).attr('name');
      let amountPerItemName = feeItemName.replace('feeItem', 'amountPerItem');
      let numberOfItemsName = feeItemName.replace('feeItem', 'numberOfItems');
      let numberOfItemsValueName = feeItemName.replace('feeItem', 'numberOfItemsValue');
      let totalPerItemName = feeItemName.replace('feeItem', 'totalPerItem');
      console.log('select fee items: ');
      console.log(feeItems[0]);

      if (feeItems[0]) {
        //set value for other field in current row
        _this.formEditFeeInvoiceObj.find('input[name="' + amountPerItemName + '"]').val(_this.currencyFormat(feeItems[0].amount));
        _this.formEditFeeInvoiceObj.find('input[name="'+numberOfItemsName+'"]').val(1);
        _this.formEditFeeInvoiceObj.find('input[name="'+numberOfItemsValueName+'"]').val(1);
        _this.formEditFeeInvoiceObj.find('input[name="' + totalPerItemName + '"]').val(_this.currencyFormat(feeItems[0].amount));

        _this.formEditFeeInvoiceObj.find('input[name="' + amountPerItemName + '"]').attr('data-value', feeItems[0].amount);
        _this.formEditFeeInvoiceObj.find('input[name="' + totalPerItemName + '"]').attr('data-value', feeItems[0].amount);
      } else {
        _this.formEditFeeInvoiceObj.find('input[name="' + amountPerItemName + '"]').val(0);
        _this.formEditFeeInvoiceObj.find('input[name="'+numberOfItemsName+'"]').val(0);
        _this.formEditFeeInvoiceObj.find('input[name="'+numberOfItemsValueName+'"]').val(0);
        _this.formEditFeeInvoiceObj.find('input[name="' + totalPerItemName + '"]').val(0);

        _this.formEditFeeInvoiceObj.find('input[name="' + amountPerItemName + '"]').attr('data-value', feeItems[0].amount);
        _this.formEditFeeInvoiceObj.find('input[name="' + totalPerItemName + '"]').attr('data-value', feeItems[0].amount);
      }
      //reset totalAmount
      let totalAmountFormEdit = 0;
      let arr = $(".totalPerItemFormEdit");
      for (let i = 0; i < arr.length; i++){
        let value = parseFloat($(arr[i]).attr('data-value'));
        if (!isNaN(value)) {
          totalAmountFormEdit += value ;
        }
      }
      $('#totalAmountFormEdit').val(_this.currencyFormat(totalAmountFormEdit));
      $('#totalAmountFormEdit').attr('data-value', totalAmountFormEdit);
    })

    //on change numberOfItems
    _this.formEditFeeInvoiceObj.on('change', '.numberOfItemsFormEdit', function (e) {
      e.preventDefault();

      //get name of field in current row
      let numberOfItemsName = $(this).attr('name');
      let numberOfItemsValueName = numberOfItemsName.replace('numberOfItems', 'numberOfItemsValue');
      _this.formEditFeeInvoiceObj.find('input[name="'+numberOfItemsValueName+'"]').val(parseFloat($(this).val()));
      let feeItemName = numberOfItemsName.replace('numberOfItems', 'feeItem');
      let feeItems = _this.listFeeItems.filter(item => item.id == _this.formEditFeeInvoiceObj.find('select[name="' + feeItemName + '"]').val());
      let amountPerItemName = numberOfItemsName.replace('numberOfItems', 'amountPerItem');
      let totalPerItemName = numberOfItemsName.replace('numberOfItems', 'totalPerItem');
      console.log('select fee items: ');
      console.log(feeItems[0]);

      if (feeItems[0]) {
        //set value for other field in current row
        _this.formEditFeeInvoiceObj.find('input[name="'+amountPerItemName+'"]').val(_this.currencyFormat(feeItems[0].amount));
        _this.formEditFeeInvoiceObj.find('input[name="' + totalPerItemName + '"]').val(_this.currencyFormat(feeItems[0].amount * parseFloat($(this).val())));

        _this.formEditFeeInvoiceObj.find('input[name="'+amountPerItemName+'"]').attr('data-value', feeItems[0].amount);
        _this.formEditFeeInvoiceObj.find('input[name="' + totalPerItemName + '"]').attr('data-value', feeItems[0].amount * parseFloat($(this).val()));
      } else {
        _this.formEditFeeInvoiceObj.find('input[name="'+amountPerItemName+'"]').val(0);
        _this.formEditFeeInvoiceObj.find('input[name="' + totalPerItemName + '"]').val(0);

        _this.formEditFeeInvoiceObj.find('input[name="'+amountPerItemName+'"]').attr('data-value', 0);
        _this.formEditFeeInvoiceObj.find('input[name="'+totalPerItemName+'"]').attr('data-value', 0);
      }
      //reset totalAmount
      let totalAmountFormEdit = 0;
      let arr = $(".totalPerItemFormEdit");
      for (let i = 0; i < arr.length; i++){
        let value = parseFloat($(arr[i]).attr('data-value'));
        if (!isNaN(value)) {
          totalAmountFormEdit += value ;
        }
      }
      $('#totalAmountFormEdit').val(_this.currencyFormat(totalAmountFormEdit));
      $('#totalAmountFormEdit').attr('data-value', totalAmountFormEdit);
    })
  }
}
