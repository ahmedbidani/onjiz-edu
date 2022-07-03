class SignUpPage extends EKP {
  constructor () {
    super(SAILS_LOCALS.PAGE.SIGNUP);
    this.initialize();
  }

  initialize () {
    console.log('init signup page');
    console.log(this.page);

    if(this.page != SAILS_LOCALS.CURRENT_PAGE) return;

    $('#frmSignup').validator().on('submit', (e)=>{
      if (e.isDefaultPrevented()) {
        //nothing
      } else {
        e.preventDefault();
        //looks good
        console.log('[SUBMIT][START] ----- frmSignup -----');

        //prepare data
        let formData = $('#frmSignup').serializeArray();
        let tmpData = {};
        _.each(formData, (item) => {
          tmpData[item.name] = item.value;
        });
        delete tmpData.confirmPassword;
        //sign up start
        Cloud.signup.with(tmpData).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
          if (err) {
            //err from server responde
            if(err.code == 'emailAlreadyInUse'){
              $('#emailAlreadyInUse').removeClass('hidden');
              $('#otherError').addClass('hidden');
              $('#signupSuccess').addClass('hidden');
            } else {
              $('#emailAlreadyInUse').addClass('hidden');
              $('#otherError').removeClass('hidden');
              $('#signupSuccess').addClass('hidden');
            }
            return; 
          }
          //cloud success
          $('#signupContainer').addClass('hidden');
          $('#signupSuccess').removeClass('hidden');
          $('#inputEmail').html(tmpData.emailAddress);
          $('#emailAlreadyInUse').addClass('hidden');
          $('#otherError').addClass('hidden');
              
          console.log('----- frmSignup ----- [SUBMIT][END]');
        });
      }
    });
  }
}

$(document).ready(() => {
  let signupPage = new SignUpPage(); 
});