class IndexHealthFrontendEKP extends BaseBackendEKP {
  constructor() {
    super();
    this.initialize();
  }

  initialize() {
    let _this = this;
    _this.formId = 'formStudent';
    _this.formObj = $('#' + this.formId);
    _this.alert = this.formObj.find('.alert');

    _this.onChangeClass();
    _this.onChangeStudent();
    _this.initValidation();
    $('.js-process-basic-multiple').select2();
  }

  onChangeClass() {
    let _this = this;
    $('#selectClass').change(() => {
      let classId = $('#selectClass').val();
      if (classId == '') {
        $('#selectStudent').html('');
        _this.renderStudentHealth({});
      } else {
        Cloud.searchStudentByClass.with({ classId: classId }).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
          if (err) {
            console.log(err);
          } else {
            let listStudents = responseBody;
            if (listStudents.length) {
              //render select student
              $('#selectStudent').html('');
              for (let i = 0; i < listStudents.length; i++) {
                $('#selectStudent').append(new Option(listStudents[i].firstName + ' ' + listStudents[i].lastName, listStudents[i].id));
              }
              //render student health
              _this.renderStudentHealth(listStudents[0]);
            }
          }
          //cloud success
        });
      }
    })
  }

  onChangeStudent() {
    let _this = this;
    _this.onChangeClass();

    $('#selectStudent').change(() => {
      let studentId = $('#selectStudent').val();
      Cloud.getStudent.with({ studentId: studentId }).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
        if (err) {
          console.log('err: ', err);
          return;
        } else {
          _this.renderStudentHealth(responseBody.data);
          return;
        }
      });
    });
  }

  renderStudentHealth(studentObj) {
    $('#studentId').val(studentObj.id);
    $('#height').val(studentObj.height);
    $('#weight').val(studentObj.weight);
    $('#bloodGroup').val(studentObj.bloodGroup).change();//if current user is teacher or school admin
    $('#bloodGroup').val(studentObj.bloodGroup);//if current user is parent
    $('#allergy').val(studentObj.allergy);
    $('#heartRate').val(studentObj.heartRate);
    $('#eyes').val(studentObj.eyes);
    $('#ear').val(studentObj.ear);
    $('#notes').val(studentObj.notes);
  }

  initValidation() {
    let _this = this;
    _this.formObj.formValidation({
      button: {
        selector: '#btnFormStudent',
        disabled: 'disabled'
      },
      fields: {
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
    }).on('success.form.fv', function (e) {
      // Prevent form submission
      e.preventDefault();
      console.log('----- FORM SCHEDULE ----- [SUBMIT][START]');
      let $form = $(e.target);
      let formData = $form.serializeArray();
      let tmpData = {};
      _.each(formData, (item) => {
        tmpData[item.name] = item.value;
      });
      if (tmpData.studentId) {

        Cloud.editStudent.with(tmpData).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
          if (err) {
            console.log('err: ', err);
            return;
          } else {
            _this.alert.removeClass('hidden alert-danger').addClass("alert-success");
            setTimeout(function () {
              _this.alert.addClass('hidden alert-danger').removeClass("alert-success");
              _this.formObj.data('formValidation').resetForm(); //reset form to remove all messages, hide the feedback icons, ...
            }, 3000);
          }
        });
      }
    });
  }
}
