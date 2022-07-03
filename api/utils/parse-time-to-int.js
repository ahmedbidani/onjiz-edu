/**
 * @copyright 2018 @ ZiniMedia Ltd. Co
 * @author thanhvo
 * @create 2017/07/05 11:51
 * @update 2017/07/05 16:54
 * @file api/utils/rand-string.js
 */

let parseTimeToSecond = function (strTime) {

    let result = 0;
    let asp = strTime.split(' ');
    let arr = asp[0].split(':');

    if (arr[0] < 12) {
        result = arr[0] * 3600 // hours
    }

    result += arr[1] * 60; // minutes
    result += arr[2] ? parseInt(arr[2]) : 0; // seconds

    if (strTime.indexOf('P') > -1) {  // 8:00 PM > 8:00 AM
        result += 43200
    }

    return result
};

module.exports = parseTimeToSecond;