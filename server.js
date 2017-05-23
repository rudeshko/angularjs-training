/* References */
var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var fs = require("fs");
var Promise = require("promise");

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
mongoose.connect("mongodb://rudeshko:password@localhost:27017/angularnode");
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
String.prototype.format = function(){
    var formatted = this;

    for(var i = 0; i < arguments.length; i++){
        formatted = formatted.replace("{#}", arguments[i]);
    }

    return formatted;
};

function query(query){
    return new Promise(function(fulfill, reject){
        connection.query(query, function(err, rows, fields){
            if(err){
                throw err;
            }
            
            fulfill(rows);
        });
    });
}

function queryOne(query, callback){
    return new Promise(function(fulfill, reject){
        connection.query(query, function(err, rows, fields){
            if(err){
                throw err;
            }

            if(rows.length > 0){
                fulfill(rows[0]);
            }else{
                fulfill({});
            }
        });
    });
}

function getUserAppointments(userId){
    return new Promise(function(fulfill, reject){
        query("SELECT appointments.id, locations.lat, locations.lng, appointments.date FROM `appointments` INNER JOIN `locations` ON appointments.location_id=locations.id WHERE `user_id`='{#}'".format(userId))
        .then(function(response){
            fulfill(response);
        });
    });
}

/* GET */
app.get("/api/users", function(req, res){
    query("SELECT * FROM `users`")
    .then(function(response){
        res.json(response);
    });
});

app.get("/api/users/:userId", function(req, res){
    var response = {};

    queryOne("SELECT * FROM `users` WHERE `id`='{#}'".format(req.params.userId))
    .then(function(user){
        response.user = user;

        return getUserAppointments(req.params.userId);
    })
    .then(function(appointments){
        response.appointments = appointments;

        res.json(response);
    });
});

/* POST */
app.post("/api/users", function(req, res){
    if(!req.body.firstname || !req.body.lastname){
        return;
    }

    query("INSERT INTO `users` (`firstname`, `lastname`) VALUES ('{#}', '{#}')".format(req.body.firstname, req.body.lastname))
    .then(function(response){
        return query("SELECT * FROM `users`");
    })
    .then(function(response){
        res.json(response);
    });
});

app.post("/api/appointments", function(req, res){
    if(!req.body.lat || !req.body.lng || !req.body.userId){
        return;
    }

    var userId = req.body.userId;
    var locationId;

    query("INSERT INTO `locations` (`lat`, `lng`) VALUES ('{#}', '{#}')".format(req.body.lat, req.body.lng))
    .then(function(response){
        locationId = response.insertId;

        return query("INSERT INTO `appointments` (`user_id`, `location_id`) VALUES ('{#}', '{#}')".format(userId, locationId));
    })
    .then(function(response2){
        return getUserAppointments(userId);
    })
    .then(function(response){
        res.json(response);
    });
});

/* PUT */
app.put("/api/users/:id", function(req, res){
    query("UPDATE `users` SET `firstname`='{#}', `lastname`='{#}' WHERE `id`='{#}'".format(req.body.firstname, req.body.lastname, req.params.id))
    .then(function(response){
        return query("SELECT * FROM `users`");
    })
    .then(function(response){
        res.json(response);
    });
});

/* DELETE */
app.delete("/api/users/:id", function(req, res){
    query("DELETE FROM `users` WHERE `id`='{#}'".format(req.params.id))
    .then(function(response){
        return query("SELECT * FROM `users`");
    })
    .then(function(response){
        res.json(response);
    });
});

app.delete("/api/appointments/:id", function(req, res){
    var userId;
    var locationId;

    queryOne("SELECT `user_id`, `location_id` FROM `appointments` WHERE `id`='{#}'".format(req.params.id))
    .then(function(appointment){
        userId = appointment.user_id;
        locationId = appointment.location_id;

        return query("DELETE FROM `appointments` WHERE `id`='{#}'".format(req.params.id));
    })
    .then(function(response){
        return query("DELETE FROM `locations` WHERE `id`='{#}'".format(locationId));
    })
    .then(function(response2){
        return getUserAppointments(userId);
    })
    .then(function(appointments){
        res.json(appointments);
    });
});

app.listen(8080);
console.log("Server running on port 8080");