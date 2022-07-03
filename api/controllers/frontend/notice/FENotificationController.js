module.exports = {
  read: async (req, res) => {
    sails.log.info( "================================ FENotificationController.read => START ================================");
    // GET ALL PARAMS
    const params = req.allParams();

    if (!params.id)return res.badRequest(ErrorMessage.NOTIFICATION_ERR_ID_REQUIRED);

    await Notification_User.update({ notification: params.id, user: req.me.id }).set({ isRead: true });
    await Notification_Parent.update({ notification: params.id, parent: req.me.id }).set({ isRead: true });

    return res.ok({});
  },
};
