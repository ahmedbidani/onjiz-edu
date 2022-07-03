const rp = require('request-promise');

module.exports = {

  friendlyName: 'Push notification by expo',
  description: 'Push notification by expo',

  inputs: {
    id: {
      type: 'string',
      required: true
    },
    title: {
      type: 'string',
      required: true
    },
    message: {
      type: 'string',
      required: true
    }
  },
  exits: {
    success: {}
  },
  fn: async function (inputs, exits) { 
    sails.log.info("=== helpers/expo-push-notification => START ==========="); 
    
    // Check push to devices this notification
    // If status == publish => push
    // If status == draft => no push
    // START:
    // get user by noteType
    let _willPushPersons = [], _willPushNotifications = [];
    _willPushPersons = await User.find({
      expoToken: {
        "!=" : ""
      },
      status: sails.config.custom.STATUS.ACTIVE
    });
    // push to expo server
    if (_willPushPersons.length > 0) {
      _willPushPersons.forEach(async (person) => {
        console.log('_willPushPersons -> person', person);
        if (
          person.expoToken &&
          person.expoToken !== '' &&
          person.expoToken !== undefined
        ) {
          _willPushNotifications.push({
            to: person.expoToken,
            sound: 'default',
            title: inputs.title,
            body: inputs.message,
            data: {
              title: inputs.title,
              body: inputs.message
            }
          });
        }
        //add to collection
        await User.addToCollection(person.id, 'notifications').members([
          inputs.id
        ]);
      });
      //expo push notifications
      if (_willPushNotifications.length > 0) {
        var options = {
          method: 'POST',
          uri: 'https://exp.host/--/api/v2/push/send',
          body: _willPushNotifications,
          json: true // Automatically parses the JSON string in the response
        };
        rp(options)
          .then(parsedBody => {
            // POST succeeded...
            sails.log('parsedBody', parsedBody);
          })
          .catch(err => {
            // POST failed...
          });
      }
    }
    // END

    return exits.success({ status: 'ok' });
  }
};
