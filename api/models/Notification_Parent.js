module.exports = {
  attributes: {
    notification: {
      model: 'notifications',
      required: true
    },
    parent: {
      model: 'parent',
      required: true
    },
    isRead: {
      type: 'boolean',
      defaultsTo: false
    }
  },
};
