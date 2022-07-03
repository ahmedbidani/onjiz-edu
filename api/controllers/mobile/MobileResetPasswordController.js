/**
 * Reset Password Controller
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const UserService = require('../../services/UserService');
const ParentService = require('../../services/ParentService');

module.exports = {
    resetPassword: async (req, res) => {
        // sails.log('--- resetPassword ---');
        const params = req.allParams();
        //check email exist
        let _userFound = await UserService.find({
            emailAddress: params.emailAddress.toLowerCase()
        });
        let _parentFound = await ParentService.find({
            emailAddress: params.emailAddress.toLowerCase()
        });
        if (_userFound.length) {
            let text = "";
            let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for (let i = 0; i < 10; i++) {
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            // Hash the new password.
            var hashed = await sails.helpers.passwords.hashPassword(text);
            sails.log('check data hash', hashed);
            // Update the record for the logged-in user.
            _userFound = await User.update({ id: _userFound[0].id }).set({ password: hashed }).fetch();
            _userFound = _userFound[0];
            _userFound.password = text;

            //send email with link
            MailerService.sendForgotPasswordMail(_userFound);  // <= Here we using

            return res.json({
                message: 'Mật khẩu được gửi đi thành công, vui lòng kiểm tra thông tin tài khoản của bạn !'
            });
        } else if (_parentFound.length) {
            let text = "";
            let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for (let i = 0; i < 10; i++) {
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            sails.log('password', text);
            // Hash the new password.
            var hashed = await sails.helpers.passwords.hashPassword(text);
            sails.log('check data hash', text);
            // Update the record for the logged-in user.
            _parentFound = await Parent.update({ id: _parentFound.id }).set({ password: hashed }).fetch();
            _parentFound = _parentFound[0];
            _parentFound.password = text;

            //send email with link
            MailerService.sendForgotPasswordMail(_parentFound);  // <= Here we using

            return res.json({
                message: 'Mật khẩu được gửi đi thành công, vui lòng kiểm tra thông tin tài khoản của bạn !'
            });
        } else {
            return res.json({
                message: 'E-mail không tồn tại, vui lòng thử lại !'
            });
        }
    }
}