
var query = require('../utils/query'),
	sql = require('../utils/sql'),
	template = require('../utils/template');
var dcopy = require('deep-copy');


// modifies `args.config.columns` with `value`
function getOneToMany (args, cb) {
	var columns = args.config.columns;
	(function loop (i) {
		if (i == columns.length) return cb();
		if ((!columns[i].oneToMany || !columns[i].manyToMany) && !columns[i].control.select)
			return loop(++i);
		var ref = columns[i].oneToMany ? columns[i].oneToMany : columns[i].manyToMany.ref;
		getRef(args, ref, function (err, rows) {
			if (err) return cb(err);
			columns[i].value = rows;
			loop(++i);
		});
	}(0));
}
function getRef (args, ref, cb) {
	var columns = sql.fullNames(ref.table, ref.columns);
	var pk = sql.pk(ref.table, ref.pk),
		text = sql.concat(sql.cast(columns), '__text');
	var str = query.replace('get-records', [pk,text].join(), ref.table);

	args.db.connection.query(str, function (err, rows) {
		if (err) return cb(err);
		cb(null, rows);
	});
}

function getSql (args) {
	var table = args.config.table,
		columns = args.config.columns;

	var names = [];
	for (var i=0; i < columns.length; i++) {
		if (!columns[i].manyToMany) names.push(columns[i].name);
	}

	names = sql.fullNames(table.name, names);
	names.unshift(sql.pk(table.name, table.pk));

	return query.replace('get-record',
		names.join(), table.name, (args.fk? args.fk:table.pk), args.id);
}

function getRecords (args, cb) {
	if (args.post) {
		var table = args.config.table,
			rows = args.post[table.name].records || [];
		return cb(null, rows);
	}

	var str = getSql(args);
	args.db.connection.query(str, function (err, rows) {
		if (err) return cb(err);
		var result = [];
		for (var i=0; i < rows.length; i++) {
			result.push({columns: rows[i]});
		}
		cb(null, result);
	});
}

// modifies `rows.columns` with manyToMany columns
// or modifies `rows` with ids
function getIds (args, rows, cb) {
	var columns = args.config.columns;
	(function loopRecords (i) {
		if (i == rows.length) return cb();
		rows[i].ids = {};
		(function loopColumns (j) {
			if (j == columns.length) return loopRecords(++i);
			if (!columns[j].manyToMany) return loopColumns(++j);

			var pk = rows[i].pk || rows[i].columns['__pk'];
			if (!pk) return loopColumns(++j);

			var link = columns[j].manyToMany.link;
			var str = query.replace('get-record',
				sql.fullName(link.table, link.childPk), link.table, link.parentPk, pk);
			args.db.connection.query(str, function (err, _rows) {
				if (err) return cb(err);
				var result = [];
				for (var k=0; k < _rows.length; k++) {
					result.push(_rows[k][link.childPk]);
				}

				if (args.post) { // save the ids from the database
					rows[i].ids[columns[j].name] = result;
					if (rows[i].columns[columns[j].name] === undefined)
						rows[i].columns[columns[j].name] = [];
				} else { // selecting
					rows[i].columns[columns[j].name] = result;
				}

				loopColumns(++j);
			});
		}(0));
	}(0));
}

function getData (args, cb) {
	args.config.columns = removeHidden(args.config.columns);

	getOneToMany(args, function (err) {
		if (err) return cb(err);
		getRecords(args, function (err, rows) {
			if (err) return cb(err);
			getIds(args, rows, function (err) {
				if (err) return cb(err);
				cb(null, getParams(args, rows));
			});
		});
	});
}





// `args.config.columns` is extended with `oneToMany` data
// `rows` comes either from sql select of from post request
function getParams (args, rows) {
	var table = args.config.table,
		_columns = args.config.columns;

	var names = [],
		blank = [];
	for (var i=0; i < _columns.length; i++) {
		names.push(_columns[i].name);
		blank.push(dcopy(_columns[i]));
	}
	for (var i=0; i < names.length; i++) {
		if (args.type === 'view') {
			blank[i].key = args.type+'['+table.name+'][records][0][columns]['+names[i]+']';
		} else {
			blank[i].key = args.type+'['+table.name+'][blank][index][columns]['+names[i]+']';
		}
	}
	var _insert = {
		key: args.type+'['+table.name+'][blank][index][insert]',
		value: true
	};

	var records = [];
	for (var i=0; i < rows.length; i++) {
		
		// var values = rows[i].columns || rows[i],
		var values = rows[i].columns,
			record = args.type+'['+table.name+'][records]['+i+']';

		var pk = {
			key: record+'[pk]',
			value: rows[i].pk || values['__pk']
		};
		
		var insert = rows[i].insert
			? {
				key: record+'[insert]',
				value: true
			} : null;

		var remove = {
			key: record+'[remove]',
			value: rows[i].remove ? true : null
		};

		var columns = dcopy(_columns);
		for (var j=0; j < columns.length; j++) {
			
			var column = columns[j];
			column.key = record+'[columns]['+column.name+']';
			
			var value = values[column.name];
			column.error = template.validate(column, value);
			column.value = template.value(column, value);
			args.error = column.error ? true : args.error;
		}
		records.push({pk: pk, columns: columns, insert: insert, remove: remove});
	}
	return {name: table.name, verbose: table.verbose, 
			records: records, blank: blank, insert: _insert};
}

exports.getTypes = function (args, cb) {
	var types = ['view', 'oneToOne', 'manyToOne'],
		config = args.config,
		result = {};
	(function loop (i) {
		if (i == types.length) return cb(null, result);
		var type = types[i];

		args.type = type;

		args.tables = {};
		(type == 'view')
			? args.tables[args.name] = null
			: args.tables = config.editview[type] || {};

		args.post = args.data ? args.data[type] : null;

		getTables(args, function (err, tables) {
			if (err) return cb(err);
			result[type] = {tables: tables};
			loop(++i);
		});
	}(0));
}

function getTables (args, cb) {
	var tables = [],
		keys = Object.keys(args.tables);
	(function loop (index) {
		if (index == keys.length) return cb(null, tables);
		var name = keys[index];
		
		args.config = dcopy(args.settings[name]);
		args.fk = args.tables[name];

		getData(args, function (err, table) {
			if (err) return cb(err);
			tables.push(table);
			loop(++index);
		});
	}(0));
}

function removeHidden (columns) {
	var result = [];
	for (var i=0; i < columns.length; i++) {
		if (!columns[i].editview.show) continue;
		result.push(columns[i]);
	}
	return result;
}

exports.test = {
	removeHidden: removeHidden,

	getOneToMany: getOneToMany,
	getRef: getRef,
	getSql: getSql,
	getRecords: getRecords,
	getIds: getIds,
	getParams: getParams
};
