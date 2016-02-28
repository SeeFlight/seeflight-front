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

	if($stateParams.origin && $stateParams.destination){
		$scope.search.origin = $stateParams.origin;
		$scope.search.destination = $stateParams.destination;
		$scope.search({
			origin : $stateParams.origin, 
			destination : $stateParams.destination
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