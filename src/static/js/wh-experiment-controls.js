(function () {
angular.module('experimentControls', [])
.config(function ($compileProvider) {

    function animateKeyboard () {
        var dummy = $('<span></span>');
        var map = {
            32: '#spacebar',
            38: '#up',
            40: '#down'
        };
        function findControl (code) {
            return $(map[code] || dummy);
        }
        $(window).on({
            keydown: function (e) {
                findControl(e.keyCode).addClass('pressed');
            },
            keyup: function (e) {
                findControl(e.keyCode).removeClass('pressed');
            }
        });
    }

    animateKeyboard();

    $compileProvider.directive('compile', function ($compile) {
        function action (value) {
            return '<span ng-controller="actionController"></span>';
        }

        function button (value) {
            return '<next-button>' + value.value+ '</next-button>';
        }

        function image (value) {
            var controls = {
                arrows: '<arrow-keys></arrow-keys>',
                achtung: '<achtung></achtung>',
                clockface: '<clockface></clockface>',
                xkcd: '<img src="/static/images/compiling.png" class="img-responsive center-block" alt="compiling" title="http://xkcd.com/303/" />',
                spacebar: '<spacebar></spacebar>',
                structure: '<img src="/static/images/structure.png" class="img-responsive center-block" alg="Ablauf der Studie" />'
            };
            return (controls[value.value] || '');
        }

        return function (scope, element, attrs){
            // This is some messed up angular shit, that I don't really
            // understand. But it works. I got it from here
            // (see bottom of the page)
            // https://docs.angularjs.org/api/ng/service/$compile
            scope.$watch(
              function(scope) {
                return scope.$eval(attrs.compile);
              },
              function(value) {
                var template = '';
                if(value.type == 'button') {
                    template = button(value);
                } else if (value.type == 'image') {
                    template = image(value);
                } else if (value.type == 'action') {
                   template = action(value);
                }
                element.html(template);
                $compile(element.contents())(scope);
              }
            );
        };
    });
})


.directive('arrowKeys', function () {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/static/templates/components/arrowkeys.template.html'
    };
})


.directive('clockface', function () {
    return {
        restrict: 'E',
        replace: true,
        template: '<div id="clock" class="pull-right"></div>',
        link: function (scope, element, attributes, controller, transcludeFn) {
            var clock = new ClockFace($('#clock'));
            for(var i = 0; i < 5; i++) {
                clock.next();
            }
        }
    };
})


.directive('errorFoundDialog', function () {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/static/templates/controls/error-found-dialog.html'
    };
})


.directive('letterbox', function () {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/static/templates/components/letterbox.template.html'
    };
})


.directive('nextButton', function () {
    return {
        restrict: 'E',
        replace: true,
        transclude: true,
        template: '<button id="nextButton" class="btn btn-lg btn-primary" ng-show="showNextButton" ng-click="next()" ng-transclude></button>',
        controller: ['$scope', function ($scope) {
            $scope.next = function () {
                $scope.$emit('next', {});
            }
        }]
    };
})


.directive('ngHtmlCompile', function($compile) {
    // Stolen from: https://github.com/francisbouvier/ng_html_compile
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
        scope.$watch(attrs.ngHtmlCompile, function(newValue, oldValue) {
            element.html(newValue);
            $compile(element.contents())(scope);
        });
        }
    };
})


.directive('feedbackBox', function () {
  return {
    replace: true,
    restrict: 'E',
    templateUrl: '/static/templates/controls/feedback-modal.html',
    controllerAs: 'feedbackCtrl',
    controller: ['$scope', '$sce', function ($scope, $sce) {
        var self = this;
        $scope.message = $sce.trustAsHtml($scope.message);
        self.show = function (image, message, dismissButtonLabel) {
            $scope.image = image || '';
            $scope.message = message || '';
            $scope.dismissButtonLabel = dismissButtonLabel || 'Schließen';
            $('#modal').modal();
            $('#closeFeedback').focus();
        };
        self.close = function () {
            $('#modal').modal('hide');
            $scope.$emit('feedback-closed');
        }
        $scope.$on('feedback-open', function (event, data) {
            // Data: [image, message, label]
            self.show.apply(self, data);
        });
    }]
  };
}) // messageBox


.directive('progressBar', function () {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/static/templates/components/progressbar.template.html',
        controllerAs: 'progressCtrl',
        controller: ['$scope', function ($scope) {
            function style (progress) {
                return {'min-width': '2em', 'width': progress + '%'};
            }

            $scope.$on('display-progress', function (event_, progress) {
                $scope.progress = progress;
                $scope.width = style(progress);
            });

            $scope.progress = 5;
            $scope.width = style(5);
        }]
    };
})


.directive('spacebar', function () {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/static/templates/components/spacebar.template.html'
    };
})


.directive('structureView', function () {
    return  {
        restrict: 'E',
        replace: true,
        templateUrl: '/static/templates/components/structure.template.html'
    };
});


})(); // ns shield