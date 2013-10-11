
var moment = require('moment');
var query = require('../utils/query'),
	sql = require('../utils/sql'),
	template = require('../utils/template');


exports.query = function (args) {
	var view = args.view,
		table = view.table,
		columns = view.columns;

	var names = [],
		joins = [];
	for (var i=0; i < columns.length; i++) {
		if (columns[i].manyToMany || !columns[i].listview.show) continue;
		if (columns[i].oneToMany) {
			var ref = columns[i].oneToMany,
				cols = sql.fullNames(ref.table, ref.columns)
			names.push(sql.concat(sql.cast(cols), columns[i].name));
			joins.push(sql.joins(table.name, columns[i].name, ref.table, ref.pk));
		} else {
			names.push(sql.fullName(table.name, columns[i].name));
		}
	}
	names.unshift(sql.pk(table.name, table.pk));

	var order = '';
	if (!Object.keys(view.listview.order).length) {
		view.listview.order[table.pk] = 'asc';//modifies the object
	}
	order = sql.order(table.name, view.listview.order).join();

	var from = args.page ? (args.page-1)*view.listview.page : 0;

	return query.replace('list-view',
		/*columns*/names.join(), table.name,
		joins.join(' '), order, from, view.listview.page);
}

exports.data = function (args, cb) {
	var columns = args.view.columns;

	var visible = [],
		names = [];
	for (var i=0; i < columns.length; i++) {
		if (columns[i].manyToMany || !columns[i].listview.show) continue;
		visible.push(columns[i]);
		names.push(columns[i].verbose);
	}
	columns = visible;
	
	args.db.connection.query(args.query, function (err, rows) {
		if (err) return cb(err);
		var records = [];
		for (var i=0; i < rows.length; i++) {
			var pk = {
				id: rows[i]['__pk'],
				text: rows[i][columns[0].name]
			};
			var values = [];
			for (var j=1; j < columns.length; j++) {
				var value = rows[i][columns[j].name];
				value = format(columns[j].type, value);
				values.push(value);
			}
			records.push({pk: pk, values: values});
		}
		cb(null, {columns: names, records: records});
	});
}

function format (type, value) {
	if (/^date/i.test(type)) {
		return value ? moment(value).format('ddd MMM DD YYYY') : '';

	} else if (/^decimal/i.test(type)) {
		
	}
	return value
}
