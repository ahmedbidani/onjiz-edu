module.exports = {
  
  friendlyName: 'Generate paging data object',
  description: 'Generate paging data object.',

  inputs: { 
    url: {
      type: 'string',
      description: 'url of paging'
    },
    page: {
      type: 'string',
      description: 'current page'
    },
    totals: {
      type: 'number',
      description: 'totals of records'
    },
    limit: {
      type: 'number',
      description: 'limit of one page'
    }
  },
  exits: {
    success: {}
  },
  
  fn: async function (inputs, exits) {
   
  }

};