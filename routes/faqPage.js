'use strict';

module.exports = function(app) {
	var faq = require('../controllers/faqController');

	app.route('/faq').all(faq.getPage);
};
