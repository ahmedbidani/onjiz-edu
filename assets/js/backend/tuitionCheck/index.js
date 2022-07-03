class IndexTuitionCheckBackendEKP extends BaseBackendEKP {
  constructor() {
    super();
    this.initialize();
  }

  initialize() {
    //DO NOT LOAD UNNESSESARY CLASS
    //Init form + list if page have BOTH  
    this.form = new FormIndexTuitionCheckBackendEKP();
    this.list = new ListIndexTuitionCheckBackendEKP(this);

  }
}

class FormIndexTuitionCheckBackendEKP {
  constructor(opts) {
    _.extend(this, opts);
    this.formId = 'formTuitionCheck';
    this.formObj = $('#' + this.formId);

    this.headline = this.formObj.find('.panel-title');
    this.alert = this.formObj.find('.alert');
    this.btnSubmit = this.formObj.find('button[type="submit"]');
    this.btnReset = this.formObj.find('button[type="reset"]');

    this.initialize();
  }

  initialize() {
    let _this = this;
    _this.initValidation();
    $('.js-process-basic-multiple').select2();
  }

  initForm() {
    let _this = this;

  }

  initValidation() {
    let _this = this;
    _this.formObj.formValidation({
      button: {
        selector: '#btnFormTuitionCheck',
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
        console.log('----- FORM TUITION CHECK ----- [SUBMIT][START]');
        let $form = $(e.target);
        let formData = $form.serializeArray();
        let tmpData = {};
        _.each(formData, (item) => {
          if (item.name == 'tuitionCheckgroup') {
            if (tmpData[item.name] == undefined) {
              tmpData[item.name] = [item.value];
            } else {
              tmpData[item.name].push(item.value);
            }
          } else {
            tmpData[item.name] = item.value;
          }
        });
        let manner = _this.formObj.attr('data-manner');
        //reset form validator
        if (manner === 'edit') {
          tmpData.id = _this.formObj.attr('data-edit-id');
          Cloud.editTuitionCheck.with(tmpData).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
            if (err) {
              _this.alert.removeClass('hidden alert-success').addClass("alert-danger").html(_this.messages.error);
              return;
            } else {
              if (responseBody.code) {
                _this.alert.removeClass('hidden alert-success').addClass("alert-danger").html(responseBody.message);
                return;
              }
              _this.alert.removeClass('hidden alert-danger').addClass("alert-success").html(_this.messages.editSuccess);
            }
            //cloud success
          });
        } else {
          Cloud.addTuitionCheck.with(tmpData).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
            if (err) {
              _this.alert.removeClass('hidden alert-success').addClass("alert-danger").html(_this.messages.error);
              return;
            } else {
              if (responseBody.code && responseBody.code == 'E006') {
                _this.alert.removeClass('hidden alert-success').addClass("alert-danger").html(responseBody.message);
                return;
              }
              _this.alert.removeClass('hidden alert-danger').addClass("alert-success").html(_this.messages.addSuccess);
            }
            //cloud success
          });
        }
        //THEN RELOAD TABLE IF NEEDED 
        window.curBackendEKP.list.initDataTable();
        console.log('----- FORM TUITION CHECK ----- [SUBMIT][END]');
      });
  }

  //Function render FORM DATA from AJAX
  //@param {String} status Form status: add or edit
  //@param {String} datas JSON data from AJAX
  renderFormData(status, datas) {
    let _this = this;
    if (status && status === 'edit') {
      _this.formObj.attr('data-manner', 'edit');
    } else {
      _this.formObj.attr('data-manner', 'add');
    }
    if (datas) {
      //map id -> form to edit
      _this.formObj.attr('data-edit-id', datas.id);
      //Update form fields (input + textarea) base on name of field
      _.each(datas, (value, key) => {
        if (key !== 'status') {
          //Status is radiobuton -> no update
          _this.formObj.find('[name="' + key + '"]').val(value);
        } else {
          //Update status radiobutton
          if (value == 1) {
            _this.formObj.find('#statusActive')[0].checked = true;
            _this.formObj.find('#statusDraft')[0].checked = false;
          } else {
            _this.formObj.find('#statusActive')[0].checked = false;
            _this.formObj.find('#statusDraft')[0].checked = true;
          }

        }
      });

      //Handle static data like title, headline, button when change from add to edit and otherwise
      //reset form validator
      if (status === 'edit') {
        _this.headline.text(_this.messages.headlineUpdate);
        _this.alert.html(_this.messages.editSuccess);
        _this.btnSubmit.text(_this.messages.update);
      } else {
        _this.headline.text(_this.messages.headlineAdd);
        _this.alert.html(_this.messages.addSuccess);
        _this.btnSubmit.text(_this.messages.add);
      }
      //End handle static data
    }
  }

}


class ListIndexTuitionCheckBackendEKP {
  constructor(opts) {
    _.extend(this, opts);

    this.langUrl = this.lang == 'en' ? '' : '/js/backend/datatable.json';
    this.tblId = 'tblTuitionCheck';
    this.tableObj = $('#' + this.tblId);
    this.selectClass = $('#selectClass');
    this.chkAll = null;

    this.initialize();
  }

  initialize() {
    let _this = this;
    _this.initDataTable();
    _this.handleItemActions();
    _this.initMoreAction();
    _this.initCheckAll();
    _this.showModal();
    _this.handlerChooseClass();

  }

