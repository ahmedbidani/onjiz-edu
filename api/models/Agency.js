/**
 * @copyright 2017 @ ZiniMediaTeam
 * @author cuongphan
 * @create 2020/09/24 10:41
 * @update 2020 / 09 / 24 10: 41
 * @file api/models/Agency.js
 * @description:: Agency model.
 */

module.exports = {
  attributes: {
    code: {
        type: "string",
        required: true,
        unique: true,
        description: "The code of agency",
    },
    emailAddress: {
        type: 'string',
        required: true,
        unique: true,
        isEmail: true,
        maxLength: 200,
        description: 'The email address for this agency.',
        example: 'example@zinimedia.com'
    },
    name: {
        type: "string",
        required: true,
        unique: true,
        description: "Name of the agency that user enroled in",
        example: "Dong Nai agency",
    },
    phone: {
      type: "string",
      required: true,
      unique: true,
      description: "The phone number to login or used for contact by agency",
      example: "0123456789",
    },
    address: {
        type: "string",
        description: "The agency address",
        example: "abc street, ward 5, Ho Chi Minh City",
    },
    password: {
        type: 'string',
        description: 'Securely hashed representation of the agency\'s login password.',
        protect: true,
        example: '2$28a8eabna301089103-13948134nad'
    },
    schools: {
        collection: 'school',
        via: 'agency'
    }
  }
}
