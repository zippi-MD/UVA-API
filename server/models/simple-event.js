const mongoose = require(mongoose);

var simpleEvent = mongoose.model('simpleEvent',{
    title: { type: String, require: true, minlength: 1, trim: true},
    description: { type: String, require: true, minlength: 1, trim: true},
    miniatureURL: {type: String, minlength: 1, trim: true},
    imageURL: {type: String, minlength: 1, trim: true},
    dateUp: {type: Number, require: true, minlength: 1, trim: true},
    dateDown: {type: Number, require: true, minlength: 1, trim: true},
    _creator: { type: mongoose.Schema.Types.ObjectId, required: true}
});

module.exports = {
    simpleEvent
};