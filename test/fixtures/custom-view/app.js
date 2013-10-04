
var express = require('express');
var app = module.exports = express();
var path = require('path');

app.set('views', __dirname);

app.get('/view1', function (req, res, next) {
	
	var relative = path.relative(res.locals._admin.views, app.get('views'));
	
	res.locals.partials = {
		content: path.join(relative, 'view')
	};

	next();
});
