$('.cities').keyup(function(key){
	var character = key.which || key.keyCode;
	var c = String.fromCharCode(character);
	var url = "http://www.skyscanner.fr/dataservices/geo/v2.0/autosuggest/UK/";
	url+= "en-EN/";
	url += $(this).val();
	url += "?isDestination=false&ccy=EUR";
	var currentElement = $(this);
	var isOrigin = $(this).hasClass("from");

	$.ajax({
		url: url,
		type: 'get',
		statusCode: {
			200: function (data) {
				var idResult = "cities-result";
				$('#'+idResult).remove();
				var $div = $(document.createElement('ul'));
				$div.addClass("nav nav-list");
				$div.attr("id",idResult);
				$div.attr("data-is-origin", isOrigin);

				for(var i=0;i<data.length;i++){
					var $divCity = $(document.createElement('li'));
					$divCity.addClass("city-result");
					$divCity.attr("data-city-code", data[i].PlaceId);
					$divCity.attr("data-city-name", data[i].PlaceName);
					var $p = $(document.createElement('a'));
					$p.text(data[i].PlaceName+" ("+data[i].PlaceId+")");

					var $span = $(document.createElement('span'));
					$span.addClass("country-result");
					$span.text(data[i].CountryName);

					$p.append($span);
					$divCity.append($p);
					$div.append($divCity);
				}
				$div.insertAfter(currentElement);
			}
		}
	});
});

$('form').on('click', '.city-result', function () { 
	var cityCode = $(this).attr("data-city-code");
	var cityName = $(this).attr("data-city-name");
	var isOrigin = $(this).parent().attr("data-is-origin");
	if(isOrigin === "true"){
		$('input.from').attr("data-city-code", cityCode);
		$('input.from').val(cityName);
	}else{
		$('input.to').attr("data-city-code", cityCode);
		$('input.to').val(cityName);
	}
	$('#cities-result').addClass("hidden");
});

$(document).click(function(event) { 
    if(!$(event.target).closest('#cities-result').length && !$(event.target).is('#cities-result')) {
        if($('#cities-result').is(":visible")) {
            $('#cities-result').addClass("hidden");
        }
    }        
})