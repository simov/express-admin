
exports.get = function (req, res, next) {
	
	res.locals.partials = {
		content: 'login'
	};

	next();
}
