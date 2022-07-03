// const bcrypt = require('bcrypt');
const {
  stringify
} = require('querystring');
const fetch = require('node-fetch');
const GOOGLE_SECRET_KEY = sails.config.custom.GOOGLE_SECRET_KEY;
module.exports = {
  friendlyName: 'Login',
  description: 'Log in using the provided email and password combination.',
  extendedDescription: `This action attempts to look up the user record in the database with the
specified email address.  Then, if such a user exists, it uses
bcrypt to compare the hashed password from the database with the provided
password attempt.`,
  inputs: {
    emailAddress: {
      description: 'The email to try in this attempt, e.g. "irl@example.com".',
      type: 'string',
      required: true
    },
    password: {
      description: 'The unencrypted password to try in this attempt, e.g. "passwordlol".',
      type: 'string',
      required: true
    },
    captcha: {
      description: 'captcha.',
      type: 'string',
      required: true
    }

  },
  exits: {
    success: {
      description: 'The requesting user agent has been successfully logged in.',
      extendedDescription: `Under the covers, this stores the id of the logged-in user in the session
as the \`userId\` key.  The next time this user agent sends a request, assuming
it includes a cookie (like a web browser), Sails will automatically make this
user id available as req.session.userId in the corresponding action.  (Also note
that, thanks to the included "custom" hook, when a relevant request is received
from a logged-in user, that user's entire record from the database will be fetched
and exposed as \`req.me\`.)`
    },
    badCombo: {
      description: `The provided email and password combination does not
      match any user in the database.`,
      responseType: 'unauthorized'
      // ^This uses the custom `unauthorized` response located in `api/responses/unauthorized.js`.
      // To customize the generic "unauthorized" response across this entire app, change that file
      // (see http://sailsjs.com/anatomy/api/responses/unauthorized-js).
      //
      // To customize the response for _only this_ action, replace `responseType` with
      // something else.  For example, you might set `statusCode: 498` and change the
      // implementation below accordingly (see http://sailsjs.com/docs/concepts/controllers).
    },
    accountNotReady: {
      description: `You must login with role SCHOOL ADMIN.`,
      responseType: 'unauthorized'
    }

  },

  fn: async function (inputs, exits) {
    let that = this;
    if (!that.req.body.captcha)
      throw 'Failed captcha input';

    // Secret key
    // const secretKey = "6Leiq8IZAAAAACbWkRg_2nTzpL6kscJLMtRu3LQp";

    // Verify URL
    const query = stringify({
      secret: GOOGLE_SECRET_KEY,
      response: that.req.body.captcha,
      remoteip: that.req.connection.remoteAddress
    });
    const verifyURL = `https://google.com/recaptcha/api/siteverify?${query}`;

    // Make a request to verifyURL
    const body = await fetch(verifyURL).then(res => res.json());

    // If not successful
    if (body.success !== undefined && !body.success)
      throw 'captchaFaill';

    // Look up by the email address.
    // (note that we lowercase it to ensure the lookup is always case-insensitive,
    // regardless of which database we're using)
    var userRecord;
    if (inputs.emailAddress.indexOf('@') > -1) {
      userRecord = await User.findOne({
        emailAddress: inputs.emailAddress.toLowerCase(),
      })
    } else {
      userRecord = await User.findOne({
        userName: inputs.emailAddress,
      })
    }
    // If there was no matching user, respond thru the "badCombo" exit.
    if (!userRecord) {
      userRecord = await Agency.findOne({
        emailAddress: inputs.emailAddress.toLowerCase(),
      })
      if (!userRecord){
        throw 'badCombo';
      }
      else{
        userRecord.isAgency = true
      }
    }

    // If the password doesn't match, then also exit thru "badCombo".
    sails.log('-------------------------', inputs.password);
    await sails.helpers.passwords.checkPassword(inputs.password, userRecord.password)
      .intercept('incorrect', 'badCombo');


    //CHECK IS SCHOOL ADMIN
    if (!userRecord.isSuperAdmin && userRecord.userType != sails.config.custom.TYPE.SCHOOLADMIN && userRecord.userType != sails.config.custom.TYPE.ACCOUNTANT && !userRecord.isAgency) {
      //SCHOOLADMIN: 3
      //ACCOUNTANT: 4
      throw 'accountNotReady';
    }

    // Modify the active session instance.
    this.req.session.userId = userRecord.id;

    // Send success response (this is where the session actually gets persisted)
    return exits.success({
      code: 200,
      user: userRecord,
      description: 'Log in success.'
    });

  }

};
