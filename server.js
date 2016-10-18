/* References */
var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var fs = require("fs");

/* MySQL */
var mysql = require("mysql");
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'angular'
});
connection.connect();

/* MongoDB */
mongoose.connect("mongodb://rudeshko:password@jello.modulusmongo.net:27017/otoqaV7a");
var User = require("./models/User.js");
var Appointment = require("./models/Appointment.js");
var Schedule = require("./models/Schedule.js");
var Location = require("./models/Location.js");

/* Express */
var app = express();
app.use(express.static(__dirname + "/views"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

/* Helper Functions */
function query(query, callback){
    connection.query(query, function(err, rows, fields){
        if(err){
            throw err;
        }

        callback(rows);
    });
}

function queryOne(query, callback){
    connection.query(query, function(err, rows, fields){
        if(err){
            throw err;
        }

        if(rows.length > 0){
            callback(rows[0]);
        }else{
            callback({});
        }
    });
}

function getUserAppointments(userId, callback){
    query("SELECT appointments.id, locations.lat, locations.lng, appointments.date FROM `appointments` INNER JOIN `locations` ON appointments.location_id=locations.id WHERE `user_id`='" + userId + "'", function(response){
        callback(response);
    });
}

/* GET */
app.get("/api/users", function(req, res){
    query("SELECT * FROM `users`", function(response){
        res.json(response);
    });
});

app.get("/api/users/:userId", function(req, res){
    var response = {};

    queryOne("SELECT * FROM `users` WHERE `id`='" + req.params.userId + "'", function(user){
        response.user = user;
        
        getUserAppointments(req.params.userId, function(appointments){
            response.appointments = appointments;

            res.json(response);
        });
    });
});

/* POST */
app.post("/api/users", function(req, res){
    if(!req.body.firstname || !req.body.lastname){
        return;
    }

    query("INSERT INTO `users` (`firstname`, `lastname`) VALUES ('" + req.body.firstname + "', '" + req.body.lastname + "')", function(response){
        query("SELECT * FROM `users`", function(response){
            res.json(response);
        });
    });
});

app.post("/api/appointments", function(req, res){
    if(!req.body.lat || !req.body.lng || !req.body.userId){
        return;
    }

    query("INSERT INTO `locations` (`lat`, `lng`) VALUES ('" + req.body.lat + "', '" + req.body.lng + "')", function(response){
        var userId = req.body.userId;
        var locationId = response.insertId;

        query("INSERT INTO `appointments` (`user_id`, `location_id`) VALUES ('" + userId + "', '" + locationId + "')", function(response2){
            getUserAppointments(userId, function(response){
                res.json(response);
            });
        });
    });
});

/* PUT */
app.put("/api/users/:id", function(req, res){
    query("UPDATE `users` SET `firstname`='" + req.body.firstname + "', `lastname`='" + req.body.lastname + "' WHERE `id`='" + req.params.id + "'", function(response){
        query("SELECT * FROM `users`", function(response){
            res.json(response);
        });
    });
});

/* DELETE */
app.delete("/api/users/:id", function(req, res){
    query("DELETE FROM `users` WHERE `id`='" + req.params.id + "'", function(response){
        query("SELECT * FROM `users`", function(response){
            res.json(response);
        });
    });
});

app.delete("/api/appointments/:id", function(req, res){
    queryOne("SELECT `user_id`, `location_id` FROM `appointments` WHERE `id`='" + req.params.id + "'", function(appointment){
        var userId = appointment.user_id;
        var locationId = appointment.location_id;

        query("DELETE FROM `appointments` WHERE `id`='" + req.params.id + "'", function(response){
            query("DELETE FROM `locations` WHERE `id`='" + locationId + "'", function(response2){
                getUserAppointments(userId, function(appointments){
                    res.json(appointments);
                });
            });
        });
    });
});

app.listen(8080);
console.log("Server running on port 8080");