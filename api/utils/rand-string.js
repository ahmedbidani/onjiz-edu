/**
 * @copyright 2018 @ ZiniMedia Ltd. Co
 * @author thanhvo
 * @create 2017/07/05 11:51
 * @update 2017/07/05 16:54
 * @file api/utils/rand-string.js
 */

var randString = function(n)
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    n = n > 0 ? n : 5;

    for( var i=0; i < n; i++ ) text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};

module.exports = randString;