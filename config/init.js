'use strict';

/**
 * Module dependencies.
 */
var express = require('express');
var favicon = require('serve-favicon'); 
var bodyParser = require('body-parser');
var multer = require('multer'); 
var cookieParser = require('cookie-parser');
var fs = require('fs');
var https = require('https');
var	helmet = require('helmet'); 
var ejs = require('ejs');
var	path = require('path');
var _ = require('lodash');
var glob = require('glob');

module.exports = function() {
	// Initialize express app

	if(process.env.ENV === 'dev' || process.env.ENV === 'prod'){
		console.log('Working in '+process.env.ENV+' environment');
	}else{
		process.env.ENV = 'dev';
		console.log('ENV variable not specified, working in dev environment');
	}

	var app = express();
	app.use(bodyParser.json());

	app.set('views', __dirname + '/../app');
	app.engine('html', ejs.renderFile);
	app.engine('js', ejs.renderFile);
	app.set('view engine', 'ejs');

	// Showing stack errors
	app.set('showStackError', true);

	// Use helmet to secure Express headers
	app.use(helmet.xframe());
	app.use(helmet.xssFilter());
	app.use(helmet.nosniff());
	app.use(helmet.ienoopen());
	app.disable('x-powered-by');

	// Globbing routing files
	getGlobbedFiles('./routes/**/*.js').forEach(function(routePath) {
		require(path.resolve(routePath))(app);
	});

	app
	.use('/js', express.static(__dirname + '/../app/js')) 
	.use('/bower_components', express.static(__dirname + '/../app/bower_components')) 
	.use('/fonts', express.static(__dirname + '/../app/fonts'))
	.use('/images', express.static(__dirname + '/../app/images'));
	
	// Return Express server instance
	return app;
};

function getGlobbedFiles(globPatterns, removeRoot) {
	// For context switching
	var _this = this;

	// URL paths regex
	var urlRegex = new RegExp('^(?:[a-z]+:)?\/\/', 'i');

	// The output array
	var output = [];

	// If glob pattern is array so we use each pattern in a recursive way, otherwise we use glob 
	if (_.isArray(globPatterns)) {
		globPatterns.forEach(function(globPattern) {
			output = _.union(output, _this.getGlobbedFiles(globPattern, removeRoot));
		});
	} else if (_.isString(globPatterns)) {
		if (urlRegex.test(globPatterns)) {
			output.push(globPatterns);
		} else {
			var files = glob(globPatterns, {
				sync: true
			});
			if (removeRoot) {
				files = files.map(function(file) {
					return file.replace(removeRoot, '');
				});
			}

			output = _.union(output, files);
		}
	}

	return output;
}