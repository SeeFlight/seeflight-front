angular.module('seeflight.services')

.factory('Search', function($http, properties) {
  return {
    getSearch: function(search) {
      var config = {
        method : 'GET',
        url : properties.DISTANT_HOST+'searches?origin='+search.origin+'&destination='+search.destination
      };
      return $http(config).then(function(response) {
        return response;
      }, function(response) {
        return response;
      });
    },
    getProviderByName: function(provider, searchId, flight) {
      var config = {
        method : 'GET',
        url : properties.DISTANT_HOST+'searches/'+searchId+'/flights/'+flight._id+'/prices?provider='+provider
      };
      return $http(config).then(function(response) {
        return response;
      }, function(response) {
        return response;
      });
    }
  }
});