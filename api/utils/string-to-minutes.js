/**
 * @copyright 2018 @ ZiniMedia Ltd. Co
 * @author thanhvo
 * @create 2017/12/03 12:31
 * @update 2017/12/03 12:31
 * @file api/utils/string-to-minutes.js
 */
'use strict';

/**
 * input:
 * - hour: "21:47
 * output:
 * - minutes: 123
 * */
const stringToMinutes = (hour) => {

    if(!hour || hour.length < 2) return 0;

    let arr = hour.split(':');

    let h = parseInt(arr[0], 10);
    let m = parseInt(arr[1], 10);

    return h * 60 + m;
};

module.exports = stringToMinutes;