angular.module('seeflight.services')

.factory('Provider', function($http, properties) {
  return {
    getProviderByName: function(provider, flightId, flight) {
      var config = {
        method : 'GET',
        url : properties.DISTANT_HOST+'providers?name='+provider+'&flightId='+flightId+'&departureDate='+flight.departureDate+'&returnDate='+flight.returnDate
      };
      return $http(config).then(function(response) {
        return response;
      }, function(response) {
        return response;
      });
    }
  }
});