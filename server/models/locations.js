const mongoose = require('mongoose');

var Location = mongoose.model('Location',{
    gloc: {type: String},
    sloc: {type: String},
    name: {type: String, require: true, minlength: 1, trim: true},
    phrase: {type: String, require: true, minlength: 1, trim: true},
    img: {type: String, require: true, minlength: 1, trim: true},
    lat: {type: Number},
    lon: {type: Number},
    loc_size: {type: Number},
    markers: {type: Object}
});


Location.getLocations = function () {
    let Location = this;

    return Location.find().then((locations) => {
        if(!locations){
            Promise.reject();
        }
        return locations
    });
};


module.exports = {
    Location
};
