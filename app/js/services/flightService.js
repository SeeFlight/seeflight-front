angular.module('tidybear.services')

.factory('Reservation', function($http, properties) {
  return {
    getAllFlights: function(search) {
      var config = {
        method : 'GET',
        url : properties.DISTANT_HOST+'flights?origin='+search.origin+'&destination='+search.destination
      };
      return $http(config).then(function(response) {
        return response;
      }, function(response) {
        return response;
      });
    }
  }
};