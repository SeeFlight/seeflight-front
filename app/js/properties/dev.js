angular.module('seeflight.properties')

.constant('properties', (function() {
  var distantHost = 'http://localhost:3000/';
  var maxDaysInDestination = 15;
  var maxDaysBeforeDeparture = 15;

  return {
    DISTANT_HOST: distantHost,
    MAX_DAYS_IN_DESTINATION : maxDaysInDestination,
    MAX_DAYS_BEFORE_DEPARTURE : maxDaysBeforeDeparture
  }
})());