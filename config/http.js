/**
 * HTTP Server Settings
 * (sails.config.http)
 *
 * Configuration for the underlying HTTP server in Sails.
 * (for additional recommended settings, see `config/env/production.js`)
 *
 * For more information on configuration, check out:
 * https://sailsjs.com/config/http
 */

module.exports.http = {

  /****************************************************************************
  *                                                                           *
  * Sails/Express middleware to run for every HTTP request.                   *
  * (Only applies to HTTP requests -- not virtual WebSocket requests.)        *
  *                                                                           *
  * https://sailsjs.com/documentation/concepts/middleware                     *
  *                                                                           *
  ****************************************************************************/

  middleware: {
    order: [
      'session',
      'bodyParser',
      'compress',
      'foobar',                  // <==== We can put other, custom HTTP middleware like this wherever we want.
      'myRequestLogger',
      'poweredBy',
      'router',
      'www',
      'favicon',
    ],

    // An example of a custom HTTP middleware function:
    foobar: (function (){
      console.log('Initializing `foobar` (HTTP middleware)...');
      return function (req,res,next) {
        console.log('Received HTTP request: '+req.method+' '+req.path);
        return next();
      };
    })(),
    myRequestLogger: function (req, res, next) {
      res.on("finish", function(){
      sails.log(res.statusCode);
     });
     return next();
    }
    
    /***************************************************************************
    *                                                                          *
    * The order in which middleware should be run for HTTP requests.           *
    * (This Sails app's routes are handled by the "router" middleware below.)  *
    *                                                                          *
    ***************************************************************************/

    // order: [
    //   'cookieParser',
    //   'session',
    //   'bodyParser',
    //   'compress',
    //   'poweredBy',
    //   'router',
    //   'www',
    //   'favicon',
    // ],


    /***************************************************************************
    *                                                                          *
    * The body parser that will handle incoming multipart HTTP requests.       *
    *                                                                          *
    * https://sailsjs.com/config/http#?customizing-the-body-parser             *
    *                                                                          *
    ***************************************************************************/

    // bodyParser: (function _configureBodyParser(){
    //   var skipper = require('skipper');
    //   var middlewareFn = skipper({ strict: true });
    //   return middlewareFn;
    // })(),

  },

};
