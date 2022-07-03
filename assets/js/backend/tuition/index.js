class IndexTuitionBackendEKP extends BaseBackendEKP {
  constructor() {
    super();
    this.initialize();
  }

  initialize() {
    //DO NOT LOAD UNNESSESARY CLASS
    //Init form + list if page have BOTH  
    this.form = new FormIndexTuitionBackendEKP(this);
    this.list = new ListIndexTuitionBackendEKP(this);

  }
}

class FormIndexTuitionBackendEKP {
  constructor(opts) {
    _.extend(this, opts);
    this.formId = 'formTuition';
    this.formObj = $('#' + this.formId);
    this.btnAdd = $('#btnAdd')
    this.title = $('.modal-title');
    this.alert = this.formObj.find('.alert');
    this.btnSubmit = this.formObj.find('button[type="submit"]');
    this.btnReset = this.formObj.find('button[type="reset"]');
    this.coutItemTuition = 1;
    this.input1 = $('#title');
    this.input2 = $('#classes');
    this.input3 = $('#rowItemTuition');

    this.initialize();
    this.addRowItemTuition();
    this.removeRow();
    this.initDeadlineDay();
  }

  initialize() {
    let _this = this;
    _this.initValidation();
    $('.js-process-basic-multiple').select2();
    _this.handleItemActions();
  }

  handleItemActions(){
    let _this = this;
    //ONCLICK ADD
    _this.btnAdd.click(function(){
      let _currentForm = window.curBackendEKP.form;
      //Render data from response to form
      _currentForm.renderFormData('add', {});
    })
    //END ONCLICK ADD
  }
  removeRow() {
    let _this = this;
    $("#formTuition").on('click', '.removeItem', function () {
      let index = $(this).attr('data-index');
      //$('#delSlotItem' + index).click(function () {
        $('#rowContent' + index).remove();
      //});
      _this.coutItemTuition--;
    })
  }

  addRowItemTuition() {
    let index = 1;
    let _this = this;
    $("#addItemTuition").click(function () {
      $("#rowItemTuition").append(
        `<div id="rowContent${index}" name="itemTuition${index}" class="row mb-2">
            <div class="col-md-6">
              <input type="text" class="form-control" name="titleSlotItem${index}" placeholder="<%= __('Title') %>"
                data-fv-notempty="true" data-fv-notempty-message="Vui lòng nhập tiêu đề !"
                data-fv-stringlength="true" data-fv-stringlength-min="2" data-fv-stringlength-max="30"
                data-fv-stringlength-message="Tiêu đề ít nhất 10 ký tự" />
            </div>
            <div class="col-md-4">
              <input type="number" class="form-control" name="priceSlotItem${index}" placeholder="<%= __('Cost') %>"
                data-fv-notempty="true" data-fv-notempty-message="Vui lòng nhập chi phí !" />
            </div>
            <div class="col-md-2">
              <div class="btn-delItemTuition">
                <a id="delSlotItem${index}" data-index="${index}" class="removeItem" href="javascript:void(0)">Xoá</a>
              </div>
            </div>
          </div>`
      );
      _this.coutItemTuition++;
      index++;
    });
  }

  initForm() {
    let _this = this;
  }

