'use strict';

module.exports = function(app) {
	var search = require('../controllers/searchController');

	app.route('/').all(search.getPage);
};
