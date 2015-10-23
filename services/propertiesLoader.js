var propertiesReader = require('properties-reader');

module.exports = function(app){
	var properties = propertiesReader(__dirname + '/../properties/seeflight.'+process.env.ENV+'.properties');
	app.locals.localPort = properties.get('localPort');
	app.locals.seeflightApiPath = properties.get('seeflightApiPath');
};