/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */


module.exports = {
  // Controller action
  getSocketID: function(req, res) {
    if (!req.isSocket) {
      return res.badRequest();
    }

    var socketId = sails.sockets.getId(req);
    // => "BetX2G-2889Bg22xi-jy"

    sails.log('My socket ID is: ' + socketId);

    return res.json(socketId);
  },


  add: async (req, res) => {
    // GET ALL PARAMS
    if (!req.isSocket) {
      return res.badRequest();
    }
    const params = req.allParams();
    sails.log(params);
    //var roomName = req.param('');
    var roomName = 'CLASS';
    sails.sockets.join(req, roomName, function(err) {
      if (err) {
        return res.serverError(err);
      } 
    });
    sails.sockets.broadcast(roomName, 'USER_JOINED', { numUsers: 2 });
    //sails.sockets.blast('USER_JOINED', { numUsers: 2 });
    // RETURN DATA USER
    return res.json({
      statusCode: 1
    });
  },

  addMessage: async (req, res) => {
    // GET ALL PARAMS
    if (!req.isSocket) {
      return res.badRequest();
    }
    const params = req.allParams();
    if (!params.ids || !params.ids.length) {
      return res.badRequest(MenuError.ERR_ID_REQUIRED);
    }
    let message = params.message;
    var roomName = 'CLASS';
    sails.sockets.join(req, roomName, function(err) {
      if (err) {
        return res.serverError(err);
      } 
    });
    sails.sockets.broadcast(roomName, 'USER_CHAT', { message: message });
    // RETURN DATA USER
    return res.json({
      statusCode: 1
    });
  }
};