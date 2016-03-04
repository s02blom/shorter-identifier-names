    (function () {

var culture = 'de';

angular.module('tutorial', ['ngSanitize', 'experimentControls'])

.service('tutorialService', ['$http', '$sce', '$timeout', function ($http, $sce, $timeout) {

    var lastAnnotation = { popover: function(){} };
    function annotate (selector, page) {
        hideAnnotation();
        lastAnnotation = $(selector).popover({
            title: page.caption,
            content: page.text[0],
            placement: 'top',
            trigger: 'manual'
        });
        lastAnnotation.popover('show');
    }
    function hideAnnotation () {
        lastAnnotation.popover('hide');
    }

    var frame = {};
    var keyboard = {};
    var map = {
        intro: function (scope) {
            scope.showHint = true;
        },
        situation: function (scope) {
            scope.showProgress = false;
        },
        code: function (scope) {
            scope.showCode = true;
            $http
            .get('/static/snippets/sample.normal.html')
            .success(function (data) {
                frame = new Letterbox();
                scope.code = $sce.trustAsHtml(data);
                frame.uncover();
            });
        },
        letterbox: function (scope) {
            frame.cover();
            frame.reset();
        },
        'control': function (scope) {
            scope.showNextButton = false;
            var UP = 38;
            var DOWN = 40;
            keyboard = new Keyboard();
            keyboard.register({
                up: frame.scrollUp,
                down:  function () {
                    frame.scrollDown();
                    if(frame.currentLine()[1] == 14) {
                        scope.$apply(function () {
                            scope.showNextButton = true;
                        });
                    }
                }
            });
        },
        founddialog: function (scope) {
            scope.showDialog = false;
            scope.showNextButton = false;
            keyboard.register({
                'space': function () {
                    scope.$apply(function () {
                        scope.showVeil = true;
                        scope.showDialog = true;
                        scope.$broadcast('next');
                    });
                }
            })
        },
        linenumber: function (scope, page) {
            keyboard.register({});
            scope.showNextButton = true;
            scope.showText = false;
            scope.showNotice = true;

            scope.notice = scope.labels.instruction_notice;

            $timeout(function () {
                // delay to prevent sideeffect (popover showing at incorrect position)
                annotate('#linenumber', page);
                scope.report.linenumber = scope.labels.example_line_number;
                frame.highlight(scope.labels.example_line_number);
            }, 500);
        },
        correction: function (scope, page) {
            annotate('#correction', page);
            scope.report.correction = scope.labels.example_correction;
        },
        description: function (scope, page) {
            annotate('#description', page);
            scope.report.description = scope.labels.example_description;
        },
        cancel: function (scope, page) {
            annotate('#cancel', page);
        },
        completion: function (scope, page) {
            annotate('#found', page);
        },
        attempts: function (scope, page) {
            scope.showText = true;
            scope.showNotice = false;
            scope.showDialog = false;
            frame.highlight(0);
        },
        timelimit: function (scope, page) {
            scope.showTime = true;
            frame.highlight(0);
            $timeout(function () {
                lastAnnotation = $('#clock').popover({
                    title: scope.labels.clock,
                    content: scope.labels.time_notice,
                    placement: 'left',
                    trigger: 'manual'
                }).popover('show');
            }, 500);
        },
        summary: function (scope) {
            hideAnnotation();
            scope.showTime = false;
            scope.showCode = false;
            scope.showDialog = false;
            scope.showTime = false;
            scope.showText = true;
        }
    };

    function step (condition, scope, page) {
        var none = function () { };
        var func = (map[condition] || none);
        func(scope, page);
    }

    function init (scope) {
        scope.showNextButton = true;
        scope.showDialog = false;
        scope.showText = true;
        scope.showTime = false;
        scope.showCode = false;
        scope.showNotice = false;
        scope.showVeil = false;
        scope.disableFoundButton = false;
        scope.disableCancelButton = false;
        scope.disableSurrenderButton = false;
    }

    return {
        init: init,
        step: step
    };
}])


.controller('tutorialPageController',
    ['$compile', '$http', '$sce', '$scope', '$window', 'tutorialService',
    function ($compile, $http, $sce, $scope, $window, tutorial) {

        var current = 0;
        this.pages = [];

        $scope.number = 0;
        $scope.showProgress = true;
        $scope.einige = 4; // silent witness, that angular is in fact shit
        $scope.code = $sce.trustAsHtml($scope.code);
        $scope.report = {};



        $http.get('/static/assets/labels.' + culture + '.json')
        .success(function (lblDoc) {
            $scope.labels = lblDoc.data;
            $http
            .get('/static/assets/tutorial.' + culture + '.json')
            .success(function (data) {
                this.pages = data.data;
                $scope.number = $scope.labels.snippet_count;
                tutorial.init($scope),
                displayPage();
                $scope.$emit('display-progress', 15);
            });

        });

        function applyCondition (page) {
            // Every page can perform specific acts, these are supplied here
            tutorial.step(page.condition, $scope, page);
        }

        function displayPage () {
            // Last Page
            if(current >= this.pages.length) {
                finish();
                return;
            }
            var page = this.pages[current]
            $scope.page = page;
            applyCondition(page);
        }

        function finish () {
            $window.location.href = '/experiment';
        }

        function next () {
            current++;
            displayPage();
        }

        $scope.$on('next', next);

}]); // controller

})(); // ns shield