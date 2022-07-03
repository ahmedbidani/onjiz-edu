const ERRORS = {
    ERR_ADD_FAIL: { code: 'ERR_STUDENT_001', message: "Student add failed" },
    ERR_EDIT_FAIL: { code: 'ERR_STUDENT_002', message: "Student edit failed" },
    ERR_UPDATE_FAIL: { code: 'ERR_STUDENT_003', message: "Student update failed" },
    ERR_NOT_FOUND: { code: 'ERR_STUDENT_004', message: "Student is not found" },
  
    ERR_ID_REQUIRED: { code: 'ERR_STUDENT_005', message: "Student Id is required" },
    ERR_FULLNAME_REQUIRED: { code: 'ERR_STUDENT_006', message: "Fullname is required" },
    ERR_BIRTHDAY_REQUIRED: { code: 'ERR_STUDENT_008', message: "Birthday is required" },
    ERR_GENDER_REQUIRED: { code: 'ERR_STUDENT_010', message: "Gender is required" },
  };
    
    module.exports = ERRORS;