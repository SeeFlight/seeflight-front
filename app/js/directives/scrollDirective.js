angular.module('seeflight.directives')

.directive('scroll', function($window) {
  return {
      restrict: 'A',
      scope: {
          callback: '&'
      },
      link: function ($scope, element, attrs) {
        angular.element($window).bind("scroll", $scope.callback());
      }
  }
});