  initValidation() {
    let _this = this;
    _this.formObj.formValidation({
      button: {
        selector: '#btnFormTuition',
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
        console.log('----- FORM TUITION ----- [SUBMIT][START]');
        let $form = $(e.target);
        let formData = $form.serializeArray();
        // for (let i = 0; i < _this.itemTuition; i++) { 
        //   let itemTuition = this.formObj.find('.spinner');
        // }
        let tmpData = {};
        let slotItems = [];
        let totalCost = 0;
        _.each(formData, (item) => {
          if (_this.coutItemTuition > 0) {
            let objTuition = {};
            for (let i = 0; i < _this.coutItemTuition; i++) {
              if (item.name == 'titleSlotItem' + i) {
                objTuition.id = i;
                objTuition.title = item.value;
                slotItems.push(objTuition);
              }
              if (item.name == 'priceSlotItem' + i) {
                let pos = slotItems.findIndex(item => item.id == i)
                slotItems[pos].price = parseInt(item.value);
                totalCost += parseInt(item.value);
              }
            }
          }
          if (item.name == 'classes') {
            if (tmpData[item.name] == undefined) {
              tmpData[item.name] = [item.value];
            } else {
              tmpData[item.name].push(item.value);
            }
          } else if (item.name == 'deadline') {
            tmpData[item.name] = moment(item.value).format("YYYY-MM-DD");
          } else {
            tmpData[item.name] = item.value;
          }
        });
        tmpData.slotItems = slotItems;
        tmpData.totalCost = totalCost;
        let manner = _this.formObj.attr('data-manner');
        //reset form validator
        if (manner === 'edit') {
          tmpData.id = _this.formObj.attr('data-edit-id');
          Cloud.editTuition.with(tmpData).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
            if (err) {
              _this.alert.removeClass('d-none').addClass("alert-danger").html(_this.messages.error);
              setTimeout(function(){
                _this.alert.removeClass('alert-danger').addClass("d-none");
              }, 3000);
              return;
            } else {
              if (responseBody.code) {
                _this.alert.removeClass('d-none').addClass("alert-danger").html(responseBody.message);
                setTimeout(function(){
                  _this.alert.removeClass('alert-danger').addClass("d-none");
                }, 3000);
                return;
              }
              _this.alert.removeClass('d-none').addClass("alert-success").html(_this.messages.editSuccess);
              setTimeout(function(){
                _this.alert.removeClass('alert-success').addClass("d-none");
              }, 3000);
            }
            //cloud success
          });
        } else {
          Cloud.addTuition.with(tmpData).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
            if (err) {
              _this.alert.removeClass('d-none').addClass("alert-danger").html(_this.messages.error);
              setTimeout(function(){
                _this.alert.removeClass('alert-danger').addClass("d-none");
              }, 3000);
              return;
            } else {
              if (responseBody.code && responseBody.code == 'E006') {
                _this.alert.removeClass('d-none').addClass("alert-danger").html(responseBody.message);
                setTimeout(function(){
                  _this.alert.removeClass('alert-danger').addClass("d-none");
                }, 3000);
                return;
              }
              _this.alert.removeClass('d-none').addClass("alert-success").html(_this.messages.addSuccess);
              setTimeout(function(){
                _this.alert.removeClass('alert-success').addClass("d-none");
              }, 3000);
            }
            //cloud success
          });
        }
        //THEN RELOAD TABLE IF NEEDED 
        window.curBackendEKP.list.initDataTable();
        console.log('----- FORM TUITION ----- [SUBMIT][END]');
      });
  }

  //Function render FORM DATA from AJAX
  //@param {String} status Form status: add or edit
  //@param {String} datas JSON data from AJAX
  renderFormData(status, datas) {
    let _this = this;

    if (status && status === 'edit') {
      _this.formObj.attr('data-manner', 'edit');
      if (datas) {
        //map id -> form to edit
        _this.formObj.attr('data-edit-id', datas.id);
        //Update form fields (input + textarea) base on name of field
        _.each(datas, (value, key) => {
          if (key !== 'status') {
            //Status is radiobuton -> no update
            _this.formObj.find('[name="' + key + '"]').val(value);
            if (key === 'classes') {
              _.forEach(value, element => {
                _this.formObj.find('[name="' + key + '"] option[value="' + element.id + '"]').prop('selected', true);
              })
            }
            if (key === 'slotItems') {
              $("#rowItemTuition").empty();
              //Add first row with no delete button
              $("#rowItemTuition").append(`<div id="rowContent0" name="itemTuition0" class="row mb-2">
              <div class="col-md-6">
                <input type="text" class="form-control" name="titleSlotItem0" placeholder="<%= __('Title') %>"
                  data-fv-notempty="true" data-fv-notempty-message="Vui lòng nhập tiêu đề !"
                  data-fv-stringlength="true" data-fv-stringlength-min="2" data-fv-stringlength-max="30"
                  data-fv-stringlength-message="Tiêu đề ít nhất 10 ký tự" />
              </div>
              <div class="col-md-4">
                <input type="number" class="form-control" name="priceSlotItem0" placeholder="<%= __('Cost') %>"
                  data-fv-notempty="true" data-fv-notempty-message="Vui lòng nhập chi phí !" />
              </div>
            </div>`
                );
                _this.formObj.find('[name="' + 'titleSlotItem0"]').val(value[0].title);
              _this.formObj.find('[name="' + 'priceSlotItem0"]').val(value[0].price);
              
              //Add another row with delete button
              for (let i = 1; i < value.length; i++) {
                $("#rowItemTuition").append(`<div id="rowContent${i}" name="itemTuition${i}" class="row mb-2">
              <div class="col-md-6">
                <input type="text" class="form-control" name="titleSlotItem${i}" placeholder="<%= __('Title') %>"
                  data-fv-notempty="true" data-fv-notempty-message="Vui lòng nhập tiêu đề !"
                  data-fv-stringlength="true" data-fv-stringlength-min="2" data-fv-stringlength-max="30"
                  data-fv-stringlength-message="Tiêu đề ít nhất 10 ký tự" />
              </div>
              <div class="col-md-4">
                <input type="number" class="form-control" name="priceSlotItem${i}" placeholder="<%= __('Cost') %>"
                  data-fv-notempty="true" data-fv-notempty-message="Vui lòng nhập chi phí !" />
              </div>
              <div class="col-md-2">
                <div class="btn-delItemTuition">
                  <a id="delSlotItem${i}" data-index="${i}" class="removeItem" href="javascript:void(0)">Xoá</a>
                </div>
              </div>
            </div>`
                );
                _this.formObj.find('[name="' + 'titleSlotItem' + i + '"]').val(value[i].title);
                _this.formObj.find('[name="' + 'priceSlotItem' + i + '"]').val(value[i].price);
              }
            }
            if (key === 'deadline') {
              // let dateFormat = moment(value).forma;
              _this.formObj.find('[name="' + key + '"]').val(value);
            }
  
          } else {
            //Update status radiobutton
            if (value == 1) {
              _this.formObj.find('#statusActive')[0].checked = true;
              _this.formObj.find('#statusDraft')[0].checked = false;
            } else if (value == 0) {
              _this.formObj.find('#statusActive')[0].checked = false;
              _this.formObj.find('#statusDraft')[0].checked = true;
            } else {
              _this.formObj.find('#statusActive')[0].checked = false;
              _this.formObj.find('#statusDraft')[0].checked = false;
            }
  
          }
        });
  
        //Handle static data like title, headline, button when change from add to edit and otherwise
        //reset form validator
       
      }
    } else {
      _this.formObj.attr('data-manner', 'add');
      _this.input1.val("");
      _this.input2.val("").trigger('change');
      _this.input3.empty();
    }
    if (status === 'edit') {
      _this.title.html(_this.messages.headlineUpdate);
      _this.btnSubmit.text(_this.messages.update);
    } else {
      _this.title.html(_this.messages.headlineAdd);
      _this.btnSubmit.text(_this.messages.add);
    }
  }

  initDeadlineDay() {
    if ($('#deadline').val() == '') {
      //set default value for deadline day
      let deadline = moment().add(1, 'M').format('YYYY-MM-DD');
  
      $('#deadline').val(deadline);
    }
  }
}

