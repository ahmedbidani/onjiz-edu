/**
 * @copyright 2017 @ ZiniMediaTeam
 * @author brianvo
 * @create 2017/10/23 01:05
 * @update 2017/10/23 01:05
 * @file api/models/Attendent.js
 * @description :: Attendent model.
 */

module.exports = {

    attributes: {
        student: {
            model: 'student',
            required: true
        },
        status: {                           //Integer {"ABSENT":0, "ATTENDANT":1}
            type: 'number',
            isIn: [sails.config.custom.STATUS.ABSENT, sails.config.custom.STATUS.ATTENDANT],
            defaultsTo: sails.config.custom.STATUS.ABSENT
        },
        date: {
            type: 'string', /* Ngày áp dụng format YYYY-mm-dd*/
        },
        time: {
            type: 'string',
            description: 'Time attendant'
        }, 
        note: {
            type: 'string'
        },
        movingProcessStep: {
            type: 'number',
            defaultsTo: 0 // step in student moving process setting
        },
        tracking: {
            type: 'json',
            defaultsTo: [{ step: 1, time: '', userIn: '', userOut: '', note: '' }, { step: 2, time: '', userIn: '', userOut: '', note: '' },
            { step: 3, time: '', userIn: '', userOut: '', note: '' }, { step: 4, time: '', userIn: '', userOut: '', note: '' }]
        },
        classObj: {
            model: 'class',
            required: true
        },
        school: {
            model: 'school',
            required: true
        }
    }
};