  initDataTable() {
    let _this = this;
    let params = {};
    let searchParams = new URLSearchParams(window.location.search);
    params.paid = searchParams.get('paid') || '-1';
    params.tuitionId = searchParams.get('tuitionId') || '';
    params.classId = _this.tableObj.attr('data-classActive');
    //cloud success  
    var table = this.tableObj.DataTable({
      "language": {
        "url": this.langUrl
      },
      "processing": true,
      "serverSide": true,
      "ajax": "/api/v1/backend/report/tuition/search?paid=" + params.paid + "&tuitionId=" + params.tuitionId + "&classId=" + params.classId,

      //Add column data (JSON) mapping from AJAX to TABLE
      "columns": [
        { "data": "id" },
        { "data": "code" },
        { "data": "student" },
        { "data": "tuition" },
        { "data": "paid" }
      ],
      //Define first column without order
      "order": [],
      columnDefs: [
        { "orderable": false, "targets": [0, -1] }
      ],
      "iDisplayLength": 10,
      "aLengthMenu": [[10, 20, 50, -1], [10, 20, 50, "All"]],
      //"buttons": ['copy', 'excel', 'csv', 'pdf', 'print'],
      "pagingType": "numbers",
      //"sDom": "<'row'<'col-sm-6'><'col-sm-6 mb-10'B>>" + "<'row'<'col-sm-6'l><'col-sm-6'f>>" + "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-5'i><'col-sm-7'p>>",
      "sDom": "<'row'<'col-sm-6'l><'col-sm-6'f>>" + "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-5'i><'col-sm-7'p>>",
      "bDestroy": true
    });

    table.on('draw', function () {
      $('.js-checkbox-item').on('change', (e) => {
        let selectItem = [];
        e.preventDefault();
        $.each($("input.js-checkbox-item:checked"), function () {
          selectItem.push($(this).val());
        });
        _this.chkAll.value = selectItem.toString().replace(/,/g, ';');
        console.log("===========================SELECT ELEMENT============================");
        console.log(_this.chkAll.value);
      });
    });
  }

  showModal() {
    $(window).on('load', function () {
      $('#myModal').modal('show');
    });
  }

  handlerChooseClass() {
    let _this = this;
    // _this.selectClass.on('click', '#chooseClass0', function (e) {
    //   e.preventDefault();
    //   let classId = $(this).attr('data-classid');
    //   alert(classId);
    // });
    $("#selectClass").find("option").each(function (index) {
      console.log($(_this).data("classid"))
    })
  }

  handleItemActions() {
    let _this = this;
    //ONCLICK EDIT LINK
    _this.tableObj.on('click', '.edit-row', function (e) {
      e.preventDefault();
      let id = $(this).attr('data-id');
      //get AJAX data
      Cloud.getTuitionCheck.with({ id: id }).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
        if (err) {
          console.log(err);
          return;
        }
        //AJAX success 
        let _data = responseBody;
        let _currentForm = window.curBackendEKP.form;
        //Render data from response to form
        _currentForm.renderFormData('edit', _data);
        $('.js-process-basic-multiple').select2();

      })
    });
    //END ONCLICK EDIT LINK

    //ONCLICK DUPPLICATE LINK
    _this.tableObj.on('click', '.duplicate-row', function (e) {
      e.preventDefault();
      let id = $(this).attr('data-id');
      //get AJAX data
      Cloud.getTuitionCheck.with({ id: id }).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
        if (err) {
          console.log(err);
          return;
        }
        //AJAX success 
        let _data = responseBody;
        let _currentForm = window.curBackendEKP.form;
        //Render data from response to form
        _currentForm.renderFormData('add', _data);
      })
    });
    //END ONCLICK DUPPLICATE LINK

    //ONCLICK REMOVE (TRASH) LINK
    _this.tableObj.on('click', '.remove-row', function (e) {
      let id = $(this).attr('data-id');
      // confirm dialog
      alertify.confirm(this.messages.deletePopup, function () {
        // user clicked "ok"
        e.preventDefault();
        //get AJAX data
        Cloud.trashTuitionCheck.with({ ids: id }).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
          if (err) {
            console.log(err);
            return;
          }
          //THEN RELOAD TABLE IF NEEDED 
          window.curBackendEKP.list.initDataTable();
          location.reload();
        })
      }, function () {
        // user clicked "cancel" => do nothing
      });

    });
    //END ONCLICK REMOVE (TRASH) LINK
  }

  initMoreAction() {
    let _this = this;
    let btnTrash = $('.' + 'tuitionCheck' + '_page .dropdown-menu .act-trash-group');

    btnTrash.on('click', (e) => {
      e.preventDefault();
      let ids = _this.chkAll.value;
      if (_this.chkAll.value.indexOf(';') != -1) {
        ids = ids.split(';');
      }
      console.log(ids);

      // confirm dialog
      alertify.confirm(this.messages.deletePopup, function () {
        // user clicked "ok"
        e.preventDefault();
        if (ids != '') {
          Cloud.trashTuitionCheck.with({ ids: ids }).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
            if (err) {
              console.log(err);
              return;
            }
            //cloud success 
            window.location.reload();
          });
        }
      }, function () {
        // user clicked "cancel" => do nothing
      });
    });
  }

  initCheckAll() {
    this.chkAll = new CheckBoxBackendEKP({
      isChkAll: true,
      selector: '#js-check-all',
      childSelector: '.js-checkbox-item',
      onChange: function (e, value) {
        console.log("===========================ONCHANGE SELECT ELEMENT============================");
        console.log(value);
      }
    });
  }
}