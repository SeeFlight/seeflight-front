angular.module('seeflight.properties')

.constant('properties', (function() {
  var distantHost = 'http://localhost:3000/';
  var maxDaysInDestinaton = 15;

  return {
    DISTANT_HOST: distantHost,
    MAX_DAYS_IN_DESTINATION : maxDaysInDestinaton
  }
})());