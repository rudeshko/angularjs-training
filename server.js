/* References */
var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var fs = require("fs");

/* MongoDB */
mongoose.connect("mongodb://rudeshko:password@jello.modulusmongo.net:27017/otoqaV7a");
var User = require("./models/User.js");
var Schedule = require("./models/Schedule.js");
var Location = require("./models/Location.js");

/* Express */
var app = express();
app.use(express.static(__dirname + "/views"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

/* GET */
app.get("/api/users", function(req, res){
    User.find({}, function(err, users){
        res.json(users);
    });
});

app.get("/api/users/:id", function(req, res){
    User.findOne({
        _id: req.params.id
    }, function(err, user){
        res.json(user);
    });
});

/* POST */
app.post("/api/users", function(req, res){
    if(!req.body.name || !req.body.name.first || !req.body.name.last){
        return;
    }

    var newUser = new User();
    newUser.name.first = req.body.name.first;
    newUser.name.last = req.body.name.last;

    newUser.save(function(err, user){
        User.find({}, function(err2, users){
            res.json(users);
        });
    });
});

/* PUT */
app.put("/api/users/:id", function(req, res){
    User.findOneAndUpdate({
        _id: req.params.id
    }, {
        $set: {
            name: {
                first: req.body.name.first,
                last: req.body.name.last
            }
        }
    }, {
        upsert: true
    }, function(err, user){
        User.find({}, function(err2, users){
            res.json(users);
        });
    });
});

/* DELETE */
app.delete("/api/users/:id", function(req, res){
    User.findOneAndRemove({
        _id: req.params.id
    }, function(err, user){
        User.find({}, function(err2, users){
            res.json(users);
        });
    });
});

app.listen(8080);