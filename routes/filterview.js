
var	filterview = require('../lib/core/filterview'),
	pagination = require('../lib/utils/pagination'),
	query = require('../lib/utils/query');


exports.get = function (req, res, next) {
	
	var settings = res.locals._admin.settings,
		slugs    = res.locals._admin.slugs,
		db       = res.locals._admin.db,
		string   = res.locals.string;

	var slug = req.params[0],
		page = req.query.p || 0,
		view = settings[slugs[slug]];

	var args = {db: db, view: view, page: page};
	var queries= filterview.query(args, req.body);
	args.query = queries.records;
	args.total = queries.total;

	filterview.data(args, function (err, data) {

		pagination(args, function (err, pager) {
			if (err) return next(err);

			res.locals.view = {
				name: view.table.verbose,
				slug: slug,
				error: res.locals.error
			};
			
			res.locals.post = [];
			for( var i in data.columns ){
				if( typeof req.body[data.columns[i]] != 'undefined' 
					&& req.body[data.columns[i]] != '')
				{
					res.locals.post.push({'key': data.columns[i],
					 'value' : req.body[data.columns[i]]});
				}
			}

			res.locals.breadcrumbs = {
				links: [
					{url: '/', text: string.home},
					{active: true, text: view.table.verbose}
				]
			};

			res.locals.columns = data.columns;
			res.locals.records = data.records;
			res.locals.pagination = pager;

			res.locals.partials = {
				content:    'filterview',
				pagination: 'pagination'
			};
			
			next();
		});
	});
};

exports.post = function (req, res, next) {
	
	get(req, res, next);
};
