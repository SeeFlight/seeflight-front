var host = "<%=distantHost%>:<%=distantPort%>";
var protocole = "<%=distantProtocole%>";

$('#submit-beta').click(function(){
	var name = $('#beta-name').val();
	var mail = $('#beta-mail').val();

	if(name && mail){
		var user = {
			name : name,
			mail : mail
		};

		$.ajax({
			url: protocole+"://"+host+"/users",
			type: 'post',
			dataType: 'application/json',
			headers: { 
				'Accept': 'application/json',
				'Content-Type': 'application/json' 
			},
			statusCode: {
				201: function (data) {
				    var url = "search#/search?origin="+getParameterByName('origin')+"&destination="+getParameterByName('destination');
				    document.location.href = url;
				}
			},
			data: JSON.stringify(user)
		});
	}
});

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}