$('.cities').keyup(function(key){
	var character = key.which || key.keyCode;
	var c = String.fromCharCode(character);
	var url = "http://www.skyscanner.fr/dataservices/geo/v2.0/autosuggest/UK/";
	url+= "en-EN/";
	url += c;
	url += "?isDestination=false&ccy=EUR";

	$.ajax({
		url: url,
		type: 'get',
		statusCode: {
			200: function (data) {
				console.log(data);
			}
		}
	});
});