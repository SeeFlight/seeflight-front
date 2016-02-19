angular.module('seeflight.properties')

.constant('properties', (function() {
  return {
    DISTANT_HOST: 'http://localhost:8080/',
    MAX_DAYS_IN_DESTINATION : 15,
    MAX_DAYS_BEFORE_DEPARTURE : 45,
    NB_FLIGHTS_DISPLAYED : 15
  }
})());