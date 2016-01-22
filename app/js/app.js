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

.controller('SearchController', function($scope, $state, $stateParams, Flight, properties, Provider, $window){

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
		minDepartureDate : new Date().getTime()+24*60*60*1000,
		maxDepartureDate : new Date().getTime()+properties.MAX_DAYS_IN_DESTINATION*24*60*60*1000,
		minReturnDate : new Date().getTime()+2*24*60*60*1000,
        maxReturnDate : new Date().getTime()+2*properties.MAX_DAYS_IN_DESTINATION*24*60*60*1000,
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
		  if(response.status === 200){
		    $scope.response = response.data;
		    $scope.settings.dataMaxPrice = Math.ceil(Math.max.apply(Math, $scope.response.flights.map(function(o){return o.lowestFare;})));
		    $scope.settings.dataMinPrice = Math.ceil(Math.min.apply(Math, $scope.response.flights.map(function(o){return o.lowestFare;})));
		    $scope.settings.maxPrice = $scope.settings.dataMaxPrice;
		    for(var i=0; i<$scope.response.flights.length; i++){
		    	var flight = $scope.response.flights[i];
		    	$scope.response.flights[i].departureFormatedDate = moment(parseInt(flight.departureDate)).format('ddd. D MMM YYYY');
		    	$scope.response.flights[i].returnFormatedDate = moment(parseInt(flight.returnDate)).format('ddd. D MMM YYYY');
		    	$scope.response.flights[i].lowestFare = Math.ceil(flight.lowestFare);
		    }
		    /*for(var i=0; i<$scope.response.providers.length; i++){
		    	Provider.getProviderByName($scope.response.providers[i].name, $scope.response._id, $scope.response.flights[0]).then(function(resp){

		    	});
		    }*/
		  }else{
		    $scope.response.flights = [];
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
	};

	$scope.buyFlight = function(flight){
		var url;
		switch(flight.pointOfSaleCountry){
			case "US" : 
				url = 'http://www.dpbolvw.net/click-7889275-10581071?GOTO=EXPFLTWIZ&load=1&TripType=Roundtrip&FrAirport=';
				url += flight.origin;
				url += '&ToAirport=';
				url += flight.destination;
				url += '&FromDate=';
				url += moment(parseInt(flight.departureDate)).format('MM/DD/YYYY');
				url += '&ToDate=';
				url += moment(parseInt(flight.returnDate)).format('MM/DD/YYYY');
				url += '&NumAdult=1';
			break;
			default : 
				url = 'http://tracking.publicidees.com/clic.php?progid=515&partid=47438&dpl=http://www.govoyages.com/?mktportal=publicidees&mktportal=publicidees&utm_source=publicidees&utm_medium=affiliates&utm_term=flight&utm_campaign=47438&utm_content=metasearch&#/results/type=R;dep=';
				url += moment(parseInt(flight.departureDate)).format('YYYY-MM-DD');
				url += ';from=';
				url += flight.origin;
				url += ';to=';
				url += flight.destination;
				url += ';ret=';
				url += moment(parseInt(flight.returnDate)).format('YYYY-MM-DD');
				url += ';collectionmethod=false;airlinescodes=false;internalSearch=true';
			break;
		}

		$window.open(url);
	};

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

.directive('datepicker', function() {
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
          mindate : '@',
          maxdate : '@'
      },
      compile: function compile(tElement, tAttrs, transclude){
        $(tElement[0]).find(".date-picker-input").attr('id', tAttrs.fieldid);
        $(tElement[0]).find(".cross-date-picker").attr('id', "cross-"+tAttrs.fieldid);
        return {
          post: function postLink($scope, element, attrs, controller) {
            initDatepicker();

            $('#cross-'+$scope.fieldid).click(function(){
              $scope.$apply(function () {
                $scope.value = null;
              });
              $('#'+$scope.fieldid).datepicker("setDate", "" );
              $(this).addClass('hidden');
            });

            function initDatepicker(){
              $scope.idElement = $scope.fieldid;

              var minDate = new Date(parseInt($scope.mindate));
              var maxDate = new Date(parseInt($scope.maxdate));
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
                  $('#cross-'+$scope.fieldid).removeClass('hidden');
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
      }
    }
})

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
angular.module('seeflight.services')

.factory('Provider', function($http, properties) {
  return {
    getProviderByName: function(provider, flightId, flight) {
      var config = {
        method : 'GET',
        url : properties.DISTANT_HOST+'providers?name='+provider+'&flightId='+flightId+'&departureDate='+flight.departureDate+'&returnDate='+flight.returnDate
      };
      return $http(config).then(function(response) {
        return response;
      }, function(response) {
        return response;
      });
    }
  }
});