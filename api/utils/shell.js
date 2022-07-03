/**
 * @copyright 2018 @ ZiniMedia Ltd. Co
 * @author thanhvo
 * @create 2017/10/21 09:19
 * @update 2017/10/22 12:14
 */
'use strict';

// https://gist.github.com/millermedeiros/4724047
exports.exec = function(cmd, cb){
    // this would be way easier on a shell/bash script :P
    let child_process = require('child_process');
    let parts = cmd.split(/\s+/g);
    let p = child_process.spawn(parts[0], parts.slice(1), {stdio: 'inherit'});
    p.on('exit', function(code){
        let err = null;
        if (code) {
            err = new Error('command "'+ cmd +'" exited with wrong status code "'+ code +'"');
            err.code = code;
            err.cmd = cmd;
        }
        if (cb) cb(err);
    });
};


// execute multiple commands in series
// this could be replaced by any flow control lib
exports.series = function(cmds, cb){
    let execNext = function(){
        exports.exec(cmds.shift(), function(err){
            if (err) {
                cb(err);
            } else {
                if (cmds.length) execNext();
                else cb(null);
            }
        });
    };
    execNext();
};