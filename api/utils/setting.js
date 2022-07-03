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
 * @create 2017/10/16 17:05
 * @update 2017/10/16 17:05
 * @file utils/setting.js
 */
'use strict';

const getSetting = function(name)
{
    let setting = sails.setting || [];

    for (let i = 0; i < setting.length; i++) {
        let set = setting[i];

        if(set.name === name) return set.value;
    }

    return null;
};

module.exports = getSetting;