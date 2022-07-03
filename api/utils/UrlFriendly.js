/**
 * @copyright 2017 @ ZiniMedia Team
 * @author thanhvo
 * @create 2017/12/03 12:31
 * @update 2017/12/03 12:31
 * @file api/utils/UrlFriendlyString.js
 */
const UrlSafeString = require('larvitslugify');
const lowerCase = require('lower-case');

const urlFriendly = (i) => {
    return lowerCase(UrlSafeString(i));
};

module.exports = urlFriendly;