class IndexRoleSABackendEKP extends BaseBackendEKP {
  constructor() {
    super( );
    this.initialize();
  }

  initialize() {
    //DO NOT LOAD UNNESSESARY CLASS
    //Init form + list if page have BOTH  
    this.form = new FormRoleSABackendEKP(this); 
    this.popUp = new PopUpRoleSABackendEKP(this); 
  }
}

class PopUpRoleSABackendEKP {
  constructor(opts) {
    _.extend(this, opts);
    this.formId = 'formAddRole';
    this.formObj = $('#' + this.formId);
    this.title = $('.modal-title');
    this.alert = this.formObj.find('.alert');
    this.btnSubmit = this.formObj.find('button[type="submit"]');
    this.btnReset = this.formObj.find('button[type="reset"]');
    this.btnAdd = $('#btnAdd');
    this.inputName = $('#name');
    this.inputDescription = $('#description');

    this.initialize();
  }

  initialize() {
    let _this = this;
    _this.initValidation();
    _this.handleItemActions();
  }

  handleItemActions() {
    let _this = this;
    //ONCLICK ADD
    _this.btnAdd.click(function () {
      _this.inputName.val("");
      _this.inputDescription.val("");
    })
    //END ONCLICK ADD
  }

  initValidation() {
    let _this = this;
    _this.formObj.formValidation({
      button: {
        selector: '#btnFormAddRole',
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
        console.log('----- FORM ROLE ----- [SUBMIT][START]');
        let $form = $(e.target);
        let formData = $form.serializeArray();
        let tmpData = {};
        _.each(formData, (item) => {
          tmpData[item.name] = item.value;
        });
        Cloud.addRole.with(tmpData).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
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
            }
            return;
          } else {
            _this.alert.removeClass('d-none').addClass("alert-success").html(_this.messages.addSuccess);
            setTimeout(function () {
              _this.alert.removeClass('alert-success').addClass("d-none");
              //THEN RELOAD PAGE
              window.location.reload();
            }, 1000);
          }
          //cloud success
        });
        console.log('----- FORM ROLE ----- [SUBMIT][END]');
      });
  }
}

class FormRoleSABackendEKP {
  constructor(opts) {
    _.extend(this, opts);
    this.formId = 'formEditRole';
    this.formObj = $('#' + this.formId);
    this.title = $('.modal-title');
    this.alert = this.formObj.find('.alert');
    this.btnSubmit = this.formObj.find('button[type="submit"]');
    this.btnReset = this.formObj.find('button[type="reset"]');

    this.initialize();
  }

  initialize() {
    let _this = this;
    _this.initOnChangeRole();
    _this.initValidation();
    _this.initDeleteRole();
    _this.initCheckAll();
  }

