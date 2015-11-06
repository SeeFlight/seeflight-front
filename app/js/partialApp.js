var module = angular.module('seeflight', ['ui.router', 'seeflight.controllers', 'seeflight.services', 'seeflight.properties', 'seeflight.filters', 'seeflight.directives'])

.config(function($httpProvider, $urlRouterProvider, $stateProvider) {  

    $urlRouterProvider.otherwise('/search');
    //$httpProvider.interceptors.push('httpInterceptor');

    $stateProvider
    .state('home', {
      url: '/home',
      controller: 'HomeController',
      templateUrl: 'templates/home.html'
    })
    .state('search', {
      url: '/search?origin&destination',
      controller: 'SearchController',
      templateUrl: 'templates/search.html'
    });

});

angular.module('seeflight.controllers', []);
angular.module('seeflight.interceptors', []);
angular.module('seeflight.services', []);
angular.module('seeflight.properties', []);
angular.module('seeflight.filters', []);
angular.module('seeflight.directives', []);