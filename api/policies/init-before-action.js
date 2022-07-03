/**
 * is-logged-in
 *
 * A simple policy that allows any request from an authenticated user.
 *
 * For more about how to use policies, see:
 *   https://sailsjs.com/config/policies
 *   https://sailsjs.com/docs/concepts/policies
 *   https://sailsjs.com/docs/concepts/policies/access-control-and-permissions
 */
module.exports = async function (req, res, proceed) {
  //console.log(req.options.controller); // Controller name
  //console.log(req.options.action);     // Action name
  let _webModule = await sails.helpers.initWebModule(req);
  res.locals.webModule = _webModule;
  return proceed();
};
