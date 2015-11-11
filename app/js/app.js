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
angular.module('seeflight.properties')

.constant('properties', (function() {
  var distantHost = 'http://localhost:8080/';
  var maxDaysInDestination = 15;
  var maxDaysBeforeDeparture = 15;

  return {
    DISTANT_HOST: distantHost,
    MAX_DAYS_IN_DESTINATION : maxDaysInDestination,
    MAX_DAYS_BEFORE_DEPARTURE : maxDaysBeforeDeparture
  }
})());
angular.module('seeflight.controllers')

.controller('SearchController', function($scope, $state, $stateParams, Flight, properties){

	$scope.response = {
		flights : []
	};
	$scope.settings = {
		dataMinPrice : 0,
		dataMaxPrice : 2000,
		maxPrice : 2000,
		daysBeforeDepart : [0, 5, 10],
		showSpecificDepartureArray : false,
		isLoading : false,
		specificDepartureArray : createArray(properties.MAX_DAYS_BEFORE_DEPARTURE),
		daysInDestination : {
			array : createArray(properties.MAX_DAYS_IN_DESTINATION),
			firstChbx : true,
			secondChbx : true,
			thirdChbx : true,
			fourthChbx : true
		}
	};

	$scope.search = function(search){
		$scope.settings.isLoading = true;
		Flight.getAllFlights(search).then(function(response){
		  $scope.settings.isLoading = false;
		  if(response.data){
		    $scope.response = response.data;
		    $scope.settings.dataMaxPrice = Math.ceil(Math.max.apply(Math, $scope.response.flights.map(function(o){return o.lowestFare;})));
		    $scope.settings.dataMinPrice = Math.ceil(Math.min.apply(Math, $scope.response.flights.map(function(o){return o.lowestFare;})));
		    $scope.settings.maxPrice = $scope.settings.dataMaxPrice;
		    for(var i=0; i<$scope.response.flights.length; i++){
		    	var flight = $scope.response.flights[i];
		    	$scope.response.flights[i].departureFormatedDate = moment(parseInt(flight.departureDate)).format('D MMM YYYY');
		    	$scope.response.flights[i].returnFormatedDate = moment(parseInt(flight.returnDate)).format('D MMM YYYY');
		    	$scope.response.flights[i].lowestFare = Math.ceil(flight.lowestFare);
		    }
		  }else{
		    
		  }
		});
	};

	$scope.manageDaysInDestination = function(add, from, to){
		if(add === true){
			for(var i=from ; i<=to; i++){
				$scope.settings.daysInDestination.array.push(i);
			}
		}else{
			for(var i=from ; i<=to; i++){
				var index = $scope.settings.daysInDestination.array.indexOf(i);
				if (index > -1) {
				    $scope.settings.daysInDestination.array.splice(index, 1);
				}
			}
		}
	};

	$scope.handleSpecificDepartureDate = function(daysBeforeDepart){
		var found = false;
		var i = 0;
		while(!found && i<$scope.settings.specificDepartureArray.length){
			if($scope.settings.specificDepartureArray[i] === daysBeforeDepart){
				found = true;
			}
			i++;
		}
		if(!found){
			$scope.settings.specificDepartureArray.push(daysBeforeDepart);
		}else{
			$scope.settings.specificDepartureArray.splice(i-1, 1);
		}
	};

	$scope.getPriceArray = function(flight){
		var currency = flight.currencyCode === "EUR" ? "€" : "$";
		var price = flight.lowestFare;

		var priceArray = [];
		priceArray.push(currency);
		priceArray.push.apply(priceArray, price.toString().split(""));
		return priceArray;
	}

	if($stateParams.origin && $stateParams.destination){
		$scope.search.origin = $stateParams.origin;
		$scope.search.destination = $stateParams.destination;
		$scope.search({
			origin : $stateParams.origin, 
			destination : $stateParams.destination
		});
	}

	function createArray(n){
		var array = [];
		for (var i = 1; i <= n; i++) {
		  array.push(i);
		}
		return array;
	}
});
angular.module('seeflight.filters')

.filter("departureFilter", function() {
	return function(flights, minDays, maxDays, specificDepartureDate, specificDepartureArray) {
		var out = [];
		if(specificDepartureDate){
			for (var i = 0; i < flights.length; i++){
			  if(flights[i].departureDate === specificDepartureDate && flights[i].daysToDeparture > minDays && flights[i].daysToDeparture <= maxDays){
				out.push(flights[i]);
			  }
			}    
		}else if(specificDepartureArray){
			for (var i = 0; i < flights.length; i++){
				if(specificDepartureArray.indexOf(flights[i].daysToDeparture) > -1 && flights[i].daysToDeparture > minDays && flights[i].daysToDeparture <= maxDays){
					out.push(flights[i]);
				}
			}
		}else{
			for (var i = 0; i < flights.length; i++){
			  if(flights[i].daysToDeparture > minDays && flights[i].daysToDeparture <= maxDays){
			      out.push(flights[i]);
			  }
			}    
		}  
		return out;
	};
})

.filter("returnFilter", function() {
	return function(flights, specificReturnDate) {
		var out = [];
		if(specificReturnDate){
			for (var i = 0; i < flights.length; i++){
			  if(flights[i].returnDate === specificReturnDate){
				out.push(flights[i]);
			  }
			}    
		}else{
			out.push.apply(out, flights);
		}  
		return out;
	};
})

.filter("priceFilter", function() {
	return function(flights, maxPrice) {
		var out = [];
		for (var i = 0; i < flights.length; i++){
		  if(flights[i].lowestFare <= maxPrice){
		      out.push(flights[i]);
		  }
		}      
		return out;
	};
})

