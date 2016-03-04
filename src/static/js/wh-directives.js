(function () {
angular
.module('weaselDirectives', ['ngSanitize'])


.directive('alert', function () {
    return {
        replace: true,
        restrict: 'E',
        transclude: true,
        scope: {
            title: '@'
        },
        templateUrl: '/static/templates/controls/alert.html'
    };
}) // alert


.directive('border', function () {
    return {
        replace: true,
        restrict: 'E',
        transclude: true,
        templateUrl: '/static/templates/controls/border.html'
    };
}) // border


.directive('container', function () {
    return {
        replace: true,
        restrict: 'E',
        transclude: true,
        template: '<div class="container" ng-transclude></div>'
    };
}) // container


.directive('info', function () {
    return {
        replace: true,
        restrict: 'E',
        transclude: true,
        scope: {
            title: "@"
        },
        templateUrl: '/static/templates/controls/info.html'
    }
}) // info


.directive('flash', ['$timeout', function ($timeout) {
    return {
        replace: true,
        restrict: 'E',
        transclude: true,
        templateUrl: '/static/templates/controls/flash.html',
        controller: ['$scope', function ($scope){

            var self = this;
            var styles = ['danger', 'info', 'warning', 'success'];

            function flash(class_, title, message) {
                if(styles.indexOf(class_) === -1) {
                    class_ = 'info';
                }
                $scope.class = class_;
                $scope.title = title || '';
                $scope.message = message || '';
                $scope.visible = true;
            };

            function hide() {
                $scope.visible = false;
            };

            $scope.$on('flash', function (event, data) {
                flash.apply(self, data);
                $timeout(hide, 2000);
            });
        }]
    };
}])


.directive('fullRow', function () {
    return {
        replace: true,
        restrict: 'E',
        transclude: true,
        template: '<div class="row"><div class="col-lg-12" ng-transclude></div>'
    };
})


.directive('next', function () {
    return {
        replace: true,
        restrict: 'E',
        template: '<a href="" ng-click="next()" class="btn btn-success">Weiter</a>',
        link: function (scope, element, attributes) {
            scope.next = function () {
                scope.$emit('next');
            };
        }
    };
})


.directive('messageBox', function () {
  return {
    replace: true,
    restrict: 'E',
    templateUrl: '/static/templates/controls/modal.html',
    controller: ['$scope', '$sce', function ($scope, $sce) {
      var self = this;
      $scope.message = $sce.trustAsHtml($scope.message);
      self.show = function (message, title, dismissButtonLabel) {
        $scope.message = message || '';
        $scope.title = title || '';
        $scope.dismissButtonLabel = dismissButtonLabel || 'Schließen';
        $('#modal').modal();
      };
      $scope.$on('messageBox', function (event, data) {
        // Data: Array containing Message, Title, and Button-Labels
        self.show.apply(self, data);
      });
    }]
  };
}) // messageBox


.directive('number', function () {
    return {
        replace: true,
        restrict: 'E',
        transclude: true,
        scope: {
            number: '=value'
        },
        templateUrl: '/static/templates/controls/number.html'
    };
}) // number


.directive('objectview', function () {
  return {
    replace: true,
    restrict: 'E',
    templateUrl: '/static/templates/controls/objectview.html',
    controller: ['$scope', function ($scope) {
      var self = this;
      self.show = function (properties, title, dismissButtonLabel) {

        $scope.properties = {};
        $scope.objects = [];
        if(angular.isArray(properties)) {
            $scope.objects = properties;
        } else {
            $scope.properties = properties;
        }

        $scope.title = title || '';
        $scope.dismissButtonLabel = dismissButtonLabel || 'Schließen';
        $('#modal').modal();
      };
      $scope.$on('objectview', function (event, data) {
        // Data: Array containing Properties, Title, and Button-Labels
        self.show.apply(self, data);
      });
    }]
  };
}) // objectview


.directive('panel', function () {
    return {
        replace: true,
        restrict: 'E',
        transclude: true,
        scope: {
            title: '@'
        },
        templateUrl: '/static/templates/controls/panel.html',
        controller: ['$scope', function ($scope) {
            if($scope.title) {
                $scope.showTitle = true;
            }
        }]
    };
}) // panel


.directive('propertygrid', function () {
    return {
        replace: true,
        restrict: 'E',
        scope: {
            properties: '='
        },
        templateUrl: '/static/templates/controls/propertygrid.html',
    };
}) // propertygrid


.directive('submitDe', function () {
    return {
        replace: true,
        restrict: 'E',
        template: '<button type="submit" class="btn btn-success">Weiter</button>'
    };
})


.directive('submitEn', function () {
    return {
        replace: true,
        restrict: 'E',
        template: '<button type="submit" class="btn btn-success">Next</button>'
    };
});

})(); // ns shield
