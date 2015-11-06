'use strict';

module.exports = function(app) {
	var home = require('../controllers/homeController');

	app.route('/').all(home.getPage);
};
