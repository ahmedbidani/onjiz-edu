class IndexListMessageBackendEKP extends BaseBackendEKP {
  constructor() {
    super();
    this.initialize();
  }

  initialize() {
    let _this = this;
    _this.addBtn = $('#add-message');
    _this.prevMsgData = null; //get the last user of messagedata
    _this.initChat();
    _this.initLoadMore();
    //_this.onChangeClass();
    $('.js-height-scrollbar').perfectScrollbar();
  }

  initChat() {

    let _this = this;
    let userId = $('#userId').val();
    let classId = $('#classId').val();
    let messageId = $('#messageId').val();

    $('.message-scroller').scrollTop($('.message-scroller').prop("scrollHeight"));

    //join room of class
    io.socket.get('/api/v1/backend/message/joinRoom', { classId: classId }, function gotResponse(body, response) {
      console.log('Data: ', body);
    })

    //seen message
    io.socket.get('/api/v1/backend/message-' + messageId + '/getSeenMessage', {userId: userId}, function gotResponse(body, response) {
      console.log('Data: ', body);
    })

    //listen event
    io.socket.on('CHAT_' + messageId , function getNewMessages (data) {
      console.log('New message: ', data);
      if (userId == data.user.id) {
        if ( _this.prevMsgData && ( data.user.id != _this.prevMsgData.user.id || moment(data.createdAt).diff(moment(_this.prevMsgData.createdAt),'minutes') >= 5) ) {
          $('#message-content').append(`
            <li class="reverse">
              <div class="chat-content">
                <div class="chat-name-time">${data.user.firstName ? data.user.firstName + ' ' + data.user.lastName : ''}, ${moment(data.createdAt).format('hh:mm A')}</div>
                <div class="box bg-light-info">${data.txtMessage }</div>
              </div>
              <div class="chat-img"><img src=${data.user.avatar != '' ? data.user.avatar : '/images/avatar2.png'} alt=${data.user.firstName ? data.user.firstName + ' ' + data.user.lastName : ''}></div>
            </li>
          `)
        } else {
          $('#message-content').append(`
            <li class="reverse">
              <div class="chat-content">
                <div class="chat-name-time">${data.user.firstName ? data.user.firstName + ' ' + data.user.lastName : ''}, ${moment(data.createdAt).format('hh:mm A')}</div>
                <div class="box bg-light-info">${data.txtMessage }</div>
              </div>
              <div class="chat-img"><img src=${data.user.avatar != '' ? data.user.avatar : '/images/avatar2.png'} alt=${data.user.firstName ? data.user.firstName + ' ' + data.user.lastName : ''}></div>
            </li>
          `)
        }
      } else {
        if (_this.prevMsgData && ( data.user.id != _this.prevMsgData.user.id || moment(data.createdAt).diff(moment(_this.prevMsgData.createdAt),'minutes') >= 5) ) {
          $('#message-content').append(`
            <li>
              <div class="chat-img"><img src=${data.user.avatar != '' ? data.user.avatar : '/images/avatar2.png'} alt=${data.user.firstName ? data.user.firstName + ' ' + data.user.lastName : ''}></div>
              <div class="chat-content">
                <div class="chat-name-time">${data.user.firstName ? data.user.firstName + ' ' + data.user.lastName : ''}, ${moment(data.createdAt).format('hh:mm A')}</div>
                <div class="box bg-light-info">${data.txtMessage }</div>
              </div>
            </li>
            `)
        } else {
          $('#message-content').append(`
            <li>
              <div class="chat-img"><img src=${data.user.avatar != '' ? data.user.avatar : '/images/avatar2.png'} alt=${data.user.firstName ? data.user.firstName + ' ' + data.user.lastName : ''}></div>
              <div class="chat-content">
                <div class="chat-name-time">${data.user.firstName ? data.user.firstName + ' ' + data.user.lastName : ''}, ${moment(data.createdAt).format('hh:mm A')}</div>
                <div class="box bg-light-info">${data.txtMessage }</div>
              </div>
            </li>
          `)
        }

      }
      $('.no-chat-content').html('');
      $('.chat-rbox').scrollTop($('.chat-rbox').prop("scrollHeight"));
      $(".chat-rbox").perfectScrollbar('update');
      _this.prevMsgData = data; //change last user of message data
    });

    //press button "enter" => press button send
    $("#txtMessage").keypress(function (event) {
      if (event.which === 13) {
        event.preventDefault();
        _this.addBtn.click();
      }
    });

    //listen event click on button
    _this.addBtn.click(() => {
      let txtMessage = $('#txtMessage').val();
      if (txtMessage == "") {
        swal({
          title: this.messages.typeMessage,
          icon: 'error',
          button: {
           text: this.messages.continue,
            value: true,
            visible: true,
            className: "btn btn-primary"
          }
        }).then((value) => {
          //THEN RELOAD PAGE IF NEEDED
          //window.location.reload();
          })
      } else {
        io.socket.post('/api/v1/backend/message/storeMessageData', {userId: userId, messageId: messageId, txtMessage: txtMessage, _csrf: $('[name="_csrf"]').val() }, function gotResponse(body, response) {
          console.log('Data: ', body);
        })
        $('#txtMessage').val('');
      }
    })
  }

  initLoadMore() {
    let _this = this;
    let page = 1;
    let classId = $('#classId').val();
    let messageId = $('#messageId').val();
    let userActive = $('#userId').val();

    $('#load-more').on('click', function () {
      Cloud.getListMessages.with({messageId: messageId, page: page + 1}).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
        if (err) {
          return;
        } else {
          if (responseBody.data) {
            let dataLogs = responseBody.data.dataLogs;

            //insert data to layout
            if (dataLogs.length > 0) {
              let prevUser = {id:''};
              for (let i = dataLogs.length - 1; i >= 0; i--) {
                if (dataLogs[i]) {
                  if (userActive != dataLogs[i].user.id) {
                    if (prevUser.id != dataLogs[i].user.id) {
                      $('.load-more-content').prepend(`
                        <li>
                          <div class="chat-img"><img src=${dataLogs[i].user.avatar != '' ? dataLogs[i].user.avatar : '/images/avatar2.png'} alt=${dataLogs[i].user.firstName ? dataLogs[i].user.firstName + ' ' + dataLogs[i].user.lastName : ''}></div>
                          <div class="chat-content">
                            <div class="chat-name-time">${dataLogs[i].user.firstName ? dataLogs[i].user.firstName + ' ' + dataLogs[i].user.lastName : ''}, ${moment(dataLogs[i].createdAt).format('hh:mm A')}</div>
                            <div class="box bg-light-info">${dataLogs[i].txtMessage }</div>
                          </div>
                        </li>
                      `)
                    } else {
                      $('.load-more-content').prepend(`
                        <li>
                          <div class="chat-img"><img src=${dataLogs[i].user.avatar != '' ? dataLogs[i].user.avatar : '/images/avatar2.png'} alt=${dataLogs[i].user.firstName ? dataLogs[i].user.firstName + ' ' + dataLogs[i].user.lastName : ''}></div>
                          <div class="chat-content">
                            <div class="chat-name-time">${dataLogs[i].user.firstName ? dataLogs[i].user.firstName + ' ' + dataLogs[i].user.lastName : ''}, ${moment(dataLogs[i].createdAt).format('hh:mm A')}</div>
                            <div class="box bg-light-info">${dataLogs[i].txtMessage }</div>
                          </div>
                        </li>
                      `)
                    }
                  } else {
                    if (prevUser.id != dataLogs[i].user.id) {
                      $('.load-more-content').prepend(`
                        <li class="reverse">
                          <div class="chat-content">
                            <div class="chat-name-time">${dataLogs[i].user.firstName ? dataLogs[i].user.firstName + ' ' + dataLogs[i].user.lastName : ''}, ${moment(dataLogs[i].createdAt).format('hh:mm A')}</div>
                            <div class="box bg-light-info">${dataLogs[i].txtMessage }</div>
                          </div>
                          <div class="chat-img"><img src=${dataLogs[i].user.avatar != '' ? dataLogs[i].user.avatar : '/images/avatar2.png'} alt=${dataLogs[i].user.firstName ? dataLogs[i].user.firstName + ' ' + dataLogs[i].user.lastName : ''}></div>
                        </li>
                      `)
                    } else {
                      $('.load-more-content').prepend(`
                        <li class="reverse">
                          <div class="chat-content">
                            <div class="chat-name-time">${dataLogs[i].user.firstName ? dataLogs[i].user.firstName + ' ' + dataLogs[i].user.lastName : ''}, ${moment(dataLogs[i].createdAt).format('hh:mm A')}</div>
                            <div class="box bg-light-info">${dataLogs[i].txtMessage }</div>
                            <div class="chat-time">${moment(dataLogs[i].createdAt).format('hh:mm A')}</div>
                          </div>
                          <div class="chat-img"><img src=${dataLogs[i].user.avatar != '' ? dataLogs[i].user.avatar : '/images/avatar2.png'} alt=${dataLogs[i].user.firstName ? dataLogs[i].user.firstName + ' ' + dataLogs[i].user.lastName : ''}></div>
                        </li>
                      `)
                  }
                }
                  prevUser = dataLogs[i].user
                }
              }
              let time = moment(dataLogs[0].createdAt).format("hh:mm A, DD-MM-YYYY");
              $('.load-more-content').prepend(`
                <div class="text-center">
                  <p>${time}</p>
                </div>
              `)
            } else {
              $('.load-more-button').html('');
            }

          } else {
            $('.load-more-button').html('');
          }
        }
        //cloud success
      });
      page += 1;
    })
  }

  // onChangeClass() {
  //   let _this = this;
  //   $('.class-chat').on('click', function () {
  //     let classId = $(this).attr("data-classId");
  //     $('#classId').val(classId);
  //     _this.classId = classId;
  //     $('.box-title').text($(this).attr("data-classTitle"));
  //     let userActive = $('#userActive').val();

  //     Cloud.getListMessages.with({classId: classId, page: 1}).protocol('jQuery').exec((err, responseBody, responseObjLikeJqXHR) => {
  //       if (err) {
  //         return;
  //       } else {
  //         if (responseBody.data) {
  //           $('#message-content').html('');
  //           let dataLogs = responseBody.data.dataLogs;

  //           //insert data to layout
  //           if (dataLogs.length > 0) {
  //             let prevUser = {id:''};
  //             for (let i = 0; i < dataLogs.length; i++) {
  //               if (dataLogs[i]) {
  //                 if (userActive != dataLogs[i].user.id) {
  //                   if (prevUser.id != dataLogs[i].user.id) {
  //                     $('#message-content').append(`
  //                       <li class="reverse">
  //                         <div class="chat-content">
  //                           <h5>${dataLogs[i].user.firstName ? dataLogs[i].user.firstName + ' ' + dataLogs[i].user.lastName : ''}</h5>
  //                           <div class="box bg-light-info">${dataLogs[i].txtMessage }</div>
  //                           <div class="chat-time">${moment(dataLogs[i].createdAt).format('hh:mm A')}</div>
  //                         </div>
  //                         <div class="chat-img"><img src=${dataLogs[i].user.avatar != '' ? dataLogs[i].user.avatar : '/images/avatar2.png'} alt=${dataLogs[i].user.firstName ? dataLogs[i].user.firstName + ' ' + dataLogs[i].user.lastName : ''}></div>
  //                       </li>
  //                     `)
  //                   } else {
  //                     $('#message-content').append(`
  //                       <li class="reverse">
  //                         <div class="chat-content">
  //                           <h5>${dataLogs[i].user.firstName ? dataLogs[i].user.firstName + ' ' + dataLogs[i].user.lastName : ''}</h5>
  //                           <div class="box bg-light-info">${dataLogs[i].txtMessage }</div>
  //                           <div class="chat-time">${moment(dataLogs[i].createdAt).format('hh:mm A')}</div>
  //                         </div>
  //                         <div class="chat-img"><img src=${dataLogs[i].user.avatar != '' ? dataLogs[i].user.avatar : '/images/avatar2.png'} alt=${dataLogs[i].user.firstName ? dataLogs[i].user.firstName + ' ' + dataLogs[i].user.lastName : ''}></div>
  //                       </li>
  //                     `)
  //                   }
  //                 } else {
  //                   if (prevUser.id != dataLogs[i].user.id) {
  //                     $('#message-content').append(`
  //                       <li>
  //                         <div class="chat-img"><img src=${dataLogs[i].user.avatar != '' ? dataLogs[i].user.avatar : '/images/avatar2.png'} alt=${dataLogs[i].user.firstName ? dataLogs[i].user.firstName + ' ' + dataLogs[i].user.lastName : ''}></div>
  //                         <div class="chat-content">
  //                           <h5>${dataLogs[i].user.firstName ? dataLogs[i].user.firstName + ' ' + dataLogs[i].user.lastName : ''}</h5>
  //                           <div class="box bg-light-info">${dataLogs[i].txtMessage }</div>
  //                           <div class="chat-time">${moment(dataLogs[i].createdAt).format('hh:mm A')}</div>
  //                         </div>
  //                       </li>
  //                     `)
  //                   } else {
  //                     $('#message-content').append(`
  //                       <li>
  //                         <div class="chat-img"><img src=${dataLogs[i].user.avatar != '' ? dataLogs[i].user.avatar : '/images/avatar2.png'} alt=${dataLogs[i].user.firstName ? dataLogs[i].user.firstName + ' ' + dataLogs[i].user.lastName : ''}></div>
  //                         <div class="chat-content">
  //                           <h5>${dataLogs[i].user.firstName ? dataLogs[i].user.firstName + ' ' + dataLogs[i].user.lastName : ''}</h5>
  //                           <div class="box bg-light-info">${dataLogs[i].txtMessage }</div>
  //                           <div class="chat-time">${moment(dataLogs[i].createdAt).format('hh:mm A')}</div>
  //                         </div>
  //                       </li>
  //                     `)
  //                 }
  //               }
  //                 prevUser = dataLogs[i].user
  //               }
  //             }
  //           } else {
  //             $('#message-content').append(`
  //               <div class='no-chat-content'>Chưa có tin nhắn nào</div>
  //             `)
  //           }

  //         }

  //         if (responseBody.messageId) {
  //           $('#messageId').val(responseBody.messageId);
  //           _this.messageId = messageId;
  //         }
  //       }
  //       //cloud success
  //     });
  //   });
  // }
}
