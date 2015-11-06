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