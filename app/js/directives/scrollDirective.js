angular.module('seeflight.directives')

.directive('scroll', function($window) {
  return {
      restrict: 'A',
      scope: {
          callback: '&',
          flight:'='
      },
      link: function ($scope, element, attrs) {
        angular.element($window).bind("scroll", function(){
    		if($window.scrollY+$window.screen.availHeight>element[0].offsetTop){
        		$scope.callback($scope.flight);
    		}
        });
      }
  }
});