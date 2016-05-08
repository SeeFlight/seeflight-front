angular.module('seeflight.directives')

.directive('cityAutocomplete', function($window, CityProvider) {
  return {
      restrict: 'E',
      templateUrl: 'templates/directives/cityAutocomplete.html',
      replace: true,
      scope: {
          callback: '&',
          cityCode:'=',
          cityName : '@',
          placeHolder : '@',
          pointOfSale : '='
      },
      link: function ($scope, element, attrs) {
        $scope.setCityCode = function(cityResult){
          $scope.cityName = cityResult.PlaceName+' ('+cityResult.PlaceId+')';
          $scope.cityCode = cityResult.PlaceId;
          $scope.pointOfSale = cityResult.CountryId === "UK" ? "GB" : cityResult.CountryId;
          $scope.showCityResults = !$scope.showCityResults;
        }

        $(element[0]).keyup(function(key){
          if(key.which === 9){
            $scope.showCityResults = false;
          }else if(key.which === 13){
            if($scope.showCityResults && $scope.cityResults && $scope.cityResults.length>0){
              $scope.setCityCode($scope.cityResults[0]);
            }
          }else{
            var character = key.which || key.keyCode;
            var c = String.fromCharCode(character);
            var currentElement = $(this);
            var isOrigin = $(this).hasClass("from");
            $scope.showCityResults = true;
            if($scope.cityName && $scope.cityName.length>0){
              CityProvider.getCityPrediction({cityCode:$scope.cityName}).then(function(response){
                if(response.status === 200){
                  var data = response.data;
                  var result;
                  for(result in data){
                    if(data[result].PlaceId.length>3){
                      data[result].PlaceId=data[result].PlaceId.substring(0,3);
                    }
                  }
                  $scope.cityResults = data;
                }else{
                  $scope.cityResults = [];
                }
              });
            }
          }
        });
      }
  }
});