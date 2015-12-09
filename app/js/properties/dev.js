angular.module('seeflight.properties')

.constant('properties', (function() {
  var distantHost = 'http://ec2-52-31-139-44.eu-west-1.compute.amazonaws.com:8080/';
  var maxDaysInDestination = 15;
  var maxDaysBeforeDeparture = 15;

  return {
    DISTANT_HOST: distantHost,
    MAX_DAYS_IN_DESTINATION : maxDaysInDestination,
    MAX_DAYS_BEFORE_DEPARTURE : maxDaysBeforeDeparture
  }
})());