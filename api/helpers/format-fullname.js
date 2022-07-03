module.exports = {

  friendlyName: 'Format number to currency format',
  description: 'Format number to currency format',

  inputs: {
    firstName: {
      type: 'string',
      required: true
    },
    lastName: {
      type: 'string',
      required: true
    },
    type: {
      type: 'string',
      required: true
    }
  },
  exits: {
    success: {}
  },
  fn: async function (inputs, exits) {

    let result =  inputs.firstName + " " + inputs.lastName;
    if (inputs.type == 'lastfirst') result = inputs.lastName + " " + inputs.firstName;
    // else if (inputs.type == 'first') result = inputs.firstName;
    // else if (inputs.type == 'last') result = inputs.lastName;

    return exits.success(result);
  }
};
