/**
 * @copyright 2018 @ ZiniMedia Ltd. Co
 * @author thanhvo
 * @create 2019/10/21 20:18
 * @update 2019/10/21 20:18
 * @file api/models/Auth.js
 */
'use strict';

module.exports = {
    attributes: {
        message: {
            model:'message',
            required: true
        },
        dataLogs: {
            type: 'json',
            defaultsTo: [] // array obj { user: {model: 'user'}, txtMessage:"", createAt: Date.now() }
        },
        dateUse: {
            type: 'string', /* Ngày áp dụng format YYYY-mm-dd*/
        },
        school: {
          model: 'school',
          required: true
        }
    }
};