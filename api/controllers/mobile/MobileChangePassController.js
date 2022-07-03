/**
 * Change Password Controller
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const ErrorMessage = require('../../../config/errors');
const UserService = require('../../services/UserService');
const ParentService = require('../../services/ParentService');

module.exports = {

    changePassword: async (req, res) => {
        // sails.log('--- resetPassword ---');
        const params = req.allParams();
        if (!params.school) return res.badRequest(ErrorMessage.SCHOOL_ID_REQUIRED);

        //check email exist
        let _userFound = await UserService.find({
            emailAddress: params.emailAddress.toLowerCase(),
            school: params.school
        });
        let _parentFound = await ParentService.find({
            emailAddress: params.emailAddress.toLowerCase(),
            school: params.school
        });
        if (_userFound.length) {
            try {
                await sails.helpers.passwords.checkPassword(params.passwordNow, _userFound[0].password).intercept('incorrect', 'badCombo');
            } catch (err) {
                if (err) {
                    return res.badRequest(ErrorMessage.CHANGE_PASS_ERR_CURRENT_PASS_WRONG);
                }
            }

            // Hash the new password.
            var hashed = await sails.helpers.passwords.hashPassword(params.passwordNew);

            // Update the record for the logged-in user.
            _userFound = await User.update({ id: _userFound[0].id }).set({ password: hashed }).fetch();

            return res.json({
                code: 'SUCCESS_200',
                data: hashed
            });
        } else if (_parentFound.length) {
            try {
                await sails.helpers.passwords.checkPassword(params.passwordNow, _parentFound[0].password).intercept('incorrect', 'badCombo');
            } catch (err) {
                if (err) {
                    return res.badRequest(ErrorMessage.CHANGE_PASS_ERR_CURRENT_PASS_WRONG);
                }
            }

            // Hash the new password.
            var hashed = await sails.helpers.passwords.hashPassword(params.passwordNew);

            // Update the record for the logged-in user.
            _parentFound = await Parent.update({ id: _parentFound[0].id }).set({ password: hashed }).fetch();

            return res.json({
                code: 'SUCCESS_200',
                data: hashed
            });
        } else {
            return res.json(ErrorMessage.USER_ERR_NOT_FOUND);
        }
    }
}