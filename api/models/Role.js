/**
 * @copyright 2017 @ ZiniMediaTeam
 * @author brianvo
 * @create 2017/10/23 01:05
 * @update 2017/10/23 01:05
 * @file api/models/Subject.js
 * @description :: Subject model.
 */

module.exports = {
  attributes: {
    name: {
      type: 'string',
      required: true
    },
    description: {
      type: 'string'
    },
    user: {
      collection: 'user',
      via: 'role',
      through: 'user_role'
    },
    permissions: {
      type: 'json',
      defaultsTo: 
      {
        album: { view: false, add: false, edit: false, delete: false },
        attendent: { view: false, add: false, edit: false, delete: false },
        branch: { view: false, add: false, edit: false, delete: false },
        class: { view: false, add: false, edit: false, delete: false },
        courseSession: { view: false, add: false, edit: false, delete: false },
        currency: { view: false, add: false, edit: false, delete: false },
        event: { view: false, add: false, edit: false, delete: false },
        feeInvoice: { view: false, add: false, edit: false, delete: false },
        feeItem: { view: false, add: false, edit: false, delete: false },
        food: { view: false, add: false, edit: false, delete: false },
        menu: { view: false, add: false, edit: false, delete: false },
        notification: { view: false, add: false, edit: false, delete: false },
        parent: { view: false, add: false, edit: false, delete: false },
        pickUp: { view: false, add: false, edit: false, delete: false }, 
        post: { view: false, add: false, edit: false, delete: false },
        schedule: { view: false, add: false, edit: false, delete: false },
        student: { view: false, add: false, edit: false, delete: false },
        subject: { view: false, add: false, edit: false, delete: false },
        taxonomy: { view: false, add: false, edit: false, delete: false },
        user: { view: false, add: false, edit: false, delete: false },
      }
    }
  }
};