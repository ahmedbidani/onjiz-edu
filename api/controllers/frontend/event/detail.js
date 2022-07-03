const moment = require('moment');

module.exports = {
  exits: {
    success: {
      viewTemplatePath: "frontend/pages/event/detail",
      description: "Display the event detail page."
    },
    redirect: {
      responseType: "redirect"
    }
  },
  fn: async function(inputs, exits) {
    let _default = await sails.helpers.getFeDefaultData(this.req);
    
    let eventId = _default.params.id ? _default.params.id : null;
    let eventObj = await EventService.get({id: eventId});

    let dateFormat = _default.webSettings && _default.webSettings.value && _default.webSettings.value.dateFormat ? _default.webSettings.value.dateFormat : 'DD/MM/YYYY';
    eventObj.startDate = moment(eventObj.startDate, 'YYYY-MM-DD').format(dateFormat);
    eventObj.endDate = moment(eventObj.endDate, 'YYYY-MM-DD').format(dateFormat);

    if (eventObj.type == 1){
      let recurringDay = eventObj.recurringDay.map((item)=>{
        switch (item) {
          case '1':
            return sails.__('Mon');
            break;
          case '2':
            return sails.__('Tue');
            break;
          case '3':
            return sails.__('Wed');
            break;
          case '4':
            return sails.__('Thu');
            break;
          case '5':
            return sails.__('Fri');
            break;
          case '6':
            return sails.__('Sat');
            break;
          case '7':
            return sails.__('Sun');
            break;
          default:
            break;
        }
      });
      eventObj.recurringDay = recurringDay.join(', ');
    }

    _default.eventObj = eventObj;
    return exits.success(_default);
  }
};
