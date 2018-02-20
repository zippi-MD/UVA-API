const mongoose = require('mongoose');

var Event = mongoose.model('Event',{
    title: { type: String, require: true, minlength: 1, trim: true},
    description: { type: String, minlength: 1, trim: true},
    info: {type: String, minlength: 1, trim: true},
    miniatureURL: {type: String, minlength: 1, trim: true},
    imageURL: {type: String, minlength: 1, trim: true},
    dateUp: {type: Number, require: true, minlength: 1, trim: true},
    dateDown: {type: Number, require: true, minlength: 1, trim: true},
    generalLoc: {type: String, require: true, minlength: 1, trim: true},
    specificLoc: {type: String, require: true, minlength: 1, trim: true}
    //_creator: { type: mongoose.Schema.Types.ObjectId, required: true}
});

module.exports = {
    Event
};