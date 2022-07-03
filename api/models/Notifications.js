module.exports = {

    attributes: {
        title: {
            type: 'string',
            required: true
        },
        message: {
            required: true,
            type: 'string',
        },
        status: {
            type: 'number',
            isIn: [sails.config.custom.STATUS.TRASH, sails.config.custom.STATUS.DRAFT, sails.config.custom.STATUS.ACTIVE],
            defaultsTo: sails.config.custom.STATUS.DRAFT
        },
        type: {
            type: 'number',
            isIn: [sails.config.custom.TYPE.NEWS_PARENT, sails.config.custom.TYPE.NEWS_ALL, sails.config.custom.TYPE.FEE_INVOICE, sails.config.custom.TYPE.ALBUM, sails.config.custom.TYPE.MENU, sails.config.custom.TYPE.SUBJECT, sails.config.custom.TYPE.ATTENDENT, sails.config.custom.TYPE.DAY_OFF,sails.config.custom.TYPE.PICK_UP, sails.config.custom.TYPE.NEWS_TEACHER],
            defaultsTo: sails.config.custom.TYPE.NEWS_ALL
        },
        classList: {
            type: 'json',
            description: 'List schedule data',
            defaultsTo: [{"class": '' }]
        },
        school: {
          model: 'school',
          required: true
        }
    },
};
