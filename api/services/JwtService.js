/**
 * @copyright 2017 @ ZiniMedia Team
 * @author DevTeam
 * @create 2019/09/06
 * @update 
 * @file api/services/JwtService.js
 */
'use strict';
var jwt = require('jsonwebtoken');
var jwtSecret = sails.config.secrets.jwtSecret;

const JwtService = {
  sign: function (payload) {
    let token = jwt.sign(payload, jwtSecret, { expiresIn: '7d' });
    return token;
  },

  verify: function (token, callback) {
    return jwt.verify(token, jwtSecret, callback);
  }
}

module.exports = JwtService;