angular.module('seeflight.services')

.factory('CityProvider', function($http, properties) {
  return {
    getCityPrediction: function(search) {
      var url = properties.AUTOCOMPLETE_API;
      url += search.cityCode;
      url += "?isDestination=false&ccy=EUR";
      var config = {
        method : 'GET',
        url : url
      };
      return $http(config);
    }
  }
});