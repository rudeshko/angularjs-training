var app = angular.module("main", ['ui.router', 'ngLoadScript']);

app.config(function($stateProvider, $urlRouterProvider){
    $urlRouterProvider.otherwise("/");

    var nav = {
        templateUrl: '/templates/nav.html'
    };

    $stateProvider
    .state('index', {
        url: '/',
        views: {
            'nav': nav,
            'content': {
                template: "<h1>Index</h1>Index"
            }
        }
    })
    .state('user', {
        url: '/user',
        abstract: true,
        views: {
            'nav': nav,
            'content': {
                templateUrl: '/templates/user.html'
            }
        }
    })
    .state('user.list', {
        url: '/list',
        templateUrl: '/templates/user.list.html',
        controller: 'UserListCtrl'
    })
    .state('user.details', {
        url: '/:id',
        templateUrl: '/templates/user.details.html',
        controller: 'UserDetailCtrl'
    });
});

app.controller("UserListCtrl", function($scope, $http){
    $http.get("/api/users").success(function(data){
        $scope.users = data;
    }).error(function(err){
        console.log(err);
    });

    $scope.formAddUser = {};

    $scope.createUser = function(){
        $http.post("/api/users/", $scope.formAddUser).success(function(data){
            $scope.formAddUser = {};
            $scope.users = data;
        }).error(function(err){
            console.log(err);
        });
    }

    $scope.updateUser = function(id, user){
        $http.put("/api/users/" + id, user).success(function(data){
            $scope.users = data;
        }).error(function(err){
            console.log(err);
        });
    }

    $scope.deleteUser = function(id){
        if(!confirm("Confirm Delete?")){
            return;
        }

        $http.delete("/api/users/" + id).success(function(data){
            $scope.users = data;
        }).error(function(err){
            console.log(err);
        });
    }
});

app.controller("UserDetailCtrl", function($scope, $http, $stateParams){
    $http.get("/api/users/" + $stateParams.id).success(function(data){
        $scope.user = data.user;
        $scope.appointments = data.appointments;

        if(script_tag){
            unloadMap();
        }

        script_tag = document.createElement("script");
        script_tag.setAttribute("type", "text/javascript");
        script_tag.setAttribute("src", "https://maps.googleapis.com/maps/api/js?key=AIzaSyCicOTrQUhUR19QxTjhwRK0TylXwNe3bec&callback=initMap");
        $("head")[0].appendChild(script_tag);

        window.initMap = function(){
            googleObj = google;
            map = new google.maps.Map($("#map")[0], {
                zoom: 10,
                center: {
                    lat: 43.761123,
                    lng: -79.401232
                }
            });

            updateMap($scope.appointments); 
        };
    }).error(function(err){
        console.log(err);
    });

    $scope.formAddAppointment = {};
    $scope.formAddAppointment.userId = $stateParams.id;

    $scope.createAppointment = function(){
        $http.post("/api/appointments/", $scope.formAddAppointment).success(function(data){
            $scope.formAddAppointment = {};
            $scope.formAddAppointment.userId = $stateParams.id;

            $scope.appointments = data;
            updateMap($scope.appointments);
        }).error(function(err){
            console.log(err);
        });
    }

    $scope.deleteAppointment = function(id){
        if(!confirm("Confirm Delete?")){
            return;
        }

        $http.delete("/api/appointments/" + id).success(function(data){
            $scope.appointments = data;
            updateMap($scope.appointments);
        }).error(function(err){
            console.log(err);
        });
    }
});