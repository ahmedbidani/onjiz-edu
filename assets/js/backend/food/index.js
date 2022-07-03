class IndexFoodBackendEKP extends BaseBackendEKP {
  constructor() {
    super();
    this.initialize();
  }

  initialize() {
    //DO NOT LOAD UNNESSESARY CLASS
    //Init form + list if page have BOTH  
    this.form = new FormIndexFoodBackendEKP(this);
    this.list = new ListIndexFoodBackendEKP(this);

  }
}

class FormIndexFoodBackendEKP {
  constructor(opts) {
    _.extend(this, opts);
    this.formId = 'formFood';
    this.formObj = $('#' + this.formId);
    this.title = $('.modal-title');
    this.alert = this.formObj.find('.alert');
    this.btnSubmit = this.formObj.find('button[type="submit"]');
    this.btnReset = this.formObj.find('button[type="reset"]');
    this.btnAdd = $('#btnAdd');
    this.input1 = $('#code');
    this.input2 = $('#title');
    this.input3 = $('#description');

    this.initialize();
  }

  initialize() {
    let _this = this;
    _this.initValidation();
    $('.js-process-basic-multiple').select2();
    $('#thumbnail').ddslick();
    _this.handleItemActions();
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

  initForm() {
    let _this = this;

  }

  initValidation() {
    let _this = this;
    _this.formObj.formValidation({
        button: {
          selector: '#btnFormFood',
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
        console.log('----- FORM FOOD ----- [SUBMIT][START]');
        let $form = $(e.target);
        let formData = $form.serializeArray();
        let tmpData = {};
        _.each(formData, (item) => {
          if (item.name == 'foodgroup') {
            if (tmpData[item.name] == undefined) {
              tmpData[item.name] = [item.value];
            } else {
              tmpData[item.name].push(item.value);
            }
          } else {
            tmpData[item.name] = item.value;
          }
        });
        tmpData.thumbnail = $('.dd-selected-value').val();
        let manner = _this.formObj.attr('data-manner');
        //reset form validator
        if (manner === 'edit') {
          tmpData.id = _this.formObj.attr('data-edit-id');
          Cloud.editFood.with(tmpData).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
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
            $('#btnFormFood').removeAttr("disabled");
            $('#btnFormFood').removeClass("disabled");
            //cloud success
          });
        } else {
          Cloud.addFood.with(tmpData).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
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
              _this.alert.removeClass('d-none').addClass("alert-success").html(_this.messages.addSuccess);
              setTimeout(function () {
                _this.alert.removeClass('alert-success').addClass("d-none");
              }, 3000);
            }
            //cloud success
          });
        }
        //THEN RELOAD TABLE IF NEEDED 
        window.curBackendEKP.list.initDataTable();
        console.log('----- FORM FOOD ----- [SUBMIT][END]');
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
            if (key == 'thumbnail') {
              let arr = [{
                  path: '/images/appetizer.png',
                  text: 'Appetizer'
                },
                {
                  path: '/images/maincourse.png',
                  text: 'Main Course'
                },
                {
                  path: '/images/fish.png',
                  text: 'Fish'
                },
                {
                  path: '/images/meat.png',
                  text: 'Meat'
                },
                {
                  path: '/images/egg.png',
                  text: 'Egg'
                },
                {
                  path: '/images/soup.png',
                  text: 'Soup'
                },
                {
                  path: '/images/vegetable.png',
                  text: 'Vegetable'
                },
                {
                  path: '/images/milk.png',
                  text: 'Milk'
                },
                {
                  path: '/images/drink.png',
                  text: 'Drink'
                },
                {
                  path: '/images/fruit.png',
                  text: 'Fruit'
                },
                {
                  path: '/images/cake.png',
                  text: 'Cake'
                },
                {
                  path: '/images/dessert.png',
                  text: 'Dessert'
                },
              ]
              $('.dd-selected-value').val(value);
              $('.dd-selected-image').attr('src', arr[value - 1].path);
              $('.dd-selected-text').text(arr[value - 1].text);

            }
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
      _this.input3.val("");
    }

    //reset form validator
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


class ListIndexFoodBackendEKP {
  constructor(opts) {
    _.extend(this, opts);
    this.langUrl = this.lang == 'en' ? '' : '/js/backend/datatable.json';
    this.tblId = 'tblFood';
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
    params.type = searchParams.get('type') || '1';
    params.status = searchParams.get('status') || '1';
    //cloud success  
    var table = this.tableObj.DataTable({
      "language": {
        "url": this.langUrl
      },
      "destroy": true,
      "processing": true,
      "serverSide": true,
      "ajax": `/api/v1/backend/food/search?status=${params.status}`,
      //Add column data (JSON) mapping from AJAX to TABLE
      "columns": [{
          "data": "id"
        },
        {
          "data": "title"
        },
        {
          "data": "description"
        },
        {
          "data": "status"
        },
        {
          "data": "tool"
        }
      ],
      //Define first column without order
      columnDefs: [{
        "orderable": false,
        "targets": [0, -1, -2]
      }],
      "order": [],
      "iDisplayLength": 50,
      "pagingType": "numbers",
      //"sDom": "<'row'<'col-sm-6'><'col-sm-6 mb-10'B>>" + "<'row'<'col-sm-6'l><'col-sm-6'f>>" + "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-5'i><'col-sm-7'p>>",
      "sDom": "<'row'<'col-sm-6'l><'col-sm-6'f>>" + "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-5'i><'col-sm-7'p>>",
      "initComplete": function (settings, json) {
        _this.initCheckList();
        _this.initSwitchStatus();
      }
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

  handleItemActions() {
    let _this = this;
    //ONCLICK EDIT LINK
    _this.tableObj.on('click', '.edit-row', function (e) {
      e.preventDefault();
      let id = $(this).attr('data-id');
      //get AJAX data
      Cloud.getFood.with({
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
        _currentForm.renderFormData('edit', _data);
        $('.js-process-basic-multiple').select2();
        $('#modal-edit-food').modal('show');
      })
    });
    //END ONCLICK EDIT LINK

    //ONCLICK DUPPLICATE LINK
    _this.tableObj.on('click', '.duplicate-row', function (e) {
      e.preventDefault();
      let id = $(this).attr('data-id');
      //get AJAX data
      Cloud.getFood.with({
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
  //TRASH
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
        Cloud.trashFood.with({
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
  //END TRASH

  initSwitchStatus() {
    // let _this = this;
    $(document).ready(function () {
      $('.switchStatus').change(function () {
        let id = $(this).attr('data-id');
        // _this.initSwitchStatusAlert(id);
        Cloud.switchStatusFood.with({
          id: id,
          _csrf: $('[name="_csrf"]').val()
        }).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
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
