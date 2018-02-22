const mongoose = require('mongoose');

var Event = mongoose.model('Event',{
    title: { type: String, require: true, minlength: 1, trim: true},
    type: {type: String, require: true, minlength: 1, trim: true},
    phrase: { type: String, minlength: 1, trim: true},
    info: {type: String, minlength: 1, trim: true},
    img: {type: String, minlength: 1, trim: true},
    dateUp: {type: Number, require: true, minlength: 1, trim: true},
    dateDown: {type: Number, require: true, minlength: 1, trim: true},
    loc: {type: String, require: true, minlength: 1, trim: true}
    //_creator: { type: mongoose.Schema.Types.ObjectId, required: true}
});

module.exports = {
    Event
};