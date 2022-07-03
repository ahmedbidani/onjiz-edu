/**
 * @copyright 2018 @ ZiniMedia Ltd. Co
 * @author thanhvo
 * @create 2017/12/03 12:31
 * @update 2017/12/03 12:31
 * @file api/utils/add-zero.js
 */
'use strict';

let addZero = (i) => {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
};

module.exports = addZero;