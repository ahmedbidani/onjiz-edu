module.exports = {

  friendlyName: 'Format number to currency format',
  description: 'Format number to currency format',

  inputs: {
    number: {
      type: 'number',
      required: true
    },
    currency: {
      type: 'json',
      required: true
    }
  },
  exits: {
    success: {}
  },
  fn: async function (inputs, exits) {

    let result = (Math.round(inputs.number * 1000) / 1000).toFixed(inputs.currency.decimalPlaces).replace('.', inputs.currency.decimalPoint).replace(/\B(?=(\d{3})+(?!\d))/g, inputs.currency.numberSeperatorSymbol);
    if (inputs.currency.symbolLeft != '') result = inputs.currency.symbolLeft + ' ' + result;
    if (inputs.currency.symbolRight != '') result += ' ' + inputs.currency.symbolRight;
    return exits.success(result);
  }
};
