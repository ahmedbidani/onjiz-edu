/**
 * @copyright 2018 @ ZiniMedia Ltd. Co
 * @author thanhvo
 * @create 2017/10/21 19:45
 * @update 2017/10/21 19:45
 * @file api/models/Setting.js
 */
'use strict';

module.exports = {
    attributes: {
        key: {
            type: 'string',
            required: true,
            unique:true,
            maxLength: 32
        }, 
        value: {
            type: 'json',
            defaultsTo: []
        },
        school: {
          model: 'school',
          //required: true
        }
    }
};