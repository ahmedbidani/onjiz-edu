/**
 * @copyright 2018 @ ZiniMedia Ltd. Co
 * @author thanhvo
 * @create 2017/07/05 11:51
 * @update 2017/07/05 16:54
 * @file api/utils/rand-string.js
 */

/**
 * @copyright 2018 @ ZiniMedia Ltd. Co
 * @author thanhvo
 * @create 2017/12/03 03:05
 * @update 2017/12/03 03:05
 * @file utils/is-json.js
 */
'use strict';

const isJsonString = require('./is-json');
const parseTimeToSecond = require('./parse-time-to-int');
const randString = require('./rand-string');
const getSetting = require('./setting');
const addZero = require('./add-zero');
const stringToMinutes = require('./string-to-minutes');
const urlFriendly = require('./UrlFriendly');

const Utils = {
    isJsonString: isJsonString,
    parseTimeToSecond: parseTimeToSecond,
    randString: randString,
    getSetting: getSetting,
    addZero: addZero,
    stringToMinutes: stringToMinutes,
    urlFriendly: urlFriendly
};

module.exports = Utils;