module.exports = {
  exits: {
    success: {
      viewTemplatePath: 'backend/pages/activity/index',
      description: 'Display the activity on page.'
    },
    redirect: {
      responseType: 'redirect'
    }
  },
  fn: async function (inputs, exits) {
    if (!this.req.me) {
      throw { redirect: '/backend/login' };
    } 

    let _default = await sails.helpers.getDefaultData(this.req);
    //If have lifeCycle -> show timeline
    if(this.req.query.lifeCycleId){
      let _listTimeLine = await TimeLineService.findAll({
        lifeCycleId: this.req.query.lifeCycleId
      });  
      _default.timelineFood = _listTimeLine;
    } 

    
    let _listTechLeadByFarm = await User.find({
      status: sails.config.custom.STATUS.ACTIVE,
      type: sails.config.custom.TYPE.KTT,
      
    }); 
    // If have no data - return
    if(_listTechLeadByFarm.length == 0) {
      _default.listKTT = []; 
      _default.listLifeCycle = []; 

      return exits.success(_default);
    }
    // End check have no data

    if (!this.req.query.techLeadId) {
      if(_listTechLeadByFarm.length > 0) {    
        _default.checkActive = _listTechLeadByFarm[0].id;  
      }
    }

    //Get LIFECYCLE data
    //Load firstime
    let _queryLifeCycle = {
      status: sails.config.custom.STATUS.ACTIVE,
      participantKtt: _listTechLeadByFarm[0].id
    }
    


    if (this.req.query.techLeadId) {
      //If fiter by teach lead
      _queryLifeCycle = {
        status: sails.config.custom.STATUS.ACTIVE,
        participantKtt: this.req.query.techLeadId
      }
      _default.checkActive = this.req.query.techLeadId;
    }  

    let _listLifeCycle = await LifeCycleService.find(_queryLifeCycle);
    for (let lifeCycle of _listLifeCycle) { 
      lifeCycle.participantKtt = await UserService.get({id: lifeCycle.participantKtt});
    } 

    _default.listKTT = _listTechLeadByFarm; 
    _default.listLifeCycle = _listLifeCycle; 

    return exits.success(_default);
  }
};
