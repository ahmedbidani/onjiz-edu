class IndexFeeCollectionSettingBackendEKP extends BaseBackendEKP {
  constructor() {
    super();
    this.initialize();
  }

  initialize() {
    this.form = new FormFeeCollectionSettingBackendEKP(this);
  }
}
class FormFeeCollectionSettingBackendEKP {
  constructor(opts) {
    _.extend(this, opts);
    this.formId = 'formFeeCollectionSetting';
    this.formObj = $('#' + this.formId);
    
    this.alert = this.formObj.find('.alert');
    this.initialize();
  }

  initialize() {
    let _this = this; 
    _this.initValidation();
    _this.initRepeater();
  } 

  initValidation() {
    let _this = this;
    _this.formObj.formValidation({
      button: {
        selector: '#btnFormFeeCollectionSetting',
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
        console.log('----- FORM Setting ----- [SUBMIT][START]');
        let $form = $(e.target);
        let formData = $form.serializeArray();
        let flagForTransfer = true;
        let tmpData = {};
        _.each(formData, (item) => {
          if (!item.name.includes('transferInfo')) {
            tmpData[item.name] = item.value;
          }
        });

        if (tmpData.allowTransfer) {

          //get all array {time+food} of all repeater
          let tmpTransferInfoArr = $('.repeater').repeaterVal();
          tmpData.transferInfo = tmpTransferInfoArr.transferInfo;
          if (tmpData.transferInfo.length == 0) {
            _this.alert.removeClass('hidden alert-success').addClass("alert-danger").html('Bank info is required!');
            flagForTransfer = false;
          } else {
            //check data slot transferInfo empty
            let isValid = true;
            for (let slot of tmpData.transferInfo) {
              if (slot.code == '' || slot.name == '' || slot.accountName == '' || slot.accountNumber == '') {
                isValid = false;
              }
            }
            // if (isValid) {
  
            //   let manner = _this.formObj.attr('data-manner');
            //   //reset form validator
            //   if (manner === 'edit') {
            //     Cloud.editFeeCollectionSetting.with(tmpData).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
            //       if (err) {
            //         _this.alert.removeClass('hidden alert-success').addClass("alert-danger")
            //         return;
            //       } else {
            //         _this.alert.removeClass('hidden alert-danger').addClass("alert-success");
            //       }
            //     });
            //   }
            //   console.log('----- FORM Setting ----- [SUBMIT][END]');
            // } else {
            //   _this.alert.removeClass('hidden alert-success').addClass("alert-danger").html('The data input is invalid!');
            // }
            if (!isValid) {
              _this.alert.removeClass('hidden alert-success').addClass("alert-danger").html('The data input is required!');
              flagForTransfer = false;
            }
          }
        }

        if (flagForTransfer) {
          let manner = _this.formObj.attr('data-manner');
          //reset form validator
          if (manner === 'edit') {
            Cloud.editFeeCollectionSetting.with(tmpData).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
              if (err) {
                _this.alert.removeClass('hidden alert-success').addClass("alert-danger")
                return;
              } else {
                _this.alert.removeClass('hidden alert-danger').addClass("alert-success");
              }
            });
          }
          console.log('----- FORM Setting ----- [SUBMIT][END]');
        }

      });
  }

  initRepeater() {
    let _this = this;
    $('.repeater').repeater({
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
      }
    });
  }
}