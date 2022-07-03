const moment = require('moment');

module.exports = {
    calendar: async (req, res) => {
        sails.log.info( "================================ FEEventController.calendar => START ================================");
        // GET ALL PARAMS
        let params = req.allParams();

        let start = moment(params.start).format("YYYY-MM-DD");
        let end = moment(params.end).format("YYYY-MM-DD");
        let resultEvent = await Event.find({ dateStart: { '>=': start}, dateEnd: { '<=': end }, school: params.schoolId });
        
        //Function get specific day in range of time
        let getDayInRange = (dayNumber, startDate, endDate, inclusiveNextDay) => {
            let start = moment(startDate),
                end = moment(endDate),
                arr = [];
        
            // Get "next" given day where 1 is monday and 7 is sunday
            let tmp = start.clone().day(dayNumber);
            if (!!inclusiveNextDay && tmp.isAfter(start, 'd')) {
                arr.push(tmp.format('YYYY-MM-DD'));
            }
        
            while (tmp.isBefore(end)) {
                tmp.add(7, 'days');
                arr.push(tmp.format('YYYY-MM-DD'));
            }
        
            // If last day matches the given dayNumber, add it.
            if (end.isoWeekday() === dayNumber) {
                arr.push(end.format('YYYY-MM-DD'));
            }
        
            return arr;
        }

        // Prepare Event
        let arrEvent = [];
        arrEvent = resultEvent.map((event) => {
            if (event.type == 0) {
                return [{ title: event.title, alias: event.alias, id: event.id, start: event.dateStart + 'T' + event.timeStart + ':00', end: event.dateEnd + 'T' + event.timeEnd + ':00' }];
            } else {
                //get all recurringDate in range of recurringEvent
                let recurringDate = [];
                for (let i = 0; i < event.recurringDay.length; i++){
                    recurringDate = recurringDate.concat(getDayInRange(parseInt(event.recurringDay[i]), moment(event.dateStart), moment(event.dateEnd), 'd'));
                }
                //get all date of recurring event
                let arrRecurringEvent = recurringDate.map((date)=>{
                    return { title: event.title, alias: event.alias, id: event.id, start: date + 'T' + event.timeStart + ':00', end: date + 'T' + event.timeEnd + ':00' };
                });
                return arrRecurringEvent;

            }
        })
        return res.ok(arrEvent);

        sails.log.info( "================================ FEEventController.calendar => END ================================");
    }
}