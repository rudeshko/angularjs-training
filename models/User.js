var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    name: {
        first: String,
        last: String
    }
});

module.exports = mongoose.model("User", UserSchema);