'use strict';
const fs = require('fs');

const StudentMedicalService = {
    get: async (options) => {
        sails.log.info("================================ MedicalService.get -> options: ================================");
        sails.log.info(options);

        let records = await Student_Medical.findOne(options).populate('student').populate('medical');
        return records;
        
    }
};

module.exports = StudentMedicalService;