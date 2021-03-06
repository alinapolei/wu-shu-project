let app = angular.module('myApp', ["ngRoute", 'ui.bootstrap', 'ngPatternRestrict', 'cp.ngConfirm', 'angularjsToast']);
app.controller("mainController", function ($scope, $location, $window, $rootScope) {
    if($window.sessionStorage.getItem('name') != null && $window.sessionStorage.getItem('name')!=='')
        $rootScope.name = $window.sessionStorage.getItem('name');
    if($window.sessionStorage.getItem('access') != null && $window.sessionStorage.getItem('access') != '')
        $rootScope.access = $window.sessionStorage.getItem('access');

    $scope.getClass = function (path) {
        return ("/" + $location.path().split("/")[1] === path) ? 'active' : '';
    };
    $scope.isShowMenu = function(){
        return $location.path() !== '/login';
    };

    $rootScope.userTypes = {
        MANAGER: 1,
        COACH: 2,
        SPORTSMAN: 3
    };

    $scope.logout = function () {
        //need to delete $rootScope
        $window.sessionStorage.removeItem('name');
        $window.sessionStorage.removeItem('token');
        $rootScope.name = '';
        $rootScope.access = '';
        $location.path('/login');
    }
});

// config routes
app.config(function($routeProvider) {
    $routeProvider
        .when('/home', {
            templateUrl: 'views/home.html',
            controller: 'homeController as hCtrl'
        })
        .when('/login', {
            templateUrl: 'views/login.html',
            controller: 'loginController as loginCtrl'
        })
        .when('/users/register',{
            templateUrl :'views/registerUser.html',
            controller: 'registerController as chRegCtrl'
        })
        .when('/calendar', {
            templateUrl: 'views/home.html',
            controller: 'homeController as hCtrl'
        })
        .when('/profile', {
            resolve: {
                "check": function ($rootScope, $location, $window) {
                    if ($rootScope.access == $rootScope.userTypes.MANAGER) {
                    }
                    else if($rootScope.access == $rootScope.userTypes.COACH){
                    }
                    else if($rootScope.access == $rootScope.userTypes.SPORTSMAN){
                        $location.path("/sportsmanProfile/");
                    }
                }
            }
        })
        .when('/sportsmanProfile/:id?', {
            templateUrl: 'views/profilePage.html',
            controller: 'sportsmanProfileController as sportsmanProfileCtrl'
        })
        .when('/sportClubs/addSportClub', {
            templateUrl: 'views/home.html',
            controller: 'homeController as hCtrl'
        })
        .when('/sportClubs/sportClubs', {
            templateUrl: 'views/home.html',
            controller: 'homeController as hCtrl'
        })
        .when('/users/couches', {
            templateUrl: 'views/home.html',
            controller: 'homeController as hCtrl'
        })
        .when('/users/admins', {
            templateUrl: 'views/home.html',
            controller: 'homeController as hCtrl'
        })
        .when('/users/sportsmen', {
            templateUrl: 'views/userTable.html',
            controller: 'sportsmenController as sportsmenCtrl'
        })
        .when('/users/referees', {
            templateUrl: 'views/home.html',
            controller: 'homeController as hCtrl'
        })
        .when('/competitions/addCompetition', {
            templateUrl: 'views/openCompetition.html',
            controller: 'openCompetitionController as hCtrl'
        })
        .when('/competitions/registerToCompetition', {
            templateUrl: 'views/competitionTable.html',
            controller: 'registerToCompetitionController as regCompCtrl'
        })
        .when('/competitions/addResults', {
            templateUrl: 'views/home.html',
            controller: 'homeController as hCtrl'
        })
        .when('/competitions/results', {
            templateUrl: 'views/home.html',
            controller: 'homeController as hCtrl'
        })
        .when('/competitions/getCompetitions', {
            templateUrl: 'views/competitionTable.html',
            controller: 'competitionTableController as cTCtrl'
        })
        .when('/competitions/RegistrationState/:competition', {
            templateUrl: 'views/registrationState.html',
            controller: 'registrationStateController as regStateCtrl'
        })
        .when('/events/addEvent', {
            templateUrl: 'views/home.html',
            controller: 'homeController as hCtrl'
        })
        .when('/events/addMessage', {
            templateUrl: 'views/home.html',
            controller: 'homeController as hCtrl'
        })
        .when('/events/events', {
            templateUrl: 'views/home.html',
            controller: 'homeController as hCtrl'
        })
        .when('/events/messages', {
            templateUrl: 'views/home.html',
            controller: 'homeController as hCtrl'
        })
        .when('/competitionRegistration/:idComp', {
            templateUrl: 'views/regSportsmanCompetition.html',
            controller: 'competitionRegisterModal as cRegCtrl'
        })
        .otherwise({redirectTo: '/login'});
});