.filter("daysInDestinationFilter", function() {
	return function(flights, daysInDestination) {
		var out = [];
		for (var i = 0; i < flights.length; i++){
			if(daysInDestination.indexOf(flights[i].lengthOfStay) > -1){
				out.push(flights[i]);
			}
		}      
		return out;
	};
});
angular.module('seeflight.directives')

.directive('datepickerdeparture', function() {
  return {
      restrict: 'E',
      templateUrl: 'templates/directives/datepickerDeparture.html',
      replace: true,
      scope: {
          value: '=value',
          dateformat: '@',
          showothermonths: '@',
          selectothermonths: '@',
          fieldid: '@',
          yearrange: '@',
          maxdate : '@'
      },
      link: function ($scope, element, attrs) {

        initDatepicker();

        $('#cross-date-picker').click(function(){
          $scope.$apply(function () {
            $scope.value = null;
          });
          $('#'+$scope.fieldid).datepicker("setDate", "" );
          $(this).addClass('hidden');
        });

        function initDatepicker(){
          $scope.idElement = $scope.fieldid;

          var minDate = new Date(new Date().getTime()+24*60*60*1000);
          var maxDate = new Date(minDate.getTime()+($scope.maxdate-1)*24*60*60*1000);
          $('#'+$scope.fieldid).datepicker({
            showOtherMonths: $scope.showothermonths==="true",
            selectOtherMonths: $scope.selectothermonths==="true",
            dateFormat: $scope.dateformat,
            yearRange: $scope.yearrange,
            minDate: minDate,
            maxDate: maxDate,
            onSelect : function(dateText, instance){
              var selectedDate = $('#'+$scope.fieldid).datepicker("getDate");
              $scope.$apply(function () {
                $scope.value = selectedDate.getTime().toString();
              });
              $('#cross-date-picker').removeClass('hidden');
            }
          }).prev('.input-group-btn').on('click', function (e) {
            e && e.preventDefault();
            $('#'+$scope.fieldid).focus();
          });
          
          $.extend($.datepicker, { _checkOffset: function (inst,offset,isFixed) { return offset; } });
          $('#'+$scope.fieldid).datepicker('widget').css({ 'margin-left': -$('#'+$scope.fieldid).prev('.input-group-btn').find('.btn').outerWidth() + 3 });
        }
      }
  }
})

.directive('datepickerreturn', function() {
  return {
      restrict: 'E',
      templateUrl: 'templates/directives/datepickerReturn.html',
      replace: true,
      scope: {
          value: '=value',
          dateformat: '@',
          showothermonths: '@',
          selectothermonths: '@',
          fieldid: '@',
          yearrange: '@',
          maxdate : '@'
      },
      link: function ($scope, element, attrs) {

        initDatepicker();

        $('#cross-date-picker-return').click(function(){
          $scope.$apply(function () {
            $scope.value = null;
          });
          $('#'+$scope.fieldid).datepicker("setDate", "" );
          $(this).addClass('hidden');
        });

        function initDatepicker(){
          $scope.idElement = $scope.fieldid;

          var minDate = new Date(new Date().getTime()+2*24*60*60*1000);
          var maxDate = new Date(minDate.getTime()+2*$scope.maxdate*24*60*60*1000);
          $('#'+$scope.fieldid).datepicker({
            showOtherMonths: $scope.showothermonths==="true",
            selectOtherMonths: $scope.selectothermonths==="true",
            dateFormat: $scope.dateformat,
            yearRange: $scope.yearrange,
            minDate: minDate,
            maxDate: maxDate,
            onSelect : function(dateText, instance){
              var selectedDate = $('#'+$scope.fieldid).datepicker("getDate");
              $scope.$apply(function () {
                $scope.value = selectedDate.getTime().toString();
              });
              $('#cross-date-picker-return').removeClass('hidden');
            }
          }).prev('.input-group-btn').on('click', function (e) {
            e && e.preventDefault();
            $('#'+$scope.fieldid).focus();
          });
          
          $.extend($.datepicker, { _checkOffset: function (inst,offset,isFixed) { return offset; } });
          $('#'+$scope.fieldid).datepicker('widget').css({ 'margin-left': -$('#'+$scope.fieldid).prev('.input-group-btn').find('.btn').outerWidth() + 3 });
        }
      }
  }
});
angular.module('seeflight.directives')

.directive('slider', function() {
  return {
      restrict: 'E',
      templateUrl: 'templates/directives/slider.html',
      replace: true,
      scope: {
          value: '=value',
          min: '=min',
          max: '=max',
          orientation: '@',
          range: '@',
          id: '@'
      },
      link: function ($scope, element, attrs) {

        $scope.$watch('min', function (min){
            $scope.min = min;
            initSlider();
        });

        $scope.$watch('max', function (max){
            $scope.max = max;
            initSlider();
        });

        $('#'+attrs.id).on("slide", function (event, ui) {
            $scope.$apply(function () {
                $scope.value = ui.value;
            })
        });

        initSlider();

        function initSlider(){
          $('#'+attrs.id).slider({
              min: $scope.min,
              max: $scope.max,
              value: $scope.value,
              orientation: $scope.orientation,
              range: $scope.range
          });
        }
      }
  }
});
angular.module('seeflight.services')

.factory('Flight', function($http, properties) {
  return {
    getAllFlights: function(search) {
      var config = {
        method : 'GET',
        url : properties.DISTANT_HOST+'flights?origin='+search.origin+'&destination='+search.destination
      };
      return $http(config).then(function(response) {
        return response;
      }, function(response) {
        return response;
      });
    }
  }
});