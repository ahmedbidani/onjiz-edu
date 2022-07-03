module.exports = {


  friendlyName: 'Send password recovery email',


  description: 'Send a password recovery notification to the user with the specified email address.',


  inputs: {

    emailAddress: {
      description: 'The email address of the alleged user who wants to recover their password.',
      example: 'rydahl@example.com',
      type: 'string',
      required: true
    }

  },


  exits: {

    success: {
      description: 'The email address might have matched a user in the database.  (If so, a recovery email was sent.)'
    },
    badCombo: {
      description: `The provided email does not match any user in the database.`
    }

  },


  fn: async function (inputs, exits) {
    if (!inputs.emailAddress) {
      throw 'badCombo';
    }
    // Find the record for this user.
    // (Even if no such user exists, pretend it worked to discourage sniffing.)
    var userRecord = await User.findOne({
      emailAddress: inputs.emailAddress
    });

    // If there was no matching user, respond thru the "badCombo" exit.
    if (!userRecord) {
      throw 'badCombo';
    }

    let text = "";
    // let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let possible = "0123456789";
    for (let i = 0; i < 6; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    // Hash the new password.
    var hashed = await sails.helpers.passwords.hashPassword(text);
    // Update the record for the logged-in user.
    userRecord = await User.update({
        id: userRecord.id
      })
      .set({
        password: hashed
      })
      .fetch();
    userRecord = userRecord[0];
    userRecord.password = text;

    //send email with link

    console.log('==============================')
    console.log('test before send', userRecord);
    console.log('==============================')
    MailerService.sendForgotPasswordMail(userRecord); // <= Here we using
    return exits.success({
      code: 200,
      user: userRecord,
      description: 'Reset password successfully'
    });


  }


};
