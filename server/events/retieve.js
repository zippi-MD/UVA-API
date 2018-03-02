const { Event } = require('../models/event');

const generalEvents = {events: undefined};
const specificEvents = {events: undefined};
var all_events = {
    gEvents: undefined,
    sEvents: undefined,
    aEvents: undefined,
    fEvents: []
};

var response = undefined;
var callbackf = undefined;
var location = undefined;


const getEvents = function(loc, res, callback){

    all_events.gEvents = undefined;
    all_events.sEvents = undefined;
    all_events.aEvents = undefined;
    all_events.fEvents = [];
    location = loc;

    response = res;
    callbackf = callback;
     getEventsFor(location.gloc, generalEvents);
     getEventsFor(location.sloc, specificEvents);
};

function getEventsFor(location, savePath){
    Event.find({loc: location}).then((info) => {
        savePath.events = info;
        combineEvents()
    }, (e) => {
        console.log(e);
    });
}

function combineEvents() {
     all_events.gEvents = generalEvents;
     all_events.sEvents = specificEvents;

     if(typeof(all_events.gEvents.events) !== 'undefined' && typeof(all_events.sEvents.events) !== 'undefined'){
         all_events.aEvents = all_events.gEvents.events.concat(all_events.sEvents.events);
         getActiveEvents(all_events.aEvents);

     }

}

function getActiveEvents(events){
    const current_date = Date.parse(new Date());

    for(var i = 0; i < events.length; i++){
        if(current_date > events[i].dateUp && current_date < events[i].dateDown){
            all_events.fEvents.push(events[i]);
        }
    }

    callbackf(response, all_events.fEvents, location);
}

module.exports = {
    getEvents
};