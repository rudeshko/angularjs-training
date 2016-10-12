var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var LocationSchema = new Schema({
    lat: Number,
    lng: Number,
    notes: String,
    finished: Boolean
});

module.exports = mongoose.model("Location", LocationSchema);