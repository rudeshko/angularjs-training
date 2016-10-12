var app = angular.module("main", ['ui.router']);

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
        $http.delete("/api/users/" + id).success(function(data){
            $scope.users = data;
        }).error(function(err){
            console.log(err);
        });
    }
});

app.controller("UserDetailCtrl", function($scope, $http, $stateParams){
    $http.get("/api/users/" + $stateParams.id).success(function(data){
        $scope.user = data;
    }).error(function(err){
        console.log(err);
    });
});