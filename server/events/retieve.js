const { mongoose } = require('mongoose');
const { objectID } = require('mongodb');

const { Event } = require('../models/event');

var generalEvents = {events: undefined};
var specificEvents = {events: undefined};
var all_events = {
    gEvents: undefined,
    sEvents: undefined,
    aEvents: undefined
};


const getEvents = function(gloc, sloc){
    getEventsFor(gloc, generalEvents);
    getEventsFor(sloc, specificEvents);
};

function getEventsFor(location, savePath){
    Event.find({loc: location}).then((events) => {
        savePath.events = events;
        combineEvents();
    }, (e) => {
        console.log(error);
    });
}

function combineEvents() {
     all_events.gEvents = generalEvents;
     all_events.sEvents = specificEvents;

     if(all_events.gEvents.events === undefined || all_events.sEvents.events){

         all_events.aEvents = all_events.gEvents.events;

         for(const i = 0; i < all_events.sEvents.events.length; i++){
             all_events.append(all_events.sEvents.events[i]);
         }

         console.log(all_events.aEvents);
     }
}

module.exports = {
    getEvents
};