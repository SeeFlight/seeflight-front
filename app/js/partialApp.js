var module = angular.module('seeflight', ['seeflight.controllers', 'seeflight.services', 'seeflight.interceptors', 'seeflight.properties'])

.config(function($stateProvider, $urlRouterProvider, $httpProvider) {

  $httpProvider.interceptors.push('httpInterceptor');

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('index', {
    url: '/search',
    controller: 'SearchController',
    templateUrl: 'templates/search.html'
  })


  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/search');

});

angular.module('seeflight.controllers', []);
angular.module('seeflight.interceptors', []);
angular.module('seeflight.services', []);
angular.module('seeflight.properties', []);