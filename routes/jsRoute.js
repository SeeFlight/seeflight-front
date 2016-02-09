'use strict';

module.exports = function(app) {
	app.route('/vendor/js/seeflight/:file').get(function(req,res){
		var file = req.params.file;
		res.set('Content-Type', 'application/javascript');
		res.render("../vendor/js/seeflight/"+file);
	});
};
