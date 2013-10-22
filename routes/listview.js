
var	listview = require('../lib/core/listview'),
	pagination = require('../lib/utils/pagination');


exports.get = function (req, res, next) {
	
	var settings = res.locals._admin.settings,
		slugs    = res.locals._admin.slugs,
		db       = res.locals._admin.db,
		string   = res.locals.string;

	var slug = req.params[0],
		page = req.query.p || 0,
		view = settings[slugs[slug]];

	var args = {db: db, view: view, page: page};
	args.query = listview.query(args);

	listview.data(args, function (err, data) {

		pagination(args, function (err, pager) {
			if (err) return next(err);

			res.locals.view = {
				name: view.table.verbose,
				slug: slug,
				error: res.locals.error
			};
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
				content:    'listview',
				pagination: 'pagination'
			};
			
			next();
		});
	});
};
