/**
 * JWT Auth Policy
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user via JWT token
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */

const ErrorMessage = require('../../config/errors');
const TOKEN_RE = /^Bearer$/i;

module.exports = function (req, res, next) {
	let token = null;

	if (req.headers && req.headers.authorization) {
		const parts = req.headers.authorization.split(' ');
		if (parts.length === 2) {
			const scheme = parts[0];
			const credentials = parts[1];

			if (TOKEN_RE.test(scheme)) {
				token = credentials;
			}
		}
	} else {
		return res.badRequest('No Authorization header was found');
	}

	if (!token) {
		return res.badRequest('Format is "Authorization: Bearer [token]"');
	}

	UserService
		.authenticateUserByToken(token)
		.then(user => {
			req.userInfo = user.toJSON();
			next();
		})
		.catch(err => {
			switch (err) {
				case ErrorMessage.INACTIVE_TOKEN:
				case ErrorMessage.USER_ERR_NOT_FOUND:
				case ErrorMessage.USER_LOCKED:
				default:
					return res.badRequest('Invalid token');
			}
		});
};