class ListIndexTuitionBackendEKP {
  constructor(opts) {
    _.extend(this, opts);

    this.langUrl = this.lang == 'en' ? '' : '/js/backend/datatable.json';
    this.tblId = 'tblTuition';
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
  }

  initDataTable() {
    let _this = this;
    let params = {};
    let searchParams = new URLSearchParams(window.location.search);
    params.status = searchParams.get('status') || '1';
    //cloud success  
    var table = this.tableObj.DataTable({
      "language": {
        "url": this.langUrl
      },
      "processing": true,
      "serverSide": true,
      "ajax": "/api/v1/backend/tuition/search?status=" + params.status,
      //Add column data (JSON) mapping from AJAX to TABLE
      "columns": [
        { "data": "id" },
        { "data": "title" },
        { "data": "slotItems" },
        { "data": "totalCost" },
        { "data": "deadline" },
        { "data": "status" },
        { "data": "tool" },
      ],
      //Define first column without order
      columnDefs: [
        { "orderable": false, "targets": [0, 2, -2, -1] }
      ],
      "order": [],
      "iDisplayLength": 10,
      "aLengthMenu": [[10, 20, 50, -1], [10, 20, 50, "All"]],
      //"buttons": ['copy', 'excel', 'csv', 'pdf', 'print'],
      "pagingType": "numbers",
      //"sDom": "<'row'<'col-sm-6'><'col-sm-6 mb-10'B>>" + "<'row'<'col-sm-6'l><'col-sm-6'f>>" + "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-5'i><'col-sm-7'p>>",
      "sDom": "<'row'<'col-sm-6'l><'col-sm-6'f>>" + "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-5'i><'col-sm-7'p>>",
      "bDestroy": true,
      "initComplete": function (settings, json) {
        _this.initCheckedList();
        _this.initSwitchStatus();
      }
    });

    // table.on( 'draw', function () {
    //   $('.js-checkbox-item').on( 'change', (e) => {
    //     let selectItem = [];
    //     e.preventDefault();
    //     $.each($("input.js-checkbox-item:checked"), function(){            
    //       selectItem.push($(this).val());
    //     });
    //     _this.checkAll.value = selectItem.toString().replace(/,/g, ';');
    //     console.log("===========================SELECT ELEMENT============================");
    //     console.log(_this.checkAll.value);
    //   }); 
    // } );
  }

  handleItemActions() {
    let _this = this;
    //ONCLICK EDIT LINK
    _this.tableObj.on('click', '.edit-row', function (e) {
      e.preventDefault();
      let id = $(this).attr('data-id');
      //get AJAX data
      Cloud.getTuition.with({ id: id }).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
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
      Cloud.getTuition.with({ id: id }).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
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
    //ONCLICK REMOVE (TRASH) LINK
    _this.tableObj.on('click', '.remove-row', function (e) {
      let id = $(this).attr('data-id');
      _this.initSweetAlert(id)
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

  getEventTarget(e) {
    e = e || window.event;
    return e.target || e.srcElement;
  }

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
        Cloud.trashTuition.with({ ids: id }).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
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
        Cloud.switchStatusTuition.with({ id: id }).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
					if (err) {
						console.log(err);
						return;
					} else if (responseBody) {
            location.reload();
					}
				})
				// _this.initSwitchStatusAlert(id);
			});
		});
  }
  
}