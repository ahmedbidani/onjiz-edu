module.exports = {

  attributes: {
    classObj: {
      model: 'class',
      required: true
    },
    date: {
      type: 'string', /* Ngày áp dụng format YYYY-mm-dd*/
    },
    note: {
      type: 'string',
      defaultsTo: ''
    },
    student: {
      collection: 'student',
      via: 'medical',
      through: 'student_medical'
    }
  }
};