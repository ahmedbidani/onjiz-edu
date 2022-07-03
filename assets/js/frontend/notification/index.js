class IndexNotificationFrontendEKP extends BaseBackendEKP {
    constructor() {
      super();
      this.initialize();
    }
  
    initialize() {
      let _this = this;
      
      _this.initReadNotification();
    }

    initReadNotification() {
      let _this = this;
      $('.item-notification').click((e) => {
        let notificationId = $(e.target).attr('data-notificationId');
        Cloud.readNotification.with({ id: notificationId, _csrf: $('[name="_csrf"]').val() }).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
          if (err) {
            console.log('err: ', err);
            return;
          } else {
            $(e.target).css('font-weight', 500);
            return;
          }
        });
      })
    }
  }