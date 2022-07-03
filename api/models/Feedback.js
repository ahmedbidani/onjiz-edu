module.exports = {
  attributes: {
    createdBy: {
      model: 'parent',
      required: true
    },
    title: {                            // 
      type: 'string',
      description: 'The title is how it appears on your site',
      required: true
    },
    description: {
      type: 'json',
      defaultsTo: []
    },
    principal: {
      type: 'boolean',
      defaultsTo: false
    },
    status: {
      type: 'number',
      isIn: [sails.config.custom.STATUS.TRASH,sails.config.custom.STATUS.DRAFT,sails.config.custom.STATUS.ACTIVE],
      defaultsTo: sails.config.custom.STATUS.DRAFT
    },
    school: {
      model: 'school',
      required: true
    },
    user: {
      collection: 'user',
      via: 'feedback',
      through: 'feedback_user'
    }
  }
};