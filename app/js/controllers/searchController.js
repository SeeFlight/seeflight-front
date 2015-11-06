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
		Flight.getAllFlights(search).then(function(response){
		  if(response.data){
		    $scope.response = response.data;
		    $scope.settings.dataMaxPrice = Math.ceil(Math.max.apply(Math, $scope.response.flights.map(function(o){return o.lowestFare;})));
		    $scope.settings.dataMinPrice = Math.ceil(Math.min.apply(Math, $scope.response.flights.map(function(o){return o.lowestFare;})));
		    $scope.settings.maxPrice = $scope.settings.dataMaxPrice;
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