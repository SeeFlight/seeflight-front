angular.module('seeflight.properties')

.constant('properties', (function() {
  var distantHost = 'http://localhost:8080/';
  var maxDaysInDestination = 15;
  var maxDaysBeforeDeparture = 45;

  return {
    DISTANT_HOST: distantHost,
    MAX_DAYS_IN_DESTINATION : maxDaysInDestination,
    MAX_DAYS_BEFORE_DEPARTURE : maxDaysBeforeDeparture
  }
})());