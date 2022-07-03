let fs = require('file-system');
let moment = require('moment');

module.exports = {
  
  
  friendlyName: 'Upload file to folder',
  description: 'Upload file to folder',

  inputs: {
    req: {
      type: 'ref'
    },
    file: {
      type: 'string'
    },
    dest: {
      type: 'string'
    },
    fileName: {
      type: 'string'
    }
  },

  exits: {
    success: {},
    cannotupload: {
      description: 'Could not upload file.'
    }
  },
  
  fn: async function (inputs, exits) {
    
    let fileEl = inputs.file;
    let uploadConfig = sails.config.custom.UPLOAD;

    //make dir current YYYY/MM/DD
    fs.mkdir(require('path').resolve(uploadConfig.PATH_FOLDER, 'assets/uploads/') + '/' + moment().format('YYYY/MM'))

    let dest = require('path').resolve(uploadConfig.PATH_FOLDER, 'assets/uploads/') + '/' + moment().format('YYYY/MM');

    let maxMB = 1000;
    //get maximum size of upload from setting
    if (inputs.req && inputs.req.me && inputs.req.me.school) {
      let setting = await Setting.findOne({ key: 'web', school: inputs.req.me.school });
      if (setting && setting.value && setting.value.maximumUploadSize) {
        maxMB = setting.value.maximumUploadSize;
      }
    }

    await inputs.req.file(fileEl).upload({
      // option
      // maxBytes: maxMB * 1024 * 1024,
      dirname: dest,
      // saveAs: inputs.fileName,
      // option
    }, async function whenDone(err, files) {
      if (err) return exits.cannotupload(err.code);
      
      return exits.success(files);
    });
  }
};