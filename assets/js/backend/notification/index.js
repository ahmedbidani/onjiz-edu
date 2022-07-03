class IndexNotificationBackendEKP extends BaseBackendEKP {
  constructor() {
    super();
    this.initialize();
  }

  initialize() {
    //DO NOT LOAD UNNESSESARY CLASS
    //Init form + list if page have BOTH  
    this.form = new FormIndexNotificationBackendEKP(this);
    this.list = new ListIndexNotificationBackendEKP(this);

  }
}

class FormIndexNotificationBackendEKP {
  constructor(opts) {
    _.extend(this, opts);
    this.formId = 'formNotification';
    this.formObj = $('#' + this.formId);
    this.btnAdd = $('#btnAdd');
    this.title = $('.modal-title');
    this.alert = this.formObj.find('.alert');
    this.btnSubmit = this.formObj.find('button[type="submit"]');
    this.btnReset = this.formObj.find('button[type="reset"]');
    this.input1 = $('#title');
    this.input2 = $('#classList');
    this.input3 = $('#type');
    this.initialize();
  }

  initialize() {
    let _this = this;
    _this.initValidation();
    $('.js-process-basic-multiple').select2();
    _this.handleItemActions();
    _this.initEditorNotificationForm();
  }

  handleItemActions() {
    let _this = this;
    //ONCLICK ADD
    _this.btnAdd.click(function () {
      let _currentForm = window.curBackendEKP.form;
      //Render data from response to form
      _currentForm.renderFormData('add', {});
    })
    //END ONCLICK ADD
  }

  initValidation() {
    let _this = this;
    _this.formObj.formValidation({
        framework: 'bootstrap4',
        button: {
          selector: '#btnFormNotification   ',
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
          class: 'invalid-feedback'
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
        console.log('----- FORM NOTIFICATION ----- [SUBMIT][START]');
        let $form = $(e.target);
        let formData = $form.serializeArray();
        let tmpData = {};
        _.each(formData, (item) => {
          if (item.name == 'classList') {
            tmpData.classList = $('#classList').val();
          } else if (item.name == 'message') {
            tmpData.message = $('.card-block').html();
          } else {
            tmpData[item.name] = item.value;
          }
        });
        let manner = _this.formObj.attr('data-manner');
        //reset form validator
        if (manner === 'edit') {
          tmpData.id = _this.formObj.attr('data-edit-id');
          Cloud.editNotification.with(tmpData).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
            if (err) {
              _this.alert.removeClass('d-none').addClass("alert-danger").html(_this.messages.error);
              setTimeout(function () {
                _this.alert.removeClass('alert-danger').addClass("d-none");
              }, 3000);
              return;
            }
            _this.alert.removeClass('d-none').addClass("alert-success").html(_this.messages.editSuccess);
            setTimeout(function () {
              _this.alert.removeClass('alert-success').addClass("d-none");
            }, 3000);
            $('#btnFormNotification').removeAttr("disabled");
            $('#btnFormNotification').removeClass("disabled");

            //cloud success
          });
        } else {
          Cloud.addNotification.with(tmpData).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
            if (err) {
              _this.alert.removeClass('d-none').addClass("alert-danger").html(_this.messages.error);
              setTimeout(function () {
                _this.alert.removeClass('alert-danger').addClass("d-none");
              }, 3000);
              return;
            }
            _this.alert.removeClass('d-none').addClass("alert-success").html(_this.messages.addSuccess);
            setTimeout(function () {
              _this.alert.removeClass('alert-success').addClass("d-none");
            }, 3000);

            //cloud success
          });
        }
        //THEN RELOAD TABLE IF NEEDED 
        window.curBackendEKP.list.initDataTable();
        console.log('----- FORM NOTIFICATION ----- [SUBMIT][END]');
      });
  }

  renderFormData(status, datas) {
    let _this = this;
    if (status && status === 'edit') {
      _this.formObj.attr('data-manner', 'edit');
      if (datas) {
        //map id -> form to edit
        _this.formObj.attr('data-edit-id', datas.id);
        //Update form fields (input + textarea) base on name of field
        _.each(datas, (value, key) => {
          if (key === 'classList') {
            _.forEach(value, element => {
              _this.formObj.find('[name="' + key + '"] option[value="' + element + '"]').prop('selected', true);
            })
          } else if (key === 'message') {
            //  _this.formObj.find('[name="message"]').text(value);
            $('.card-block').html(value);
            _this.initEditorNotificationForm();
          } else if (key === 'type') {
            //Update status radiobutton
            if (value == -1) {
              _this.formObj.find('#typeParent')[0].checked = true;
              _this.formObj.find('#typeAll')[0].checked = false;
              _this.formObj.find('#typeTeacher')[0].checked = false;
            } else if (value == 0) {
              _this.formObj.find('#typeParent')[0].checked = false;
              _this.formObj.find('#typeAll')[0].checked = true;
              _this.formObj.find('#typeTeacher')[0].checked = false;
            } else if (value == 8) {
              _this.formObj.find('#typeParent')[0].checked = false;
              _this.formObj.find('#typeAll')[0].checked = false;
              _this.formObj.find('#typeTeacher')[0].checked = true;
            }
          } else {
            _this.formObj.find('[name="' + key + '"]').val(value);
          }
        });
        //End handle static data
      }
    } else {
      _this.formObj.attr('data-manner', 'add');
      _this.input1.val("");
      _this.input2.val("").trigger('change');
      _this.formObj.find('#typeParent')[0].checked = false;
      _this.formObj.find('#typeAll')[0].checked = true;
      _this.formObj.find('#typeTeacher')[0].checked = false;
      $('.card-block').html("");
    }
    //Handle static data like title, headline, button when change from add to edit and otherwise
    //reset form validator
    if (status === 'edit') {
      _this.title.html(_this.messages.headlineUpdate);
      _this.btnSubmit.text(_this.messages.update);
    } else {
      _this.title.html(_this.messages.headlineAdd);
      _this.btnSubmit.text(_this.messages.add);
    }
  }

  initEditorNotificationForm = function () {
    if ($('#message').length > 0) {
      $('#message').summernote({
        height: 300, // set editor height
        minHeight: null, // set minimum height of editor
        maxHeight: null, // set maximum height of editor
        focus: true // set focus to editable area after initializing summernote
      });
    }
  }
}