  initOnChangeRole() {
    let _this = this;
    //ONCLICK EDIT LINK
    $('#roleNav').on('click', '.change-role-row', function (e) {
      e.preventDefault();
      $('.change-role-row').parent().removeClass('active');
      $(this).parent().addClass('active');

      let id = $(this).attr('data-id');
      //get AJAX data
      Cloud.getRole.with({ id: id }).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
        if (err) {
          console.log(err);
          return;
        }
        //AJAX success 
        // console.log(responseBody);

        //update field of formEditRole
        _this.formObj.find('[name="id"]').val(responseBody.id);
        _this.formObj.find('[name="name"]').val(responseBody.name);
        _this.formObj.find('[name="description"]').val(responseBody.description);
        //update select view + add + edit + delete header
        $('#js-check-all-view').prop('checked', false);
        $('#js-check-all-add').prop('checked', false);
        $('#js-check-all-edit').prop('checked', false);
        $('#js-check-all-delete').prop('checked', false);
        //update permissions album
        if (responseBody.permissions && responseBody.permissions.album) {
          responseBody.permissions.album.view ? $('#js-check-view-album').prop('checked', true) : $('#js-check-view-album').prop('checked', false);
          responseBody.permissions.album.add ? $('#js-check-add-album').prop('checked', true) : $('#js-check-add-album').prop('checked', false);
          responseBody.permissions.album.edit ? $('#js-check-edit-album').prop('checked', true) : $('#js-check-edit-album').prop('checked', false);
          responseBody.permissions.album.delete ? $('#js-check-delete-album').prop('checked', true) : $('#js-check-delete-album').prop('checked', false);
          responseBody.permissions.album.view && responseBody.permissions.album.add && responseBody.permissions.album.edit && responseBody.permissions.album.delete ? $('#js-check-all-album').prop('checked', true) : $('#js-check-all-album').prop('checked', false);
        } else {
          $('#js-check-view-album').prop('checked', false);
          $('#js-check-add-album').prop('checked', false);
          $('#js-check-edit-album').prop('checked', false);
          $('#js-check-delete-album').prop('checked', false);
          $('#js-check-all-album').prop('checked', false);
        }
        //update permissions attendent
        if (responseBody.permissions && responseBody.permissions.attendent) {
          responseBody.permissions.attendent.view ? $('#js-check-view-attendent').prop('checked', true) : $('#js-check-view-attendent').prop('checked', false);
          responseBody.permissions.attendent.edit ? $('#js-check-edit-attendent').prop('checked', true) : $('#js-check-edit-attendent').prop('checked', false);
          responseBody.permissions.attendent.view && responseBody.permissions.attendent.edit ? $('#js-check-all-attendent').prop('checked', true) : $('#js-check-all-attendent').prop('checked', false);
        } else {
          $('#js-check-view-attendent').prop('checked', false);
          $('#js-check-edit-attendent').prop('checked', false);
          $('#js-check-all-attendent').prop('checked', false);
        }
        //update permissions branch
        if (responseBody.permissions && responseBody.permissions.branch) {
          responseBody.permissions.branch.view ? $('#js-check-view-branch').prop('checked', true) : $('#js-check-view-branch').prop('checked', false);
          responseBody.permissions.branch.add ? $('#js-check-add-branch').prop('checked', true) : $('#js-check-add-branch').prop('checked', false);
          responseBody.permissions.branch.edit ? $('#js-check-edit-branch').prop('checked', true) : $('#js-check-edit-branch').prop('checked', false);
          responseBody.permissions.branch.delete ? $('#js-check-delete-branch').prop('checked', true) : $('#js-check-delete-branch').prop('checked', false);
          responseBody.permissions.branch.view && responseBody.permissions.branch.add && responseBody.permissions.branch.edit && responseBody.permissions.branch.delete ? $('#js-check-all-branch').prop('checked', true) : $('#js-check-all-branch').prop('checked', false);
        } else {
          $('#js-check-view-branch').prop('checked', false);
          $('#js-check-add-branch').prop('checked', false);
          $('#js-check-edit-branch').prop('checked', false);
          $('#js-check-delete-branch').prop('checked', false);
          $('#js-check-all-branch').prop('checked', false);
        }
        //update permissions class
        if (responseBody.permissions && responseBody.permissions.class) {
          responseBody.permissions.class.view ? $('#js-check-view-class').prop('checked', true) : $('#js-check-view-class').prop('checked', false);
          responseBody.permissions.class.add ? $('#js-check-add-class').prop('checked', true) : $('#js-check-add-class').prop('checked', false);
          responseBody.permissions.class.edit ? $('#js-check-edit-class').prop('checked', true) : $('#js-check-edit-class').prop('checked', false);
          responseBody.permissions.class.delete ? $('#js-check-delete-class').prop('checked', true) : $('#js-check-delete-class').prop('checked', false);
          responseBody.permissions.class.view && responseBody.permissions.class.add && responseBody.permissions.class.edit && responseBody.permissions.class.delete ? $('#js-check-all-class').prop('checked', true) : $('#js-check-all-class').prop('checked', false);
        } else {
          $('#js-check-view-class').prop('checked', false);
          $('#js-check-add-class').prop('checked', false);
          $('#js-check-edit-class').prop('checked', false);
          $('#js-check-delete-class').prop('checked', false);
          $('#js-check-all-class').prop('checked', false);
        }
        //update permissions courseSession
        if (responseBody.permissions && responseBody.permissions.courseSession) {
          responseBody.permissions.courseSession.view ? $('#js-check-view-courseSession').prop('checked', true) : $('#js-check-view-courseSession').prop('checked', false);
          responseBody.permissions.courseSession.add ? $('#js-check-add-courseSession').prop('checked', true) : $('#js-check-add-courseSession').prop('checked', false);
          responseBody.permissions.courseSession.edit ? $('#js-check-edit-courseSession').prop('checked', true) : $('#js-check-edit-courseSession').prop('checked', false);
          responseBody.permissions.courseSession.delete ? $('#js-check-delete-courseSession').prop('checked', true) : $('#js-check-delete-courseSession').prop('checked', false);
          responseBody.permissions.courseSession.view && responseBody.permissions.courseSession.add && responseBody.permissions.courseSession.edit && responseBody.permissions.courseSession.delete ? $('#js-check-all-courseSession').prop('checked', true) : $('#js-check-all-courseSession').prop('checked', false);
        } else {
          $('#js-check-view-courseSession').prop('checked', false);
          $('#js-check-add-courseSession').prop('checked', false);
          $('#js-check-edit-courseSession').prop('checked', false);
          $('#js-check-delete-courseSession').prop('checked', false);
          $('#js-check-all-courseSession').prop('checked', false);
        }
        //update permissions currency
        if (responseBody.permissions && responseBody.permissions.currency) {
          responseBody.permissions.currency.view ? $('#js-check-view-currency').prop('checked', true) : $('#js-check-view-currency').prop('checked', false);
          responseBody.permissions.currency.add ? $('#js-check-add-currency').prop('checked', true) : $('#js-check-add-currency').prop('checked', false);
          responseBody.permissions.currency.edit ? $('#js-check-edit-currency').prop('checked', true) : $('#js-check-edit-currency').prop('checked', false);
          responseBody.permissions.currency.delete ? $('#js-check-delete-currency').prop('checked', true) : $('#js-check-delete-currency').prop('checked', false);
          responseBody.permissions.currency.view && responseBody.permissions.currency.add && responseBody.permissions.currency.edit && responseBody.permissions.currency.delete ? $('#js-check-all-currency').prop('checked', true) : $('#js-check-all-currency').prop('checked', false);
        } else {
          $('#js-check-view-currency').prop('checked', false);
          $('#js-check-add-currency').prop('checked', false);
          $('#js-check-edit-currency').prop('checked', false);
          $('#js-check-delete-currency').prop('checked', false);
          $('#js-check-all-currency').prop('checked', false);
        }
        //update permissions event
        if (responseBody.permissions && responseBody.permissions.event) {
          responseBody.permissions.event.view ? $('#js-check-view-event').prop('checked', true) : $('#js-check-view-event').prop('checked', false);
          responseBody.permissions.event.add ? $('#js-check-add-event').prop('checked', true) : $('#js-check-add-event').prop('checked', false);
          responseBody.permissions.event.edit ? $('#js-check-edit-event').prop('checked', true) : $('#js-check-edit-event').prop('checked', false);
          responseBody.permissions.event.delete ? $('#js-check-delete-event').prop('checked', true) : $('#js-check-delete-event').prop('checked', false);
          responseBody.permissions.event.view && responseBody.permissions.event.add && responseBody.permissions.event.edit && responseBody.permissions.event.delete ? $('#js-check-all-event').prop('checked', true) : $('#js-check-all-event').prop('checked', false);
        } else {
          $('#js-check-view-event').prop('checked', false);
          $('#js-check-add-event').prop('checked', false);
          $('#js-check-edit-event').prop('checked', false);
          $('#js-check-delete-event').prop('checked', false);
          $('#js-check-all-event').prop('checked', false);
        }
        //update permissions feeInvoice
        if (responseBody.permissions && responseBody.permissions.feeInvoice) {
          responseBody.permissions.feeInvoice.view ? $('#js-check-view-feeInvoice').prop('checked', true) : $('#js-check-view-feeInvoice').prop('checked', false);
          responseBody.permissions.feeInvoice.add ? $('#js-check-add-feeInvoice').prop('checked', true) : $('#js-check-add-feeInvoice').prop('checked', false);
          responseBody.permissions.feeInvoice.edit ? $('#js-check-edit-feeInvoice').prop('checked', true) : $('#js-check-edit-feeInvoice').prop('checked', false);
          responseBody.permissions.feeInvoice.delete ? $('#js-check-delete-feeInvoice').prop('checked', true) : $('#js-check-delete-feeInvoice').prop('checked', false);
          responseBody.permissions.feeInvoice.view && responseBody.permissions.feeInvoice.add && responseBody.permissions.feeInvoice.edit && responseBody.permissions.feeInvoice.delete ? $('#js-check-all-feeInvoice').prop('checked', true) : $('#js-check-all-feeInvoice').prop('checked', false);
        } else {
          $('#js-check-view-feeInvoice').prop('checked', false);
          $('#js-check-add-feeInvoice').prop('checked', false);
          $('#js-check-edit-feeInvoice').prop('checked', false);
          $('#js-check-delete-feeInvoice').prop('checked', false);
          $('#js-check-all-feeInvoice').prop('checked', false);
        }
        //update permissions feeItem
        if (responseBody.permissions && responseBody.permissions.feeItem) {
          responseBody.permissions.feeItem.view ? $('#js-check-view-feeItem').prop('checked', true) : $('#js-check-view-feeItem').prop('checked', false);
          responseBody.permissions.feeItem.add ? $('#js-check-add-feeItem').prop('checked', true) : $('#js-check-add-feeItem').prop('checked', false);
          responseBody.permissions.feeItem.edit ? $('#js-check-edit-feeItem').prop('checked', true) : $('#js-check-edit-feeItem').prop('checked', false);
          responseBody.permissions.feeItem.delete ? $('#js-check-delete-feeItem').prop('checked', true) : $('#js-check-delete-feeItem').prop('checked', false);
          responseBody.permissions.feeItem.view && responseBody.permissions.feeItem.add && responseBody.permissions.feeItem.edit && responseBody.permissions.feeItem.delete ? $('#js-check-all-feeItem').prop('checked', true) : $('#js-check-all-feeItem').prop('checked', false);
        } else {
          $('#js-check-view-feeItem').prop('checked', false);
          $('#js-check-add-feeItem').prop('checked', false);
          $('#js-check-edit-feeItem').prop('checked', false);
          $('#js-check-delete-feeItem').prop('checked', false);
          $('#js-check-all-feeItem').prop('checked', false);
        }
        //update permissions food
        if (responseBody.permissions && responseBody.permissions.food) {
          responseBody.permissions.food.view ? $('#js-check-view-food').prop('checked', true) : $('#js-check-view-food').prop('checked', false);
          responseBody.permissions.food.add ? $('#js-check-add-food').prop('checked', true) : $('#js-check-add-food').prop('checked', false);
          responseBody.permissions.food.edit ? $('#js-check-edit-food').prop('checked', true) : $('#js-check-edit-food').prop('checked', false);
          responseBody.permissions.food.delete ? $('#js-check-delete-food').prop('checked', true) : $('#js-check-delete-food').prop('checked', false);
          responseBody.permissions.food.view && responseBody.permissions.food.add && responseBody.permissions.food.edit && responseBody.permissions.food.delete ? $('#js-check-all-food').prop('checked', true) : $('#js-check-all-food').prop('checked', false);
        } else {
          $('#js-check-view-food').prop('checked', false);
          $('#js-check-add-food').prop('checked', false);
          $('#js-check-edit-food').prop('checked', false);
          $('#js-check-delete-food').prop('checked', false);
          $('#js-check-all-food').prop('checked', false);
        }
        //update permissions menu
        if (responseBody.permissions && responseBody.permissions.menu) {
          responseBody.permissions.menu.view ? $('#js-check-view-menu').prop('checked', true) : $('#js-check-view-menu').prop('checked', false);
          responseBody.permissions.menu.add ? $('#js-check-add-menu').prop('checked', true) : $('#js-check-add-menu').prop('checked', false);
          responseBody.permissions.menu.edit ? $('#js-check-edit-menu').prop('checked', true) : $('#js-check-edit-menu').prop('checked', false);
          responseBody.permissions.menu.delete ? $('#js-check-delete-menu').prop('checked', true) : $('#js-check-delete-menu').prop('checked', false);
          responseBody.permissions.menu.view && responseBody.permissions.menu.add && responseBody.permissions.menu.edit && responseBody.permissions.menu.delete ? $('#js-check-all-menu').prop('checked', true) : $('#js-check-all-menu').prop('checked', false);
        } else {
          $('#js-check-view-menu').prop('checked', false);
          $('#js-check-add-menu').prop('checked', false);
          $('#js-check-edit-menu').prop('checked', false);
          $('#js-check-delete-menu').prop('checked', false);
          $('#js-check-all-menu').prop('checked', false);
        }
        //update permissions notification
        if (responseBody.permissions && responseBody.permissions.notification) {
          responseBody.permissions.notification.view ? $('#js-check-view-notification').prop('checked', true) : $('#js-check-view-notification').prop('checked', false);
          responseBody.permissions.notification.add ? $('#js-check-add-notification').prop('checked', true) : $('#js-check-add-notification').prop('checked', false);
          responseBody.permissions.notification.edit ? $('#js-check-edit-notification').prop('checked', true) : $('#js-check-edit-notification').prop('checked', false);
          responseBody.permissions.notification.delete ? $('#js-check-delete-notification').prop('checked', true) : $('#js-check-delete-notification').prop('checked', false);
          responseBody.permissions.notification.view && responseBody.permissions.notification.add && responseBody.permissions.notification.edit && responseBody.permissions.notification.delete ? $('#js-check-all-notification').prop('checked', true) : $('#js-check-all-notification').prop('checked', false);
        } else {
          $('#js-check-view-notification').prop('checked', false);
          $('#js-check-add-notification').prop('checked', false);
          $('#js-check-edit-notification').prop('checked', false);
          $('#js-check-delete-notification').prop('checked', false);
          $('#js-check-all-notification').prop('checked', false);
        }
        //update permissions parent
        if (responseBody.permissions && responseBody.permissions.parent) {
          responseBody.permissions.parent.view ? $('#js-check-view-parent').prop('checked', true) : $('#js-check-view-parent').prop('checked', false);
          responseBody.permissions.parent.add ? $('#js-check-add-parent').prop('checked', true) : $('#js-check-add-parent').prop('checked', false);
          responseBody.permissions.parent.edit ? $('#js-check-edit-parent').prop('checked', true) : $('#js-check-edit-parent').prop('checked', false);
          responseBody.permissions.parent.delete ? $('#js-check-delete-parent').prop('checked', true) : $('#js-check-delete-parent').prop('checked', false);
          responseBody.permissions.parent.view && responseBody.permissions.parent.add && responseBody.permissions.parent.edit && responseBody.permissions.parent.delete ? $('#js-check-all-parent').prop('checked', true) : $('#js-check-all-parent').prop('checked', false);
        } else {
          $('#js-check-view-parent').prop('checked', false);
          $('#js-check-add-parent').prop('checked', false);
          $('#js-check-edit-parent').prop('checked', false);
          $('#js-check-delete-parent').prop('checked', false);
          $('#js-check-all-parent').prop('checked', false);
        }
        //update permissions pickUp
        if (responseBody.permissions && responseBody.permissions.pickUp) {
          responseBody.permissions.pickUp.view ? $('#js-check-view-pickUp').prop('checked', true) : $('#js-check-view-pickUp').prop('checked', false);
          responseBody.permissions.pickUp.edit ? $('#js-check-edit-pickUp').prop('checked', true) : $('#js-check-edit-pickUp').prop('checked', false);
          responseBody.permissions.pickUp.view && responseBody.permissions.pickUp.edit ? $('#js-check-all-pickUp').prop('checked', true) : $('#js-check-all-pickUp').prop('checked', false);
        } else {
          $('#js-check-view-pickUp').prop('checked', false);
          $('#js-check-edit-pickUp').prop('checked', false);
          $('#js-check-all-pickUp').prop('checked', false);
        }
        //update permissions post
        if (responseBody.permissions && responseBody.permissions.post) {
          responseBody.permissions.post.view ? $('#js-check-view-post').prop('checked', true) : $('#js-check-view-post').prop('checked', false);
          responseBody.permissions.post.add ? $('#js-check-add-post').prop('checked', true) : $('#js-check-add-post').prop('checked', false);
          responseBody.permissions.post.edit ? $('#js-check-edit-post').prop('checked', true) : $('#js-check-edit-post').prop('checked', false);
          responseBody.permissions.post.delete ? $('#js-check-delete-post').prop('checked', true) : $('#js-check-delete-post').prop('checked', false);
          responseBody.permissions.post.view && responseBody.permissions.post.add && responseBody.permissions.post.edit && responseBody.permissions.post.delete ? $('#js-check-all-post').prop('checked', true) : $('#js-check-all-post').prop('checked', false);
        } else {
          $('#js-check-view-post').prop('checked', false);
          $('#js-check-add-post').prop('checked', false);
          $('#js-check-edit-post').prop('checked', false);
          $('#js-check-delete-post').prop('checked', false);
          $('#js-check-all-post').prop('checked', false);
        }
        //update permissions schedule
        if (responseBody.permissions && responseBody.permissions.schedule) {
          responseBody.permissions.schedule.view ? $('#js-check-view-schedule').prop('checked', true) : $('#js-check-view-schedule').prop('checked', false);
          responseBody.permissions.schedule.add ? $('#js-check-add-schedule').prop('checked', true) : $('#js-check-add-schedule').prop('checked', false);
          responseBody.permissions.schedule.edit ? $('#js-check-edit-schedule').prop('checked', true) : $('#js-check-edit-schedule').prop('checked', false);
          responseBody.permissions.schedule.delete ? $('#js-check-delete-schedule').prop('checked', true) : $('#js-check-delete-schedule').prop('checked', false);
          responseBody.permissions.schedule.view && responseBody.permissions.schedule.add && responseBody.permissions.schedule.edit && responseBody.permissions.schedule.delete ? $('#js-check-all-schedule').prop('checked', true) : $('#js-check-all-schedule').prop('checked', false);
        } else {
          $('#js-check-view-schedule').prop('checked', false);
          $('#js-check-add-schedule').prop('checked', false);
          $('#js-check-edit-schedule').prop('checked', false);
          $('#js-check-delete-schedule').prop('checked', false);
          $('#js-check-all-schedule').prop('checked', false);
        }
        //update permissions student
        if (responseBody.permissions && responseBody.permissions.student) {
          responseBody.permissions.student.view ? $('#js-check-view-student').prop('checked', true) : $('#js-check-view-student').prop('checked', false);
          responseBody.permissions.student.add ? $('#js-check-add-student').prop('checked', true) : $('#js-check-add-student').prop('checked', false);
          responseBody.permissions.student.edit ? $('#js-check-edit-student').prop('checked', true) : $('#js-check-edit-student').prop('checked', false);
          responseBody.permissions.student.delete ? $('#js-check-delete-student').prop('checked', true) : $('#js-check-delete-student').prop('checked', false);
          responseBody.permissions.student.view && responseBody.permissions.student.add && responseBody.permissions.student.edit && responseBody.permissions.student.delete ? $('#js-check-all-student').prop('checked', true) : $('#js-check-all-student').prop('checked', false);
        } else {
          $('#js-check-view-student').prop('checked', false);
          $('#js-check-add-student').prop('checked', false);
          $('#js-check-edit-student').prop('checked', false);
          $('#js-check-delete-student').prop('checked', false);
          $('#js-check-all-student').prop('checked', false);
        }
        //update permissions subject
        if (responseBody.permissions && responseBody.permissions.subject) {
          responseBody.permissions.subject.view ? $('#js-check-view-subject').prop('checked', true) : $('#js-check-view-subject').prop('checked', false);
          responseBody.permissions.subject.add ? $('#js-check-add-subject').prop('checked', true) : $('#js-check-add-subject').prop('checked', false);
          responseBody.permissions.subject.edit ? $('#js-check-edit-subject').prop('checked', true) : $('#js-check-edit-subject').prop('checked', false);
          responseBody.permissions.subject.delete ? $('#js-check-delete-subject').prop('checked', true) : $('#js-check-delete-subject').prop('checked', false);
          responseBody.permissions.subject.view && responseBody.permissions.subject.add && responseBody.permissions.subject.edit && responseBody.permissions.subject.delete ? $('#js-check-all-subject').prop('checked', true) : $('#js-check-all-subject').prop('checked', false);
        } else {
          $('#js-check-view-subject').prop('checked', false);
          $('#js-check-add-subject').prop('checked', false);
          $('#js-check-edit-subject').prop('checked', false);
          $('#js-check-delete-subject').prop('checked', false);
          $('#js-check-all-subject').prop('checked', false);
        }
        //update permissions taxonomy
        if (responseBody.permissions && responseBody.permissions.taxonomy) {
          responseBody.permissions.taxonomy.view ? $('#js-check-view-taxonomy').prop('checked', true) : $('#js-check-view-taxonomy').prop('checked', false);
          responseBody.permissions.taxonomy.add ? $('#js-check-add-taxonomy').prop('checked', true) : $('#js-check-add-taxonomy').prop('checked', false);
          responseBody.permissions.taxonomy.edit ? $('#js-check-edit-taxonomy').prop('checked', true) : $('#js-check-edit-taxonomy').prop('checked', false);
          responseBody.permissions.taxonomy.delete ? $('#js-check-delete-taxonomy').prop('checked', true) : $('#js-check-delete-taxonomy').prop('checked', false);
          responseBody.permissions.taxonomy.view && responseBody.permissions.taxonomy.add && responseBody.permissions.taxonomy.edit && responseBody.permissions.taxonomy.delete ? $('#js-check-all-taxonomy').prop('checked', true) : $('#js-check-all-taxonomy').prop('checked', false);
        } else {
          $('#js-check-view-taxonomy').prop('checked', false);
          $('#js-check-add-taxonomy').prop('checked', false);
          $('#js-check-edit-taxonomy').prop('checked', false);
          $('#js-check-delete-taxonomy').prop('checked', false);
          $('#js-check-all-taxonomy').prop('checked', false);
        }
        //update permissions user
        if (responseBody.permissions && responseBody.permissions.user) {
          responseBody.permissions.user.view ? $('#js-check-view-user').prop('checked', true) : $('#js-check-view-user').prop('checked', false);
          responseBody.permissions.user.add ? $('#js-check-add-user').prop('checked', true) : $('#js-check-add-user').prop('checked', false);
          responseBody.permissions.user.edit ? $('#js-check-edit-user').prop('checked', true) : $('#js-check-edit-user').prop('checked', false);
          responseBody.permissions.user.delete ? $('#js-check-delete-user').prop('checked', true) : $('#js-check-delete-user').prop('checked', false);
          responseBody.permissions.user.view && responseBody.permissions.user.add && responseBody.permissions.user.edit && responseBody.permissions.user.delete ? $('#js-check-all-user').prop('checked', true) : $('#js-check-all-user').prop('checked', false);
        } else {
          $('#js-check-view-user').prop('checked', false);
          $('#js-check-add-user').prop('checked', false);
          $('#js-check-edit-user').prop('checked', false);
          $('#js-check-delete-user').prop('checked', false);
          $('#js-check-all-user').prop('checked', false);
        }
      })
    });
    //END ONCLICK EDIT LINK
  }

  initValidation() {
    let _this = this;
    _this.formObj.formValidation({
      button: {
        selector: '#btnFormEditRole',
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
        console.log('----- FORM EDIT ROLE ----- [SUBMIT][START]');
        let $form = $(e.target);
        let formData = $form.serializeArray();
        let tmpData = {};
        _.each(formData, (item) => {
          tmpData[item.name] = item.value;
        });
        Cloud.editRole.with(tmpData).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
          if (err) {
            _this.alert.removeClass('d-none').addClass("alert-danger").html(_this.messages.error);
            setTimeout(function () {
              _this.alert.removeClass('alert-danger').addClass("d-none");
            }, 3000);
            return;
          } else {
            if (responseBody.message) {
              _this.alert.removeClass('d-none').addClass("alert-warning").html(responseBody.message);
              setTimeout(function () {
                _this.alert.removeClass('alert-warning').addClass("d-none");
              }, 3000);
              return;
            }
            _this.alert.removeClass('d-none').addClass("alert-success").html(_this.messages.editSuccess);
            setTimeout(function () {
              _this.alert.removeClass('alert-success').addClass("d-none");
            }, 3000);
          }
          _this.formObj.data('formValidation').resetForm(); //reset form to remove all messages, hide the feedback icons, ...
          //cloud success
        });
        //THEN RELOAD PAGE
        // window.location.reload();
        console.log('----- FORM EDIT ROLE ----- [SUBMIT][END]');
      });
  }

  initCheckAll() {
    new CheckBoxBackendEKP({
      isChkAll: true,
      selector: '#js-check-all-view',
      childSelector: '.js-checkbox-view',
      onChange: function (e, value) {
        console.log("===========================ONCHANGE SELECT ELEMENT VIEW============================");
        console.log(value);
      }
    });
    new CheckBoxBackendEKP({
      isChkAll: true,
      selector: '#js-check-all-add',
      childSelector: '.js-checkbox-add',
      onChange: function (e, value) {
        console.log("===========================ONCHANGE SELECT ELEMENT ADD============================");
        console.log(value);
      }
    });
    new CheckBoxBackendEKP({
      isChkAll: true,
      selector: '#js-check-all-edit',
      childSelector: '.js-checkbox-edit',
      onChange: function (e, value) {
        console.log("===========================ONCHANGE SELECT ELEMENT EDIT============================");
        console.log(value);
      }
    });
    new CheckBoxBackendEKP({
      isChkAll: true,
      selector: '#js-check-all-delete',
      childSelector: '.js-checkbox-delete',
      onChange: function (e, value) {
        console.log("===========================ONCHANGE SELECT ELEMENT DELETE============================");
        console.log(value);
      }
    });
    new CheckBoxBackendEKP({
      isChkAll: true,
      selector: '#js-check-all-album',
      childSelector: '.js-checkbox-album',
      onChange: function (e, value) {
        console.log("===========================ONCHANGE SELECT ELEMENT ALBUM============================");
        console.log(value);
      }
    });
    new CheckBoxBackendEKP({
      isChkAll: true,
      selector: '#js-check-all-attendent',
      childSelector: '.js-checkbox-attendent',
      onChange: function (e, value) {
        console.log("===========================ONCHANGE SELECT ELEMENT ATTENDENT============================");
        console.log(value);
      }
    });
    new CheckBoxBackendEKP({
      isChkAll: true,
      selector: '#js-check-all-branch',
      childSelector: '.js-checkbox-branch',
      onChange: function (e, value) {
        console.log("===========================ONCHANGE SELECT ELEMENT BRANCH============================");
        console.log(value);
      }
    });
    new CheckBoxBackendEKP({
      isChkAll: true,
      selector: '#js-check-all-class',
      childSelector: '.js-checkbox-class',
      onChange: function (e, value) {
        console.log("===========================ONCHANGE SELECT ELEMENT CLASS============================");
        console.log(value);
      }
    });
    new CheckBoxBackendEKP({
      isChkAll: true,
      selector: '#js-check-all-courseSession',
      childSelector: '.js-checkbox-courseSession',
      onChange: function (e, value) {
        console.log("===========================ONCHANGE SELECT ELEMENT COURSE SESSION============================");
        console.log(value);
      }
    });
    new CheckBoxBackendEKP({
      isChkAll: true,
      selector: '#js-check-all-currency',
      childSelector: '.js-checkbox-currency',
      onChange: function (e, value) {
        console.log("===========================ONCHANGE SELECT ELEMENT CURRENCY============================");
        console.log(value);
      }
    });
    new CheckBoxBackendEKP({
      isChkAll: true,
      selector: '#js-check-all-event',
      childSelector: '.js-checkbox-event',
      onChange: function (e, value) {
        console.log("===========================ONCHANGE SELECT ELEMENT EVENT============================");
        console.log(value);
      }
    });
    new CheckBoxBackendEKP({
      isChkAll: true,
      selector: '#js-check-all-feeInvoice',
      childSelector: '.js-checkbox-feeInvoice',
      onChange: function (e, value) {
        console.log("===========================ONCHANGE SELECT ELEMENT FEE INVOICE============================");
        console.log(value);
      }
    });
    new CheckBoxBackendEKP({
      isChkAll: true,
      selector: '#js-check-all-feeItem',
      childSelector: '.js-checkbox-feeItem',
      onChange: function (e, value) {
        console.log("===========================ONCHANGE SELECT ELEMENT FEE ITEM============================");
        console.log(value);
      }
    });
    new CheckBoxBackendEKP({
      isChkAll: true,
      selector: '#js-check-all-food',
      childSelector: '.js-checkbox-food',
      onChange: function (e, value) {
        console.log("===========================ONCHANGE SELECT ELEMENT FOOD============================");
        console.log(value);
      }
    });
    new CheckBoxBackendEKP({
      isChkAll: true,
      selector: '#js-check-all-menu',
      childSelector: '.js-checkbox-menu',
      onChange: function (e, value) {
        console.log("===========================ONCHANGE SELECT ELEMENT MENU============================");
        console.log(value);
      }
    });
    new CheckBoxBackendEKP({
      isChkAll: true,
      selector: '#js-check-all-notification',
      childSelector: '.js-checkbox-notification',
      onChange: function (e, value) {
        console.log("===========================ONCHANGE SELECT ELEMENT NOTIFICATION============================");
        console.log(value);
      }
    });
    new CheckBoxBackendEKP({
      isChkAll: true,
      selector: '#js-check-all-parent',
      childSelector: '.js-checkbox-parent',
      onChange: function (e, value) {
        console.log("===========================ONCHANGE SELECT ELEMENT PARENT============================");
        console.log(value);
      }
    });
    new CheckBoxBackendEKP({
      isChkAll: true,
      selector: '#js-check-all-pickUp',
      childSelector: '.js-checkbox-pickUp',
      onChange: function (e, value) {
        console.log("===========================ONCHANGE SELECT ELEMENT PICK UP============================");
        console.log(value);
      }
    });
    new CheckBoxBackendEKP({
      isChkAll: true,
      selector: '#js-check-all-post',
      childSelector: '.js-checkbox-post',
      onChange: function (e, value) {
        console.log("===========================ONCHANGE SELECT ELEMENT POST============================");
        console.log(value);
      }
    });
    new CheckBoxBackendEKP({
      isChkAll: true,
      selector: '#js-check-all-schedule',
      childSelector: '.js-checkbox-schedule',
      onChange: function (e, value) {
        console.log("===========================ONCHANGE SELECT ELEMENT SCHEDULE============================");
        console.log(value);
      }
    });
    new CheckBoxBackendEKP({
      isChkAll: true,
      selector: '#js-check-all-student',
      childSelector: '.js-checkbox-student',
      onChange: function (e, value) {
        console.log("===========================ONCHANGE SELECT ELEMENT STUDENT============================");
        console.log(value);
      }
    });
    new CheckBoxBackendEKP({
      isChkAll: true,
      selector: '#js-check-all-subject',
      childSelector: '.js-checkbox-subject',
      onChange: function (e, value) {
        console.log("===========================ONCHANGE SELECT ELEMENT SUBJECT============================");
        console.log(value);
      }
    });
    new CheckBoxBackendEKP({
      isChkAll: true,
      selector: '#js-check-all-taxonomy',
      childSelector: '.js-checkbox-taxonomy',
      onChange: function (e, value) {
        console.log("===========================ONCHANGE SELECT ELEMENT TAXONOMY============================");
        console.log(value);
      }
    });
    new CheckBoxBackendEKP({
      isChkAll: true,
      selector: '#js-check-all-user',
      childSelector: '.js-checkbox-user',
      onChange: function (e, value) {
        console.log("===========================ONCHANGE SELECT ELEMENT USER============================");
        console.log(value);
      }
    });
  }

  initDeleteRole() {
    let _this = this;
    $('#btnDeleteRole').click(() => {
      let id = _this.formObj.find('[name="id"]').val();
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
          Cloud.deleteRole.with({ id: id,  _csrf: $('[name="_csrf"]').val() }).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
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
                window.location.reload();
              })
            }
          })
        }
      });
    })
  }
}