module.exports = {
  
  friendlyName: 'Generate default data object',
  description: 'Generate default data object',

  inputs: {
    text: {
      type: 'string'
    }
  },
  exits: {
    success: {}
  },
  
  fn: async function (inputs, exits) {

    //remove accents of text search
    let charCodes = [768, 777, 769, 803] // huyen, hoi, sac, nang
    let newString = inputs.text || '';
    newString = newString.replace(new RegExp("[ắằẳẵặấầẩẫậăâåàáảãạä]", 'g'),"a");
    newString = newString.replace(new RegExp("[êềếểễệèéẻẽẹë]", 'g'),"e");
    newString = newString.replace(new RegExp("[ìíïịỉĩ]", 'g'),"i");
    newString = newString.replace(new RegExp("[ôồốổỗộờớởỡợòóỏõọơö]", 'g'),"o");
    newString = newString.replace(new RegExp("[ừứửữựùúủũụưü]", 'g'),"u");
    newString = newString.replace(new RegExp("[ỳýỷỹỵÿ]", 'g'),"y");
    newString = newString.replace(new RegExp("[đĐ]", 'g'),"d");
    
    let arr = newString.split('');
    for(let j=0; j<arr.length; j++){
        if(charCodes.indexOf(arr[j].charCodeAt(0)) != -1){
            arr[j] = '';
        }
    }
    newString = arr.join('');
    newString = newString.toLowerCase();

    return exits.success(newString);

  }

};
