angular.module('seeflight.directives')

.directive('slider', function() {
  return {
      restrict: 'E',
      templateUrl: 'templates/directives/slider.html',
      replace: true,
      scope: {
          value: '=value',
          min: '=min',
          max: '=max',
          orientation: '@',
          range: '@',
          id: '@'
      },
      link: function ($scope, element, attrs) {

        $scope.$watch('min', function (min){
            $scope.min = min;
            initSlider();
        });

        $scope.$watch('max', function (max){
            $scope.max = max;
            initSlider();
        });

        $('#'+attrs.id).on("slide", function (event, ui) {
            $scope.$apply(function () {
                $scope.value = ui.value;
            })
        });

        initSlider();

        function initSlider(){
          $('#'+attrs.id).slider({
              min: $scope.min,
              max: $scope.max,
              value: $scope.value,
              orientation: $scope.orientation,
              range: $scope.range
          });
        }
      }
  }
});