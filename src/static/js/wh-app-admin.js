(function (){
angular.module('admin', ['ngRoute', 'ngSanitize', 'charts', 'experimentControls', 'weaselDirectives'])


.config(['$routeProvider', function($routeProvider) {
    $routeProvider
    .when('/trials',{
        templateUrl: '/static/templates/partial/dashboard-trials.html',
        controller: 'trialsController',
        controllerAs: 'trialsCtrl'
    })
    .when('/emails',{
        templateUrl: '/static/templates/partial/dashboard-emails.html',
        controller: 'emailsController',
        controllerAs: 'emailsCtrl'
    })
    .when('/snippets',{
        templateUrl: '/static/templates/partial/dashboard-snippets.html',
        controller: 'snippetsController',
        controllerAs: 'snippetsCtrl'
    })
    .when('/setup',{
        templateUrl: '/static/templates/partial/dashboard-setup.html',
        controller: 'setupController',
        controllerAs: 'setupCtrl'
    })
    .otherwise({
        templateUrl: '/static/templates/partial/dashboard-sessions.html',
        controller: 'sessionsController',
        controllerAs: 'sessionsCtrl'
    });
}]) // config


.value('api', {
    clearUserCookie: "/admin/clear",
    snippets: "/api/admin/snippets/",
    emails: "/api/admin/emails/",
    sessions: "/api/admin/sessions/",
    duplicate_trials: "/api/admin/duplicates/",
    missing_trials: "/api/admin/missing/",
    sessions_empty: "/api/admin/sessions/?empty=true",
    session_stats: "/api/admin/sessions/?stats=true",
    trials: {
        all: '/api/admin/trials/',
        stop_all: '/api/admin/trials?stop=true',
        issued: '/api/admin/trials?issued=true',
        finished: '/api/admin/trials?finished=true'
    }
 })


.service('flashService', ['$rootScope', '$timeout', function ($rootScope, $timeout) {
    function flash(style, title, message) {
        $rootScope.$broadcast("flash", [style, title, message]);
    };
    return {
        warn: function (title, message) {
            return flash('warning', title, message);
        },
        info: function (title, message) {
            return flash('info', title, message);
        },
        error: function (title, message) {
            return flash('danger', title, message);
        },
        success: function (title, message) {
            return flash('success', title, message);
        }
    };
}])


.controller('mainController', ['$scope', '$location', function($scope, $location) {
    $scope.isActive = function(route) {
        var path = $location.path() || '/sessions';
        return route === path;
    }
}]) // mainController


.controller('navController', ['$http', '$scope', 'api', 'flashService', function ($http, $scope, api, flash) {
   this.clearUserCookie = function () {
        $http
        .put(api.clearUserCookie, {data:{}})
        .success(function () {
            flash.success("Cleared!");
        })
        .error(function (d) {
            flash.success("Error! " + d);
        });
   };
}])


.controller('trialsController', ['$scope', '$http', 'api', 'flashService', function ($scope, $http, api, flash) {
    $scope.trials = [];
    $scope.missing = [];
    function getTrials () {
        $http
        .get(api.trials.all)
        .success(function (data, status) {
            $scope.trials = data.data;
        })
        .error(function () {
            flash.error('Error', "Couldn't load trials");
        })
    };

    getTrials();

    function getMissing () {
        $http
        .get(api.missing_trials)
        .success(function (data, status, headers, cfg) {
            $scope.missing = data.data;
        })
        .error(function (data, status, headers, cfg) {
            flash.error('Error', "The Couln't get missing trials");
        });
    };

    getMissing();

    $scope.isRunning = function (trial) {
        return trial.finished === 0;
    }

    $scope.open = function (trial) {
        $http
        .put(api.trials.all + trial._id, {data: {finished: 0}})
        .success(function (data, status, headers, cfg) {
            trial.finished = 0;
        })
        .error(function (data, status, headers, cfg) {
            flash.error('Error', 'The trial could not be opened!');
        });
    };

    $scope.close = function (trial) {
        $http
        .put(api.trials.all + trial._id, {data: {finished: 1}})
        .success(function (data, status, headers, cfg) {
            trial.finished = 1;
        })
        .error(function (data, status, headers, cfg) {
            flash.error('Error', 'The trial could not be closed!');
        });
    };

}]) // activitiesController

.controller('sessionsController', ['$scope', '$http', 'api', 'flashService', function ($scope, $http, api, flash) {
    $scope.showSessions = true;
    $scope.number_of_sessions = 0;
    $scope.sessions_with_data = 0;
    $scope.empty = 0;
    $scope.sessions = [];

    var current_session = {};
    function get_sessions() {

        $http
        .get(api.session_stats)
        .success(function (data, status) {
            var data = data.data;
            $scope.number_of_sessions = data.total;
            $scope.sessions_with_data = data.total - data.empty;
            $scope.empty = data.empty;
        });

        $http
        .get(api.sessions)
        .success(function (data, status) {
            var sessions = data.data;
            $scope.sessions = sessions;
        })
        .error(function () {
             flash.error('Error', 'The keys could not be reset!');
        });
    };

    $scope.hideData = function () {
        $scope.showSessions = true;
    };

    $scope.showData = function (session) {
        $http
        .get(api.sessions + session.USER_SESSION_ID)
        .success(function (data, s) {
            session.loading = false;
            var INDENT = 4;
            $scope.sessionData = JSON.stringify(data.data, null, INDENT);
            $scope.showSessions = false;
        })
        .error(function () {
            session.loading = false;
            flash.error('Could not load session data');
        })
    };

    $scope.setDuplicate = function (session_id) {
        $http
        .put(api.sessions + session_id, {"duplicate": true})
        .success(function () {
            get_duplicates();
            get_sessions();
        })
        .error(function () {
            flash.error("Couldn't");
        });
    };



    $scope.flag = function (session) {
        if (session.valid) {
            // Valid overrides decision
            return false;
        }

        return (session.csharp < 3)
            || (session.english_level < 4)
            || (session.german_level < 4)
            || (session.years_experience_csharp < 1)
            || (session.trials < 6)
            || (session.failed_trials > 1)
            || (session.are_you_serious == 'no')
            || (session.boomerang_participant == 'yes')
            || (session.legacy_participant == '2015');
    };

    $scope.setValid = function (session) {
        $http
        .put(api.sessions + session.USER_SESSION_ID)
        .success(function (data, s) {
            session.valid = !session.valid;
        })
        .error(function () {
            flash.error('Could not change session');
        })
    };

    $scope.dateOf = function (session) {
        var date = new Date(session.created);
        return date.toLocaleDateString() + ', ' + date.toLocaleTimeString();
    };

    $scope.ageOf = function (session) {
        var date = new Date(session.created);
        var now = new Date();
        var delta = now.getTime() - date.getTime();
        var days = Math.floor(delta / (1000 * 60 * 60 * 24));
        delta -=  days * (1000 * 60 * 60 * 24);
        var hours = Math.floor(delta / (1000 * 60 * 60));
        return days + "d, " + hours + "hrs";
    };

    function get_duplicates () {
        $http.get(api.duplicate_trials)
        .success(function (data) {
            $scope.duplicates = data.data;
        })
        .error(function () {
            flash.error("Couldn't retrieve missing data");
        });
    }

    get_sessions();

    get_duplicates();
}]) // sessionsController


.controller('setupController', ['$scope', '$http', 'api', 'flashService', function ($scope, $http, api, flash) {

    $scope.seed = function () {
        $http
        .post(api.trials.all, {data:{}})
        .success(function () {
            flash.success('Seed', 'Sucessfully reseeded trial sequences');
        })
        .error(function () {
            flash.error('Seed', 'Error seeding trial sequences');
        });
    };

    $scope.deleteEmptySessions = function () {
        $http
        .delete(api.sessions_empty)
        .success(function () {
            flash.success("Success", "Dropped all empty sessions!");
        })
        .error(function () {
            flash.error("Error", "The sessions could not be deleted");
        });
    };

    $scope.deleteAllSessions = function () {
        $http
        .delete(api.sessions)
        .success(function () {
            flash.success("Success", "Dropped all sessions!");
        })
        .error(function () {
            flash.error("Error", "The sessions could not be deleted");
        });
    };

    $scope.resetIssuedTrials = function () {
        $http
        .put(api.trials.all, {})
        .success(function (data, status, headers, cfg) {
            flash.success('Success', 'All trials were reset!');
        })
        .error(function (data, status, headers, cfg) {
            flash.error('Error', 'The keys could not be reset!');
        });
    };

    $scope.stopAllTrials = function () {
        $http
        .put(api.trials.stop_all, {})
        .success(function (data, status, headers, cfg) {
            flash.success('Success', 'All trials were reset!');
        })
        .error(function (data, status, headers, cfg) {
            flash.error('Error', 'The keys could not be reset!');
        });
    };

}]) // setupController

.controller('emailsController', ['$scope', '$http', 'api', 'flashService', function ($scope, $http, api, flash) {
    $scope.emails = [];

    function get_emails() {
        $http
        .get(api.emails)
        .success(function (data, status) {
            $scope.emails = data.data;
        })
        .error(function (d,h,s) {
            flash.error("Something went wrong! " + d);
        });
    };

    get_emails();
}])


.controller('snippetsController', ['$scope', '$http', 'api', function ($scope, $http, api) {
    $scope.names = [];

    function get_names() {
        $http
        .get(api.snippets)
        .success(function (data, status) {
            $scope.names = data.data;
        })
        .error(function () {
            console.log(arguments);
        });
    };

    $scope.showSnippet = function (name) {
      $http
        .get(api.snippets, {params: {file: name }})
        .success(function (data, status, headers, config) {
            $scope.code = data;
        })
        .error(function () {
            console.log(arguments);
        });
    };

    get_names();
}])

})(); // ns shield