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
      url: '/search?origin&destination&daysInDestination&pointOfSale&originName&destinationName',
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
  return {
    DISTANT_HOST: 'http://localhost:8080/',
    MAX_DAYS_IN_DESTINATION : 15,
    MAX_DAYS_BEFORE_DEPARTURE : 45,
    NB_FLIGHTS_DISPLAYED : 15,
    AUTOCOMPLETE_API : "http://www.skyscanner.fr/dataservices/geo/v2.0/autosuggest/UK/en-EN/"
  }
})());
angular.module('seeflight.controllers')

.controller('SearchController', function($scope, $state, $stateParams, Search, properties, $window, $interval){

	$scope.response = {
		flights : []
	};
	$scope.totalFilteredFlights = {};
	$scope.settings = {
		dataMinPrice : 0,
		dataMaxPrice : 2000,
		maxPrice : 2000,
		daysBeforeDepart : [0, 5, 10, 15, 20, 25, 30, 35, 40],
		maxColumnsDisplayed : 3,
		showSpecificDepartureArray : false,
		isLoading : false,
		specificDepartureArray : createArray(1, properties.MAX_DAYS_BEFORE_DEPARTURE),
		minDepartureDate : new Date().getTime()+24*60*60*1000,
		maxDepartureDate : new Date().getTime()+properties.MAX_DAYS_BEFORE_DEPARTURE*24*60*60*1000,
		minReturnDate : new Date().getTime()+2*24*60*60*1000,
        maxReturnDate : new Date().getTime()+(properties.MAX_DAYS_BEFORE_DEPARTURE+properties.MAX_DAYS_IN_DESTINATION)*24*60*60*1000,
		mobileState : 0,
		desktopState : 0,
		currentPos : 0,
		poolUpdate : [],
		updateInterval : 1000
	};

	$scope.search = function(search){
		$scope.settings.isLoading = true;
		Search.getSearch(search).then(function(response){
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
		    	for(var k=0; k<$scope.response.providers.length; k++){
			    	var found = false;
			    	var j=0;
			    	while(j<$scope.response.flights[i].prices.length && !found){
			    		if($scope.response.flights[i].prices[j].provider === $scope.response.providers[k].name){
			    			found = true;
			    		}
			    		j++;
			    	}
			    	if(!found){
			    		var price = {
			    			provider : $scope.response.providers[k].name
			    		};
			    		$scope.response.flights[i].prices.push(price);
			    	}
			    }
				switch($scope.response.flights[i].currencyCode){
					case 'EUR' : $scope.response.flights[i].currencyCode = "€";
					break;
					case 'GBP' : $scope.response.flights[i].currencyCode = '£';
					break;
					default : $scope.response.flights[i].currencyCode = '$';
					break;
				}
		    }
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
		var price = flight.lowestFare;
		var deeplink = flight.deepLink;
		var airlineCode = flight.airlineCode;
		for(var i=0; i<flight.prices.length; i++){
			if(flight.prices[i].price<price){
				price = flight.prices[i].price;
				deeplink = flight.prices[i].deeplink;
				airlineCode = flight.prices[i].airlineCode;
			}
		}
		flight.lowestFare = price;
		flight.deepLink = deeplink;
		flight.airlineCode = airlineCode;
		var priceArray = [];
		priceArray.push(flight.currencyCode);
		priceArray.push.apply(priceArray, price.toString().split(""));
		return priceArray;
	};

	if($stateParams.origin && $stateParams.destination && $stateParams.pointOfSale){
		$scope.search.origin = $stateParams.origin;
		$scope.search.destination = $stateParams.destination;
		$scope.search.pointOfSale = $stateParams.pointOfSale;
		$scope.search({
			origin : $stateParams.origin, 
			destination : $stateParams.destination,
			pointOfSale : $stateParams.pointOfSale
		});
		if($stateParams.daysInDestination){
			if($stateParams.daysInDestination<=5){
				$scope.settings.daysInDestination = {
					array : createArray(1,5),
					firstChbx : true,
					secondChbx : false,
					thirdChbx : false
				};
			}else if($stateParams.daysInDestination>5 && $stateParams.daysInDestination<=10){
				$scope.settings.daysInDestination = {
					array : createArray(6, 10),
					firstChbx : false,
					secondChbx : true,
					thirdChbx : false
				};
			}else{
				$scope.settings.daysInDestination = {
					array : createArray(11,15),
					firstChbx : false,
					secondChbx : false,
					thirdChbx : true
				};
			}
		}else{
			$scope.settings.daysInDestination = {
				array : createArray(1, 15),
				firstChbx : true,
				secondChbx : true,
				thirdChbx : true
			};
		}
	}
	$scope.search.originCityName = $stateParams.originName;
	$scope.search.destinationCityName = $stateParams.destinationName;

	function createArray(start, end){
		var array = [];
		for (var i=start; i <= end; i++) {
		  array.push(i);
		}
		return array;
	}

	$scope.updateFlightPrice = function(flight){
	    for(var i=0; i<$scope.response.providers.length; i++){
	    	var found = false;
	    	var j=0;
	    	while(j<flight.prices.length && !found){
	    		if(flight.prices[j].provider === $scope.response.providers[i].name){
	    			found = true;
	    		}
	    		j++;
	    	}
	    	if(found && !flight.prices[j-1].price){
		    	Search.getProviderByName($scope.response.providers[i].name, $scope.response._id, flight).then(function(resp){
		    		flight.isLoading = false;
		    		if(resp.status === 200){
		    			if(resp.data.price<flight.lowestFare){
		    				flight.lowestFare = resp.data.price;
		    				flight.deepLink = resp.data.deeplink;
		    			}
		    			flight.prices[j-1] = resp.data;
		    		}
		    	});
	    	}else{
	    		flight.isLoading = false;
	    	}
	    }
	};

	$scope.checkUpdates = function(flight){
		if(flight.isLoading !== true){
			flight.isLoading = true;
			$scope.settings.poolUpdate.push(flight);
		}
	};

	$scope.addFilteredFlights = function(flights){
		for(var i=0;i<flights.length;i++){
			$scope.totalFilteredFlights[flights[i]._id] = flights[i];
		}
		return flights;
	};

	$interval(function(){
		if($scope.settings.poolUpdate.length>0){
			$scope.updateFlightPrice($scope.settings.poolUpdate.pop());
		}
	}, $scope.settings.updateInterval);
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

.directive('cityAutocomplete', function($window, CityProvider) {
  return {
      restrict: 'E',
      templateUrl: 'templates/directives/cityAutocomplete.html',
      replace: true,
      scope: {
          callback: '&',
          cityCode:'=',
          cityName : '@',
          placeHolder : '@',
          pointOfSale : '='
      },
      link: function ($scope, element, attrs) {
        $scope.setCityCode = function(cityResult){
          $scope.cityName = cityResult.PlaceName+' ('+cityResult.PlaceId+')';
          $scope.cityCode = cityResult.PlaceId;
          $scope.pointOfSale = cityResult.CountryId === "UK" ? "GB" : cityResult.CountryId;
          $scope.showCityResults = !$scope.showCityResults;
        }

        $(element[0]).keyup(function(key){
          if(key.which === 9){
            $scope.showCityResults = false;
          }else if(key.which === 13){
            if($scope.showCityResults && $scope.cityResults && $scope.cityResults.length>0){
              $scope.setCityCode($scope.cityResults[0]);
            }
          }else{
            var character = key.which || key.keyCode;
            var c = String.fromCharCode(character);
            var currentElement = $(this);
            var isOrigin = $(this).hasClass("from");
            $scope.showCityResults = true;
            if($scope.cityName && $scope.cityName.length>0){
              CityProvider.getCityPrediction({cityCode:$scope.cityName}).then(function(response){
                if(response.status === 200){
                  var data = response.data;
                  var result;
                  for(result in data){
                    if(data[result].PlaceId.length>3){
                      data[result].PlaceId=data[result].PlaceId.substring(0,3);
                    }
                  }
                  $scope.cityResults = data;
                }else{
                  $scope.cityResults = [];
                }
              });
            }
          }
        });
      }
  }
});
angular.module('seeflight.directives')

.directive('datepicker', function() {
  return {
      restrict: 'E',
      templateUrl: 'templates/directives/datepickerDeparture.html',
      replace: true,
      scope: {
          value: '=value',
          settings : '=settings',
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
                minDate: minDate,
                maxDate: maxDate,
                onSelect : function(dateText, instance){
                  var selectedDate = $('#'+$scope.fieldid).datepicker("getDate");
                  $scope.$apply(function () {
                    $scope.value = selectedDate.getTime().toString();
                    $scope.settings.mobileState = Math.floor(Math.floor((selectedDate.getTime()-new Date().getTime())/60/60/24/1000)/5);
                    $scope.settings.desktopState = Math.floor(Math.floor(Math.floor((selectedDate.getTime()-new Date().getTime())/60/60/24/1000)/5)/$scope.settings.maxColumnsDisplayed)*$scope.settings.maxColumnsDisplayed;
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

.directive('scroll', function($window) {
  return {
      restrict: 'A',
      scope: {
          callback: '&',
          flight:'='
      },
      link: function ($scope, element, attrs) {
        angular.element($window).bind("scroll", function(){
    		if($window.scrollY+$window.screen.availHeight>element[0].offsetTop){
        		$scope.callback($scope.flight);
    		}
        });
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

.factory('CityProvider', function($http, properties) {
  return {
    getCityPrediction: function(search) {
      var url = properties.AUTOCOMPLETE_API;
      url += search.cityCode;
      url += "?isDestination=false&ccy=EUR";
      var config = {
        method : 'GET',
        url : url
      };
      return $http(config);
    }
  }
});
angular.module('seeflight.services')

.factory('Search', function($http, properties) {
  return {
    getSearch: function(search) {
      var config = {
        method : 'GET',
        url : properties.DISTANT_HOST+'searches?origin='+search.origin+'&destination='+search.destination+'&pointOfSale='+search.pointOfSale
      };
      return $http(config).then(function(response) {
        return response;
      }, function(response) {
        return response;
      });
    },
    getProviderByName: function(provider, searchId, flight) {
      var config = {
        method : 'GET',
        url : properties.DISTANT_HOST+'searches/'+searchId+'/flights/'+flight._id+'/prices?provider='+provider
      };
      return $http(config).then(function(response) {
        return response;
      }, function(response) {
        return response;
      });
    }
  }
});