'use strict';
/**
 * Module dependencies.
 */
var app = require('./config/init')();
var properties = require('./services/propertiesLoader.js')(app);

// Start the app by listening on <port>
app.listen(app.locals.localPort);