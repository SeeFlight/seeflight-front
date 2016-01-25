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
		var currency = '';
		switch(flight.currencyCode){
			case 'EUR' : currency = "€";
			break;
			case 'GBP' : currency = '£';
			break;
			default : currency = '$';
			break;
		}
		var price = flight.lowestFare;

		var priceArray = [];
		priceArray.push(currency);
		priceArray.push.apply(priceArray, price.toString().split(""));
		return priceArray;
	};

	$scope.buyFlight = function(flight){
		var url;
		if(flight.pointOfSaleCountry === 'US' && flight.pointOfSaleDestinationCountry === 'US'){
			url = 'http://www.dpbolvw.net/click-7889275-10581071?GOTO=EXPFLTWIZ&load=1&TripType=Roundtrip&FrAirport=';
			url += flight.origin;
			url += '&ToAirport=';
			url += flight.destination;
			url += '&FromDate=';
			url += moment(parseInt(flight.departureDate)).format('MM/DD/YYYY');
			url += '&ToDate=';
			url += moment(parseInt(flight.returnDate)).format('MM/DD/YYYY');
			url += '&NumAdult=1';
		}else if(flight.pointOfSaleCountry === 'GB'){				
			url = 'http://www.tripsta.co.uk/airline-tickets/results?dep=('
			url += flight.origin;
			url += ')&arr=(';
			url += flight.destination;
			url += ')&isRoundtrip=1&obDate=';
			url += moment(parseInt(flight.departureDate)).format('DD/MM/YYYY');
			url += '&ibDate=';
			url += moment(parseInt(flight.returnDate)).format('DD/MM/YYYY');
			url += '&obTime=&ibTime=&extendedDates=0&resetStaticSearchResults=1&passengersAdult=1&passengersChild=0&passengersInfant=0&airlineCode=&class=&directFlightsOnly=0';
		}else if(flight.pointOfSaleCountry === 'FR'){
			url = 'http://tracking.publicidees.com/clic.php?progid=515&partid=47438&dpl=http://www.govoyages.com/?mktportal=publicidees&mktportal=publicidees&utm_source=publicidees&utm_medium=affiliates&utm_term=flight&utm_campaign=47438&utm_content=metasearch&#/results/type=R;dep=';
			url += moment(parseInt(flight.departureDate)).format('YYYY-MM-DD');
			url += ';from=';
			url += flight.origin;
			url += ';to=';
			url += flight.destination;
			url += ';ret=';
			url += moment(parseInt(flight.returnDate)).format('YYYY-MM-DD');
			url += ';collectionmethod=false;airlinescodes=false;internalSearch=true';
		}else{
			url = 'http://www.cheapoair.com/fpnext/Air/RemoteSearch/?tabid=1832&from=';
			url += flight.origin;
			url += '&to=';
			url += flight.destination;
			url += '&fromDt=';
			url += moment(parseInt(flight.departureDate)).format('MM/DD/YYYY');
			url += '&toDt=';
			url += moment(parseInt(flight.returnDate)).format('MM/DD/YYYY');
			url += '&rt=true&daan=&raan=&dst=&rst=&ad=1&se=0&ch=0&infl=0&infs=0&class=1&airpref=&preftyp=1&searchflxdt=false&IsNS=false&searchflxarpt=false&childAge=';
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