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

  // If `req.me` is set, then we know that this request originated
  // from a logged-in user.  So we can safely proceed to the next policy--
  // or, if this is the last policy, the relevant action.
  // > For more about where `req.me` comes from, check out this app's
  // > custom hook (`api/hooks/custom/index.js`).
  if (req.me) {
    let permisions = await sails.helpers.checkPermission(req);
    if(!permisions) return res.nonPermission();
    return proceed();
  }
  let school = await School.find({  });
  if (school.length == 0) return proceed();

  let adminSchool = await User.find({ userType: 3 });
  if (adminSchool.length == 0) return proceed();
  //--•
  // Otherwise, this request did not come from a logged-in user.
  return res.unauthorized();

};
