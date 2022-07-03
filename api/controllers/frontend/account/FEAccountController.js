const ErrorMessages = require('../../../../config/errors');
const UserService = require('../../../services/UserService');
const ParentService = require('../../../services/ParentService');


const FEAccountController = {
  edit: async (req, res) => {
    sails.log.info("================================ UserController.edit => START ================================");
    let params = req.allParams();
    if (!params.emailAddress) return res.badRequest(ErrorMessages.USER_EMAIL_REQUIRED);
    if (params.password != params.passwordConfirm) return res.badRequest(ErrorMessages.PASSWORD_IS_NOT_MATCH);
    //ALWAYS CHECK  OBJECT EXIST BEFORE UPDATE
    let user = await UserService.get({ id: params.id });
    if (!user) {
      let parent = await ParentService.get({ id: params.id });
      if (!parent) return res.notFound(ErrorMessages.USER_NOT_FOUND);
    }

    let data = {
      emailAddress: params.emailAddress.toLowerCase(),
      phone: params.phone,
      firstName: params.firstName,
      lastName: params.lastName,
      birthday: params.birthDay,
      // description: params.descriptionbirthDay
    };

    //update address
    if(!user) data.currentAddress = params.address;
    else data.address = params.address;

    //update password
    if (params.password && params.password != '') {
      data.password = await sails.helpers.passwords.hashPassword(params.password);
    }

    //If the phone number already exists
    let duplicatePhone = [];
    if(!user){
      duplicatePhone = await Parent.find({ id: { '!=': params.id }, phone: params.phone });
    } else {
      duplicatePhone = await User.find({ id: { '!=': params.id }, phone: params.phone });
    } 
    if (duplicatePhone.length)  {
      return res.badRequest(ErrorMessages.PHONE_IS_EXISTED);
    }

    //UPDATE DATA
    let editObj;
    if(!user){
      editObj = await ParentService.edit({ id: params.id }, data);
    } else {
      editObj = await UserService.edit({ id: params.id }, data);
    }
    
    return res.ok(editObj);
  }
};
module.exports = FEAccountController;