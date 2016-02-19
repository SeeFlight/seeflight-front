angular.module('seeflight.properties')

.constant('properties', (function() {
  return {
    DISTANT_HOST: 'http://ec2-52-31-139-44.eu-west-1.compute.amazonaws.com:9090/',
    MAX_DAYS_IN_DESTINATION : 15,
    MAX_DAYS_BEFORE_DEPARTURE : 45,
    NB_FLIGHTS_DISPLAYED : 15
  }
})());