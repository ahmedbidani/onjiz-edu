/**
 * @copyright 2017 @ ZiniMediaTeam
 * @author brianvo
 * @create 2020/02/19 01:05
 * @update 2017/02/19 01:05
 * @file api/models/Branch.js
 * @description :: Branch model.
 */

module.exports = {
  attributes: {
    code: {
      type: "string",
      required: true,
      maxLength: 100,
      example: "TN01",
    },
    title: {
      type: "string",
      required: true,
      maxLength: 100,
      example: "Trường mầm non Ngôi sao - Tây Ninh",
    },
    address: {
      type: 'string',
      required: true,
      maxLength: 200,
      example: "Example is Description",
    },
    updatedBy: {
      // user updated information
      model: "user",
      required: true,
    },
    status: {
      //Integer {"TRASH":,"DRAFT":,"ACTIVE":, SCHEDULE:}
      type: "number",
      isIn: [
        sails.config.custom.STATUS.TRASH,
        sails.config.custom.STATUS.DRAFT,
        sails.config.custom.STATUS.ACTIVE,
      ],
      defaultsTo: sails.config.custom.STATUS.DRAFT,
    },

    minister: {
      model: "user", // Set misnister for the branch
      required: true,
    },
    sessions: {
      collection: "coursesession",
      via: "branchOfSession",
    },
    school: {
      model: "school",
      required: true,
    },
  },
};
