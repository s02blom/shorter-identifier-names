(function () {
var culture = 'de';

angular.module('questions', ['ngRoute', 'weaselDirectives', 'experimentControls'])

.value('api', {
    form_target: '/api/form',
    page_questions_2: '/2',
    page_tutorial: '/tutorial',
    page_finish: '/#finish',
})

// Prevent Bypassing Routes
// http://stackoverflow.com/questions/11541695/redirecting-to-a-certain-route-based-on-condition
.config(['$routeProvider', function($routeProvider) {
    // http://stackoverflow.com/questions/11534710/angularjs-how-to-use-routeparams-in-generating-the-templateurl
    $routeProvider
    .when('/:question', {
        templateUrl: function (parameters) {
            var question = parseInt(parameters.question);
            return '/static/templates/forms/questions' + question + '.' + culture +'.html'
        },
        controller: 'questionsController',
        controllerAs: 'questionsCtrl'
    })
    .otherwise({
        // /questions
        templateUrl: '/static/templates/forms/questions1.' + culture + '.html',
        controller: 'questionsController',
        controllerAs: 'questionsCtrl'
   });
}]) // config


.controller('questionsController',
    ['$scope', '$http', '$location', '$route', '$routeParams', '$timeout', '$window', 'api',
    function ($scope, $http, $location, $route, $routeParams, $timeout, $window, api) {

    var self = this;
    $scope.showProgress = true;

    function setProgress () {
        if(!$routeParams.question || $routeParams.question == 1) {
            $scope.$broadcast('display-progress', 5);
        }
        if($routeParams.question == 2) {
            $scope.$broadcast('display-progress', 10);
        }
        if($routeParams.question == 3) {
            $scope.$broadcast('display-progress', 90);
        }
    }

    function next () {
        $scope.page = {};
        if(!$routeParams.question || $routeParams.question == 1){
            $location.path(api.page_questions_2);
        }
        if($routeParams.question == 2) {
            $window.location.href = api.page_tutorial;
        }
        if($routeParams.question == 3) {
            $window.location.href = api.page_finish;
        }
    }

    function source () {
        return $route.current.loadedTemplateUrl;
    }

    $scope.page = {};
    function prepare (formdata) {
        formdata.source = source();
        formdata.submitted = new Date().toISOString();
        formdata.culture = culture;
        return {
            data: formdata
        };
    };

    this.addQuestions = function (form, formdata) {
        if(!form.$valid){
            return;
        };

        formdata = prepare(formdata);

        $http
        .post(api.form_target, formdata)
        .success(function (data, status, headers, config) {
            next();
        })
        .error(function (d,s,h,c) {

        });
    };

    $timeout(setProgress, 500);

}]) // questionsController

})(); // ns shield