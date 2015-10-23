angular.module('seeflight.controllers')

.controller('SearchController', function($scope, $state, Flight){

  $scope.search = function(search){
    Flight.getAllFlights(search).then(function(response){
      if(response.data){
        $scope.flights = response.data;
      }else{
        
      }
    });
  };

});