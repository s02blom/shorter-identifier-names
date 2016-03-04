(function () {

var culture = 'de';
angular.module('experiment', ['ngSanitize', 'experimentControls'])

.value('api', {
    trial: '/api/trial',
    page_questions: '/questions#/3',
    page_complete: '/complete',
    snippet_directory: '/static/snippets/',
    assets_grading: '/static/assets/grading.json',
    assets_instructions: '/static/assets/experiment.' + culture + '.json',
    assets_labels: '/static/assets/labels.' + culture + '.json'
})


.service('experimentService', function () {

    function waitForSpaceBar (scope)
    {
        var keyboard = new Keyboard();
        keyboard.register({
            space: function () {
                keyboard.register();
                scope.$broadcast('snippet-start');
            }
        });
    }

    function hideSnippet (scope) {
        scope.showCode = false;
        scope.showTime = false;
        scope.showDialog = false;
    }

    function showInstruction (scope) {
        scope.showHint = true;
        scope.showText = true;
    }

    function showProgress(progress, scope) {
        scope.showProgress = true;
        scope.$broadcast('display-progress', progress);
    }

    var map = {
        success: function (scope, page) {
            showInstruction(scope);
            hideSnippet(scope);
            scope.showNextButton = true;
        },
        failure: function (scope, page) {
            showInstruction(scope);
            hideSnippet(scope);
            scope.showNextButton = true;
        },
        structure: function (scope, page) {
            showProgress(20, scope);
            hideSnippet(scope);
            showInstruction(scope);
            scope.showNextButton = true;
        },
        start: function (scope, page) {
            scope.showProgress = false;
            hideSnippet(scope);
            showInstruction(scope);
            scope.showNextButton = true;
        },
        semantic: function (scope, page) {
            scope.showProgress = false;
            hideSnippet(scope);
            showInstruction(scope)
            waitForSpaceBar(scope);
        },
        entersyntax: function (scope, page) {
            showProgress(75, scope);
            hideSnippet(scope);
            showInstruction(scope)
            scope.showNextButton = true;
        },
        syntactic: function (scope, page) {
            scope.showProgress = false;
            hideSnippet(scope);
            showInstruction(scope)
            waitForSpaceBar(scope);
        },
        almostdone: function (scope, page) {
            showProgress(90, scope);
            hideSnippet(scope);
            showInstruction(scope);
            scope.showNextButton = true;
        }
    };

    function step (condition, scope, page) {
        var none = function () { };
        var func = (map[condition] || none);
        func(scope, page);
    }

    return {
        step: step
    };
})

.controller('experimentController',
['$http', '$q', '$scope', '$sce', '$timeout' ,'$window', 'api', 'experimentService',
function ($http, $q, $scope, $sce, $timeout, $window, api, experiment) {

    this.pages = [];
    this.grading = [];

    var attempts = 0;
    var current_page = 0;
    var current_snippet = 0;
    var events = [];
    var keys = [];
    var snippets = [];
    var warning = {};


    $scope.buttonDisabled = false;
    $scope.current = current_snippet + 1;
    $scope.report = new Report();
    $scope.showProgress = true;

    var letterbox = new Letterbox();
    var keyboard = new Keyboard();
    var clock = new Clock({
        element: '#clock',
        onStart: function (date) {
            $scope.$emit('clock-start');
        },
        onTick: function (timer) {
            $scope.$emit('clock-tick');
        },
        onWarn: function (timer) {
            $scope.$emit('clock-warn');
        },
        onElapsed: function (timer) {
            $scope.$emit('clock-elapsed');
        },
        onStop: function (date) {
            $scope.$emit('clock-stop');
        }
    });

    function Report () {
        return {
            correction: '',
            description: '',
            events: [],
            file: '',
            keys: [],
            linenumber: null,
            state: '',
            viewport: []
        }
    }

    var MAX_ATTEMPTS = 3;
    function attemptsLeft () {
        // Zero based indexing
        return attempts < (MAX_ATTEMPTS - 1);
    }

    function clearData () {
        warning.popover('hide');
        $scope.report = new Report();
        keys = [];
        events = [];
        attempts = 0;
        clock.stop();
    }

    function closeDialog () {
        hideDialog();
        keyboard.resume();
        recordMouse();
        $scope.report.linenumber = null;
        $scope.report.correction = '';
        letterbox.clearHighlight();
    }

    function correctAnswer (linenumber) {
        // Check this stuff out as soon as the snippet has loaded!!
        var snippetName = snippetFilename();
        var givenLine = linenumber;
        var functionName = snippetName.split('.')[0];
        var expected = expectedLine(functionName);

        return (expected == givenLine);
    }

    function displaySnippet () {
        showCode();
        reactToInput();
        $timeout(function (){
            // prevents sideeffect
            letterbox.reset();
            clock.start();
        }, 10);
    }

    function displayPage() {

        if(current_page >= this.pages.length) {
            finish();
            return;
        }

        var page = this.pages[current_page];
        $scope.page = page;
        experiment.step(page.condition, $scope, page);
    }

    function enableButtons () {
        $scope.buttonDisabled = false;
    }

    function disableButtons () {
        $scope.buttonDisabled = true;
    }

    function emitEvent(eventType) {
        return function (data) {
            $scope.$emit(eventType, data);
        };
    }

    function expectedLine(functionName) {
        // Find Snippet Metadata
        var result = this.grading[functionName];
        if(!result) {
            // TODO: Improve Error Handling
            console.log("You done fucked up");
        }
        return result.Line;
    }

    function complete () {
        $window.location.href = api.page_complete;
    }

    function finish () {
        $window.location.href = api.page_questions;
    }

    function hideDialog () {
        $scope.showHint = false;
        $scope.showCode = true;
        $scope.showVeil = false;
        $scope.showTime = true;
        $scope.showDialog = false;
    }

    function initializeWarning () {
        warning = $('#clock').popover({
            title: $scope.labels.clock,
            content: $scope.labels.time_warning,
            placement: 'left',
            trigger: 'manual'
        });
    }

    function initialize (start) {
        $http
        .get(api.trial)
        .success(function (result) {
            snippets = result.data;
            if(snippets === "Done"){
                complete();
                return;
            }

            $scope.number = snippets.length
;
            $q.all([
                $http.get(api.assets_labels),
                $http.get(api.assets_instructions),
                $http.get(api.assets_grading)
            ])
            .then(function (results) {
                $scope.labels = results[0].data.data;
                initializeWarning();
                this.pages = results[1].data.data;
                this.grading = results[2].data.data;
                start();
            });
        });
    }

    function loadSnippet (func) {
        $http
        .get(api.snippet_directory + snippetFilename())
        .success(function (data) {
            $scope.code = $sce.trustAsHtml(data);
            func();
        });
    }

    function nextPage () {
        current_page += 1;
        displayPage();
    }

    function openDialog () {
        enableButtons();
        showDialog();
        keyboard.pause();
        pauseRecordMouse();
    }

    function reactToInput () {
        keyboard = new Keyboard();
        keyboard.register({
            up: letterbox.scrollUp,
            down: letterbox.scrollDown,
            space: function () {
                $scope.$emit('dialog-open')
            }
        });
        keyboard.record = function (code, name, time){
            recordKey({
                code: code,
                name: name,
                time: time,
                line: letterbox.currentLine()
            })
        };

        recordMouse();
    }

    function registerMouse (event_) {
        recordEvent({
            type: 'Mouse',
            code: event_.which,
            time: new Date()
        });
    }

    function pauseRecordMouse () {
        $(document).unbind('mousedown');
    }

    function recordMouse () {
        $(document).mousedown(registerMouse);
    }

    function recordEvent (event_) {
        event_.time = event_.time.toISOString();
        events.push(event_);
    }

    function recordKey (keypress) {
        keypress.time = keypress.time.toISOString();
        keys.push(keypress);
    }

    function showCode () {
        $scope.showHint = false;
        $scope.showCode = true;
        $scope.showVeil = false;
        $scope.showTime = true;
        $scope.showDialog = false;
    }

    function showDialog () {
        $scope.showHint = false;
        $scope.showCode = true;
        $scope.showVeil = true;
        $scope.showTime = false;
        $scope.showDialog = true;
    }

    function showTimeLimit() {
        $timeout(function () {
            warning.popover('show');
        }, 500);
    }

    function snippetFilename () {
        return snippets[current_snippet];
    }

    function submitDialog (report) {

        // prevents resubmission
        disableButtons();

        report.viewport = [window.innerWidth, window.innerHeight];
        report.events = events;
        report.file = snippetFilename();
        report.keys = keys;
        report.submitted = new Date().toISOString();

        $http
        .post(api.trial, {'data': report})
        .success(function (d) {
            var last_report_state = report.state;
            clearData();
            $scope.$emit('snippet-feedback', last_report_state);
        })
        .finally(function (){
            enableButtons();
        });
    }

    // Setup Dialog Interactions
    $scope.found = emitEvent('dialog-found');
    $scope.cancel = emitEvent('dialog-close');

    $scope.$watch('report.linenumber', function (number) {
        if(number === null){
            return;
        }
        var code = letterbox.highlight(number);
        $scope.report.correction = code;
    });

    $scope.$on('next', function () {
        nextPage();
    });

    $scope.$on('dialog-open', function () {
        recordEvent({
            type: 'Snippet',
            code: 'Open Dialog',
            time: new Date()
        });
        $scope.$apply(openDialog);
    });

    $scope.$on('dialog-close', function () {
        recordEvent({
            type: 'Snippet',
            code: 'Cancel',
            time: new Date()
        });
        closeDialog();
    });

    $scope.$on('dialog-found', function (event, report) {

        // Record done button hit
        recordEvent({
            type: 'Snippet',
            code: 'Done',
            time: new Date()
        });

        // If correct: Just go to next.
        var error_correctly_found = correctAnswer(report.linenumber);
        if(error_correctly_found) {
            report.state = 'success';
            submitDialog(report);
            return;
        }

        // Show an error message 2 times, for 3 attempts.
        if(attemptsLeft()) {
            errorFeedback();
            return;
        }

        // Submit after 3 trials
        report.state = 'failure';
        submitDialog(report);
    });

    function errorFeedback () {
        attempts += 1;
        var answer = $scope.labels.answer_error;
        var message = answer.message + (MAX_ATTEMPTS - attempts).toString();
        $scope.$emit('feedback-open', [answer.image, message, $scope.labels.button_close]);
        recordEvent({
            type: "Snippet",
            code: "Wrong Answer " + attempts.toString(),
            time: new Date()
        });
        $scope.showDialog = false;
    }

    $scope.$on('feedback-closed', function () {
        recordEvent({
            type: "Snippet",
            code: "Feedback Closed",
            time: new Date()
        });
        $scope.showDialog = true;
    });

    $scope.$on('snippet-start', function () {
        recordEvent({
            type: 'Snippet',
            code: 'Start',
            time: new Date()
        });
        loadSnippet(displaySnippet);
    });

    function displayFeedback(status) {
        current_snippet += 1;
        $scope.current += 1;
        $scope.showDialog = false;
        $scope.showCode = false;
        $scope.showHint = true;
        $scope.showTime = false;
        // display success or no trials left image
        $scope.page = $scope.labels[status];
    }

    $scope.$on('snippet-feedback', function (event_, data) {
        displayFeedback(data);
    });

    $scope.$on('snippet-done', function () {
        current_snippet += 1;
        $scope.current += 1;
        nextPage();
    });

    $scope.$on('clock-start', function () {
        recordEvent({
            type: 'Clock',
            code: 'Start',
            time: new Date()
        });
    });

    $scope.$on('clock-tick', function () {
        recordEvent({
            type: 'Clock',
            code: 'Tick',
            time: new Date()
        });
    });

    $scope.$on('clock-warn', function () {
        recordEvent({
            type: 'Clock',
            code: 'Warn',
            time: new Date()
        });
        showTimeLimit();
    });

    $scope.$on('clock-elapsed', function () {
        recordEvent({
            type: 'Clock',
            code: 'Elapsed',
            time: new Date()
        });

        var report = new Report();
        report.linenumber = -1;
        report.description = '[elapsed]';
        report.correction = '[elapsed]';
        report.state = 'elapsed';

        submitDialog(report);
    });

    // I forgot what this does and at this point I am too afraid to breakt things
    // to change it.
    $scope.$on('clock-stop', function (){
        // reset
    });

    initialize(displayPage);
}]); // controller

})(); // ns shield