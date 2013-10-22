
var moment = require('moment');
var query = require('../utils/query'),
	sql = require('../utils/sql'),
	template = require('../utils/template');


exports.query = function (args, data) {
	var view = args.view,
		table = view.table,
		columns = view.columns;

	var filters = filterParse(table.name, columns, data);

	var names = [],
		tables = [],
		joins = [];

	for (var i=0; i < columns.length; i++) {
		if (columns[i].manyToMany || !columns[i].filterview.show) continue;
		if (columns[i].oneToMany) {
			var ref = columns[i].oneToMany,
				cols = sql.fullNames(ref.table, ref.columns)
			names.push(sql.concat(sql.cast(cols), columns[i].verbose));
			if(tables.indexOf(ref.table) === -1){
				joins.push(sql.joins(table.name, columns[i].name, ref.table, ref.pk));
				tables.push(ref.table);
			}

		} else {
			names.push(sql.fullName(table.name, columns[i].name));
		}
	}
	names.unshift(sql.pk(table.name, table.pk));
	var order = '';
	if (!Object.keys(view.filterview.order).length) {
		view.filterview.order[table.pk] = 'asc';//modifies the object
	}
	order = sql.order(table.name, view.filterview.order).join();

	var from = args.page ? (args.page-1)*view.filterview.page : 0;

	var records_query = query.replace('filter-view',
		/*columns*/names.join(), table.name,
		joins.join(' '), sql.where(filters), order, from, view.filterview.page);
	var total_query = query.replace('filter-total',
		 table.name, joins.join(' '), sql.where(filters));
	return { 'records': records_query,
				'total': total_query };
}

exports.data = function (args, cb) {
	var columns = args.view.columns;
	var visible = [],
		names = [];
	for (var i=0; i < columns.length; i++) {
		if (columns[i].manyToMany || !columns[i].filterview.show) continue;
		visible.push(columns[i]);
		names.push(columns[i].verbose);
	}
	columns = visible;
	args.db.connection.query(args.query, function (err, rows) {
		if (err) return cb(err);
		var records = [];
		for (var i=0; i < rows.length; i++) {
			text_value = rows[i][columns[0].name];
			if (typeof text_value === 'undefined') text_value = rows[i][columns[0].verbose];
			var pk = {
				id: rows[i]['__pk'],
				text: text_value
			};
			var values = [];
			for (var j=1; j < columns.length; j++) {
				var value = rows[i][columns[j].verbose];
				if(typeof value === 'undefined') value = rows[i][columns[j].name];
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

function filterParse (table, cols, data) {
	var f = [];
	for(var i = 0; i < cols.length; i++){
		if( typeof data[cols[i].verbose] != 'undefined' 
			&& data[cols[i].verbose] != '')
		{
			if (cols[i].oneToMany){
				f.push(filterRow(cols[i].oneToMany.table,
								cols[i].oneToMany.columns[0],
								data[cols[i].verbose] ));
				continue;
			} else {
				f.push(filterRow(table, cols[i].name, data[cols[i].verbose]));
				continue;
			}
		} 
	}

	return f;
}

function filterRow (table, col, val) {
	return { 'table'  : table,
			 'column' : col,
			 'value'  : val };
}