module.exports = function nonPermission() {

  var req = this.req;
  var res = this.res;
  let nameAction = this.req.options.action;
  let arr = nameAction.split('/');
  let controller = arr[arr.length - 2];
  req.session.messages = { success: [], error: [], warning: [] };
  let strController = sails.__(controller);
  //req.session.messages['error'] = ("You have no permission to access module %s. Please contact the administrator", controller);
  req.session.messages['error'] = sails.__("You have no permission to access module %s. Please contact the administrator.", strController);
  //res.locals.error_messages = "abc non permistion";
  // sails.log.verbose('Ran custom response: res.numpermission()');

  // if (req.wantsJSON) {
  //   return res.sendStatus(401);
  // }
  // // Or log them out (if necessary) and then redirect to the login page.
  // else {

    return res.redirect('/backend/dashboard');
  // }

};