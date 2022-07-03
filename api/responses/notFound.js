/**
 * notFound.js
 */
module.exports = function notFound() {

  let req = this.req;
  let res = this.res;

  sails.log.verbose('Ran custom response: res.notFound()');
    return res.redirect('/not-found');
};
