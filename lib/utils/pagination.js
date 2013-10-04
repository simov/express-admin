
var pagination = require('sr-pagination');
var query = require('./query');


exports = module.exports = function (args, cb) {
	var str = query.replace('total', args.view.table.name);
	args.db.connection.query(str, function (err, rows) {
		if (err) return cb(err);
		var total = parseInt(rows[0].count),
			rows = args.view.listview.page,
			page = parseInt(args.page || 1);
		cb(null, pagination({page: page, links: 9, rows: rows, total: total}));
	});
}
