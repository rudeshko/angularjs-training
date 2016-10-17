var mongoose = require("mongoose");

var Model = new  mongoose.Schema({
    lat: Number,
    lng: Number
});

module.exports = mongoose.model("Appointment", Model);