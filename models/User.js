var mongoose = require("mongoose");

var Model = new  mongoose.Schema({
    name: {
        first: String,
        last: String
    },
    appointments: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Appointment'
    }]
});

module.exports = mongoose.model("User", Model);