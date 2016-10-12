var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ScheduleSchema = new Schema({
    date: Date,
    locations: Array
});

module.exports = mongoose.model("Schedule", ScheduleSchema);