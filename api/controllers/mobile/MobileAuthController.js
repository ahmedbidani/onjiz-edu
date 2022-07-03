/**
 * @copyright 2018 @ ZiniMedia Ltd. Co
 * @author thanhvo
 * @create 2017/10/21 20:18
 * @update 2017/10/21 20:18
 * @file api/controllers/AuthController.js
 */
'use strict';

const ErrorMessage = require('../../../config/errors');
const AuthService = require("../../services/AuthService");

const CryptoJS = require("crypto");

const MobileAuthController = {


    getToken: async function (req, res) {
        sails.log.info("====================== AuthController.getToken ==========================");
        let data = {};
        let params = req.allParams();
        let AppInfo = 'KINDIE';
        let secret = params.secret;
        let codeVerify = params.codeVerify;

        let myCodeVerify = '';
        try {
            myCodeVerify = CryptoJS.createHash('sha256').update(AppInfo + secret).digest('hex');
        } catch (err) {
            sails.log('check error', err);
        }


        if (!secret) return res.badRequest(ErrorMessage.AUTH_ERR_SECRET_NOT_VALID);
        if (!codeVerify) return res.badRequest(ErrorMessage.AUTH_ERR_CODE_VERIFY_NOT_VALID);

        if (myCodeVerify === codeVerify) {
            data = {
                token: myCodeVerify
            }
            let newObj = await AuthService.add(data);
            return res.ok(myCodeVerify);
        } else {
            return res.badRequest(ErrorMessage.AUTH_ERR_CODE_VERIFY_NOT_VALID);
        }
    },
    sampleToken: async function (req, res) {
        sails.log.info("====================== AuthController.sampleToken ==========================");
        let params = req.allParams();
        let data = {};
        let AppInfo = 'KINDIE';
        let secreted = 'bao';

        let codeVerify = CryptoJS.createHash('sha256').update(AppInfo + secreted).digest('hex');

        if (!codeVerify) return res.badRequest(ErrorMessage.AUTH_ERR_SYSTEM_TOKEN_REQUIRE);
        return res.ok(codeVerify);
    },


    updateToken: async function (req, res) {
        sails.log.info("================================ AuthController.updateToken ================================");

        let params = req.allParams();

        if (!params.token) return res.badRequest(ErrorMessage.AUTH_ERR_SYSTEM_TOKEN_REQUIRE);

        //ALWAYS CHECK  OBJECT EXIST BEFORE UPDATE
        let authObj = AuthService.get({ id: params.token });
        if (!authObj) return res.notFound(ErrorMessage.AUTH_ERR_NOT_FOUND);
        //UPDATE DATA
        let time = new Date().getTime();
        let data = {
            expireAt: time + 5 * 60
        }
        let editObj = await AuthService.edit({ id: params.token }, data);
        return res.ok(editObj);

    },
};

module.exports = MobileAuthController;