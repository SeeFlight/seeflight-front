'use strict';

module.exports = function(app) {
	var beta = require('../controllers/betaController');

	app.route('/join-beta').all(beta.getPage);
};
