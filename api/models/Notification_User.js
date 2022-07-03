module.exports = {
  attributes: {
    notification: {
      model: 'notifications',
      required: true
    },
    user: {
      model: 'user',
      required: true
    },
    isRead: {
      type: 'boolean',
      defaultsTo: false
    }
  },
};
