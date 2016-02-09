var propertiesReader = require('properties-reader');

module.exports = function(app){
	var properties = propertiesReader(__dirname + '/../properties/seeflight.'+process.env.ENV+'.properties');
	app.locals.localPort = properties.get('localPort');
	app.locals.distantHost = properties.get('distantHost');
	app.locals.distantProtocole = properties.get('distantProtocole');
	app.locals.distantPort = properties.get('distantPort');
	app.locals.seeflightApiPath = properties.get('seeflightApiPath');
};