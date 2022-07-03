/**
 * @copyright 2020 @ ZiniMediaTeam
 * @author dao.nguyen
 * @create 2020/03/30 10:31
 * @update 2010/03/30 10:31
 * @file api/models/Event.js
 * @description :: Event model.
 */

module.exports = {
  attributes: {
    title: {
      type: "string",
      required: true
    },
    alias: {
      type: "string"
    },
    motto: {
      type: "string"
    },
    description: {
      type: "string",
      required: true
    },
    dateStart: {
      type: 'string',
      description: 'day start format YYYY-MM-DD',
      defaultsTo: ''
    },
    dateEnd: {
      type: 'string',
      description: 'day end format YYYY-MM-DD',
      defaultsTo: ''
    },
    timeStart: {
      type: 'string',
      description: 'time start format HH:mm'
    },
    timeEnd: {
      type: 'string',
      description: 'time end format HH:mm'
    },
    venue: {
      type: 'string'
    },
    address: {
      type: 'string'
    },
    mapIframe: {
      type: 'string'
    },
    amount: {
      type: "number",
      defaultsTo: 0
    },
    status: {
      //Integer {"DRAFT":0,"ACTIVE":1}
      type: "number",
      isIn: [
        sails.config.custom.STATUS.DRAFT,
        sails.config.custom.STATUS.ACTIVE
      ],
      defaultsTo: sails.config.custom.STATUS.DRAFT
    },
    type: {
      //Integer {"SINGLE":0,"RECURRING":1}
      type: "number",
      isIn: [
        sails.config.custom.TYPE.SINGLE,
        sails.config.custom.TYPE.RECURRING
      ],
      defaultsTo: sails.config.custom.TYPE.SINGLE
    },
    recurringDay: { //REQUIRED IF IT'S RECURRING EVENT
      type: 'json',
      description: 'array of day of the week', //example [0,1,2,3,4] (0 is Sun, 1 is Mon, 2 is Tue, ...)
      defaultsTo: []
    },
    media: {
      model: "media"
    },
    author: {
      model: "user" //For AUTHOR INFO
    },
    school: {
      model: 'school',
      required: true
    }
  }
};
  