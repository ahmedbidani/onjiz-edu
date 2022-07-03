module.exports.socket = {
  /************* Auth **************/
  // 'PUT /socket/v1/auth/token': { controller: 'socket/SocketAuthController', action: 'getToken' },
  // 'GET /socket/v1/auth/sampleToken': { controller: 'socket/SocketAuthController', action: 'sampleToken' },
  // 'PUT /socket/v1/auth/update-token': { controller: 'socket/SocketAuthController', action: 'updateToken' },
  // //LOGIN
  // 'PUT /socket/v1/entrance/login/': { controller: 'socket/SocketLoginController', action: 'login' },
  // USER
  'POST /socket/user/add': { controller: 'socket/SocketUserController', action: 'add' }
}
