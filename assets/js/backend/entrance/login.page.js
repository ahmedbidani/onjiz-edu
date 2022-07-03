class LoginPage extends EKP {
  constructor() {
    super(SAILS_LOCALS.PAGE.LOGIN);
    this.initialize();
  }

  initialize() {

    if (this.page != SAILS_LOCALS.CURRENT_PAGE) return;

    $('#frmLogin').validator().on('submit', (e) => {
      if (e.isDefaultPrevented()) {
        //nothing
      } else {
        e.preventDefault();
        //looks good
        console.log('[SUBMIT][START] ----- frmLogin -----');
        //prepare data
        let formData = $('#frmLogin').serializeArray();
        let tmpData = {};
        _.each(formData, (item) => {
          tmpData[item.name] = item.value;
        });
        //sign up start
        Cloud.login.with(tmpData).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
          if (err) {
            //err from server responde
            if (err.code == 'badCombo') {
              $('#loginFail').removeClass('hidden');
              $('#otherError').addClass('hidden');
            } else {
              $('#loginFail').addClass('hidden');
              $('#otherError').removeClass('hidden');
            }
            return;
          }
          //cloud success
          console.log('----- frmLogin ----- [SUBMIT][END]');

          window.location = SAILS_LOCALS.URL.DASHBOARD;
        });
      }
    });
  }
}

$(document).ready(() => {
  let loginPage = new LoginPage();
});
