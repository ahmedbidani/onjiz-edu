class IndexFormationBackendEKP extends BaseBackendEKP {
  constructor() {
    super();
    this.initialize();
  }

  initialize() {
    //DO NOT LOAD UNNESSESARY CLASS
    //Init form + list if page have BOTH  
    this.form = new FormIndexFormationBackendEKP(this);
    this.list = new ListIndexFormationBackendEKP(this);
  }
}

class FormIndexFormationBackendEKP {
  constructor(opts) {
    _.extend(this, opts);
    this.formId = 'formFormation';
    this.formObj = $('#' + this.formId);
    this.btnAdd = $('#btnAdd')
    this.title = $('.modal-title');
    this.alert = this.formObj.find('.alert');
    this.btnSubmit = this.formObj.find('button[type="submit"]');
    this.btnReset = this.formObj.find('button[type="reset"]');
    this.input1 = $('#name');
    this.input2 = $('#description');

    this.initialize();
  }
  
  initialize() {
    let _this = this;
    _this.initValidation();
    
    //$('.js-process-basic-multiple').select2();
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
  

  initValidation() {
    let _this = this;
   
    _this.formObj.formValidation({
      button: {
        selector: '#btnFormFormation',
        disabled: 'disabled',
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
        console.log('----- FORM FORMATION ----- [SUBMIT][START]');
        let $form = $(e.target);
        let formData = $form.serializeArray();
        let tmpData = {};
        _.each(formData, (item) => {
          tmpData[item.name] = item.value;
        });
        let manner = _this.formObj.attr('data-manner');
        //reset form validator
        if (manner === 'edit') {
          tmpData.id = _this.formObj.attr('data-edit-id');
          Cloud.editFormation.with(tmpData).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
            if (err) {
              _this.alert.removeClass('d-none').addClass("alert-danger").html(_this.messages.error);
              setTimeout(function(){
                _this.alert.removeClass('alert-danger').addClass("d-none");
              }, 3000);
              return;
            } else {
              if (responseBody.message) {
                _this.alert.removeClass('d-none').addClass("alert-warning").html(responseBody.message);
                setTimeout(function(){
                  _this.alert.removeClass('alert-warning').addClass("d-none");
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
          Cloud.addFormation.with(tmpData).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
            if (err) {
              _this.alert.removeClass('d-none').addClass("alert-danger").html(_this.messages.error);
              setTimeout(function(){
                _this.alert.removeClass('alert-danger').addClass("d-none");
              }, 3000);
              return;
            } else {
              if (responseBody.message) {
                _this.alert.removeClass('d-none').addClass("alert-warning").html(responseBody.message);
                setTimeout(function(){
                  _this.alert.removeClass('alert-warning').addClass("d-none");
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
        console.log('----- FORM FORMATION ----- [SUBMIT][END]');
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
          } else {
            // Update status radiobutton
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
        
      }
    } else {
      _this.formObj.attr('data-manner', 'add');
      //let _currentForm = window.curBackendEKP.form
      _this.input1.val("");
      _this.input2.val("");
    }
    
    if (status === 'edit') {
      _this.title.html(_this.messages.headlineUpdate);
      _this.btnSubmit.text(_this.messages.update);
    } else {
      _this.title.html(_this.messages.headlineAdd);
      _this.btnSubmit.text(_this.messages.add);
    }
    //End handle static data
    
  }

}


class ListIndexFormationBackendEKP {
  constructor(opts) {
    _.extend(this, opts);
    this.langUrl = this.lang == 'en' ? '' : '/js/backend/datatable.json';
    this.tblId = 'tblFormation';
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
    window.dataTable = this.tableObj.DataTable({
      "language": {
        "url": this.langUrl
      },
      "processing": true,
      "serverSide": true,
      "ajax": "/api/v1/backend/formation/search?status=" + params.status,

      //Add column data (JSON) mapping from AJAX to TABLE
      "columns": [
        { "data": "id" },
        { "data": "name" },
        { "data": "description" },
        { "data": "status" },
        { "data": "tool" }
        
      ],
      //Define first column without order
      columnDefs: [
        { "orderable": false, "targets": [0, -2, -1] }
      ],
      "order": [],
      "iDisplayLength": 50,
      "aLengthMenu": [[10, 20, 50, -1], [10, 20, 50, "All"]],
      //"buttons": ['copy', 'excel', 'csv', 'pdf', 'print'],
      "pagingType": "numbers",
      //"sDom": "<'row'<'col-sm-6'><'col-sm-6 mb-10'B>>" + "<'row'<'col-sm-6'l><'col-sm-6'f>>" + "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-5'i><'col-sm-7'p>>",
      "sDom": "<'row'<'col-sm-6'l><'col-sm-6'f>>" + "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-5'i><'col-sm-7'p>>",
      "bDestroy": true,
      "initComplete": function (settings, json) {
        _this.initCheckList();
        _this.initSwitchStatus();
      }
    });

   
  }
  
  handleItemActions() {
    let _this = this;
    //ONCLICK EDIT LINK
    _this.tableObj.on('click', '.edit-row', function (e) {
      e.preventDefault();
      let id = $(this).attr('data-id');
      
      //get AJAX data
      Cloud.getFormation.with({ id: id }).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
        if (err) {
          console.log(err);
          return;
        }
        //AJAX success 
        let _data = responseBody;
        let _currentForm = window.curBackendEKP.form;
        //Render data from response to form
        _currentForm.renderFormData('edit', _data);
        //_currentForm.initValidation();
      })
    });
    //END ONCLICK EDIT LINK

    //ONCLICK DUPPLICATE LINK
    _this.tableObj.on('click', '.duplicate-row', function (e) {
      e.preventDefault();
      let id = $(this).attr('data-id');
      //get AJAX data
      Cloud.getFormation.with({ id: id }).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
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

  //ON CLICK DROPDOWN ITEM(REMOVE)
  initMoreAction() {
    let _this = this;
    let btnTrash = $('.dropdown-menu .act-trash-group');

    btnTrash.on('click', (e) => {
      e.preventDefault();
      let ids = '';
      if (_this.checkAll.value != '') {
        ids = _this.checkAll.value;
        _this.initSweetAlert(ids);
      } else {if(_this.listChecked != ''){
          ids = _this.listChecked.slice(0, -1);
          _this.initSweetAlert(ids);
      } else {
        swal(_this.messages.chooseItem);
      }}
    });
  }
  //END ON CLICK DROPDOWN ITEM(REMOVE)

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
        Cloud.deleteFormation.with({ ids: id,  _csrf: $('[name="_csrf"]').val() }).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
          if (err) {
            console.log(err);
            swal({
              title: err.responseInfo.body.message,
              icon: 'error',
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
        Cloud.switchStatusFormation.with({ id: id,  _csrf: $('[name="_csrf"]').val() }).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
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