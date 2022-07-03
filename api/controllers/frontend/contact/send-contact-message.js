module.exports = {


  friendlyName: 'Send contact message',


  description: 'Send contact message to the technical email address of school.',


  inputs: {

    schoolId: {
      type: 'string',
      required: true
    },
    email: {
      example: 'daonq@example.com',
      type: 'string',
      required: true
    },
    phone: {
      example: '0123456789',
      type: 'string',
      required: true
    },
    name: {
      example: 'daonq',
      type: 'string',
      required: true
    },
    subject: {
      example: 'new contact message',
      type: 'string',
      required: true
    },
    message: {
      example: 'message',
      type: 'string',
      required: true
    },

  },


  exits: {

    success: {
      description: 'Send email successfully'
    },
    badCombo: {
      description: `Missing some required feild.`
    }

  },


  fn: async function (inputs, exits) {
    if (!inputs.schoolId || !inputs.email || !inputs.phone || !inputs.name || !inputs.subject || !inputs.message) {
      throw 'badCombo';
    }
    
    let obj = {
      email: inputs.email,
      phone: inputs.phone,
      name: inputs.name,
      subject: inputs.subject,
      message: inputs.message
    }

    let webSettings = await Setting.findOne({ key: 'web', school: inputs.schoolId });
    if (!webSettings || !webSettings.value || !webSettings.value.mailTechnical) throw 'badCombo'; 
    let mailTechnical = webSettings.value.mailTechnical;
    obj.mailTechnical = mailTechnical;

    //send email with link
    console.log('==============================')
    console.log('test before send', obj);
    console.log('==============================')
    MailerService.sendContactMessage(obj);  // <= Here we using
    return exits.success({
      code: 200,
      obj: obj,
      description: 'Send message successfully'
    });


  }


};