class ListIndexNotificationBackendEKP {
  constructor(opts) {
    _.extend(this, opts);
    this.langUrl = this.lang == 'en' ? '' : '/js/backend/datatable.json';
    this.tblId = 'tblNotification';
    this.tableObj = $('#' + this.tblId);
    this.checkAll = null;
    this.listChecked = '';
    this.initialize();
  }

  initialize() {
    let _this = this;
    _this.initDataTable();
    _this.handleItemActions();
    _this.initMoreAction();
    _this.initCheckAll();
    _this.initActionItem();
  }

  initDataTable() {
    let _this = this;
    let params = {};
    let searchParams = new URLSearchParams(window.location.search);
    params.type = searchParams.get('type') || '1';
    params.status = searchParams.get('status') || '1';
    //cloud success  
    var table = this.tableObj.DataTable({
      "language": {
        "url": this.langUrl
      },
      "processing": true,
      "serverSide": true,
      "ajax": "/api/v1/backend/notification/search?status=" + params.status,
      //Add column data (JSON) mapping from AJAX to TABLE
      "columns": [{
          "data": "id"
        },
        {
          "data": "title"
        },
        //{ "data": "message" },
        {
          "data": "class"
        },
        {
          "data": "status"
        },
        {
          "data": "tool"
        }
      ],
      //Define first column without order
      "order": [],
      columnDefs: [{
        "orderable": false,
        "targets": [0, -1, -2, -3, -4]
      }],
      "order": [],
      "iDisplayLength": 50,
      "aLengthMenu": [
        [10, 20, 50, -1],
        [10, 20, 50, "All"]
      ],
      //"buttons": ['copy', 'excel', 'csv', 'pdf', 'print'],
      "pagingType": "numbers",
      //"sDom": "<'row'<'col-sm-6'><'col-sm-6 mb-10'B>>" + "<'row'<'col-sm-6'l><'col-sm-6'f>>" + "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-5'i><'col-sm-7'p>>",
      "sDom": "<'row'<'col-sm-6'l><'col-sm-6'f>>" + "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-5'i><'col-sm-7'p>>",
      "bDestroy": true,
      "initComplete": function (settings, json) {
        _this.initCheckList();
        _this.initActionItem();
      }
    });

    // table.on('draw', function () {
    //   $('.js-checkbox-item').on('change', (e) => {
    //     let selectItem = [];
    //     e.preventDefault();
    //     $.each($("input.js-checkbox-item:checked"), function () {
    //       selectItem.push($(this).val());
    //     });
    //     _this.chekAll.value = selectItem.toString().replace(/,/g, ';');
    //     console.log("===========================SELECT ELEMENT============================");
    //     console.log(_this.chkAll.value);
    //   });
    // });
  }
  handleItemActions() {
    let _this = this;
    //ONCLICK EDIT LINK
    _this.tableObj.on('click', '.edit-row', function (e) {
      e.preventDefault();
      let id = $(this).attr('data-id');
      //get AJAX data
      Cloud.getNotification.with({
        id: id
      }).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
        if (err) {
          console.log(err);
          return;
        }
        //AJAX success 
        let _data = responseBody;
        let _currentForm = window.curBackendEKP.form;
        // Remove old data
        $('#classList').val(null).trigger("change");
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
      Cloud.getClass.with({
        id: id
      }).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
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
      } else if (_this.listChecked != '') {
        ids = _this.listChecked.slice(0, -1);
        _this.initSweetAlert(ids);
      } else {
        swal(_this.messages.chooseItem);
      }
    });
  }

  //CHECK ALL
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
  //END CHECK ALL

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
        Cloud.trashNotification.with({
          ids: id,
          _csrf: $('[name="_csrf"]').val()
        }).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
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

  initActionItem() {
    let _this = this;
    //ONCLICK SEND NOTIFICATION
    _this.tableObj.on('click', '.send-row', function (e) {
      let id = $(this).attr('data-id');
      _this.initPushAlert(id)
    });
    //END ONCLICK SEND NOTIFICATION
  }
  initPushAlert(id) {
    swal({
      title: this.messages.sendNotiPopup,
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
        Cloud.pushNotification.with({
          id: id,
          _csrf: $('[name="_csrf"]').val()
        }).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
          if (err) {
            console.log(err);
            return;
          } else if (responseBody) {
            swal({
              title: this.messages.sendNotiSuccessfully,
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
}
