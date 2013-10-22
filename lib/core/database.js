
var sql = require('../utils/sql'),
	query = require('../utils/query');


exports.update = function (args, cb) {
	switch (args.action) {
		case 'insert':
		case 'update':
			var types = ['view', 'oneToOne', 'manyToOne'];
			break;
		case 'remove':
			var types = ['oneToOne', 'manyToOne', 'view'];
			break;
	}
	args.queries = [];

	(function loopTypes (k) {
		if (k == types.length) return cb();
		
		args.type = types[k];
		args.tables = args.data[types[k]];
		if (!args.tables) return loopTypes(++k);
		var keys = Object.keys(args.tables);

		(function loopTables (i) {
			if (i == keys.length) return loopTypes(++k);
			
			var records = args.tables[keys[i]].records;
			if (!records) return loopTables(++i);

			(function loopRecords (j) {
				if (j == records.length) return loopTables(++i);

				var record = records[j],
					settings = args.settings[keys[i]];
				updateRecord(args, settings, record, function (err) {
					if (err) return cb(err);
					loopRecords(++j);
				});
			}(0));
		}(0));
	}(0));
}

// settings - current table settings, record - current record data
function updateRecord (args, settings, record, cb) {
	if (args.type !== 'view') {
		var fk = args.settings[args.name].editview[args.type][settings.table.name];
		record.columns[fk] = args.id;
	}

	if (record.insert) {
		var data = kvp(record.columns, settings.columns),
			str = query.replace('insert',
				settings.table.name, data.keys.join(), data.values.join());
		
		var action = 'insert';

	} else if (record.remove || args.action == 'remove') {
		var pk = settings.table.pk;
			str = query.replace('delete', settings.table.name, pk, record.pk);

		var action = 'remove';

	} else { // update
		var pk = settings.table.pk,
			data = kvp(record.columns, settings.columns),
			str = query.replace('update',
				settings.table.name, data.pairs.join(), pk, record.pk);

		var action = 'update';
	}

	execute(action, args, str, record, settings, cb);
}

function execute (action, args, str, record, settings, cb) {
	if (args.debug) {
		// insert or update
		if (action != 'remove') {
			args.queries.push(str);
			if (action == 'insert') {
				record.pk = '[PK]';
				if (args.type == 'view' && args.action == 'insert')
					args.id = '[FK]';
			}
			var queries = manyToMany(action, args, record, settings.columns);
			args.queries = args.queries.concat(queries);
		}
		// remove
		else {
			var queries = manyToMany(action, args, record, settings.columns);
			args.queries = args.queries.concat(queries);
			args.queries.push(str);
		}
		return cb();
	}

	// insert or update
	if (action != 'remove') {
		args.db.connection.query(str, function (err, result) {
			if (err) return cb(err);

			if (action == 'insert') {
				record.pk = result.insertId;
				if (args.type == 'view' && args.action == 'insert')
					args.id = result.insertId;
			}

			var queries = manyToMany(action, args, record, settings.columns);
			spin(args, queries, function (err) {
				if (err) return cb(err);
				cb();
			});
		});
	}
	// remove
	else {
		var queries = manyToMany(action, args, record, settings.columns);
		spin(args, queries, function (err) {
			if (err) return cb(err);
			args.db.connection.query(str, function (err, result) {
				if (err) return cb(err);
				cb();
			});
		});
	}
}

function spin (args, queries, cb) {
	(function loop (i) {
		if (i == queries.length) return cb();
		args.db.connection.query(queries[i], function (err) {
			if (err) return cb(err);
			loop(++i);
		});
	}(0));
}

// sql string helpers

function kvp (data, columns) {
	var keys = [], values = [], pairs = [];

	for (var i=0; i < columns.length; i++) {
		if (columns[i].manyToMany) continue;

		var name = columns[i].name;
		if (!data.hasOwnProperty(name)) continue;

		keys.push(name);
		var value = escape(data[name], columns[i].type);

		values.push(value);
		pairs.push(name+'='+value);
	}
	return {keys: keys, values: values, pairs: pairs};
}

function escape (value, type) {
	return type.match(
		new RegExp('char|varchar|tinytext|text|mediumtext|longtext|'+
				   'date|time|timestamp|datetime|year', 'i'))
		? "\'"+value+"\'"
		: value;
}

// many-to-many helpers

function manyToMany (action, args, record, columns) {
	var queries = [];

	for (var i=0; i < columns.length; i++) {
		if (!columns[i].manyToMany) continue;

		var link = columns[i].manyToMany.link,
			dbIds = record.ids[columns[i].name] || [],
			postIds = record.columns[columns[i].name] || [];
		postIds = (postIds instanceof Array) ? postIds : [postIds];

		var ins, del;
		switch (action) {
			case 'insert':
				ins = manyInsert(postIds, link, record);
				break;
			case 'remove':
				del = manyDelete(dbIds, link, record);
				break;
			case 'update':
				var delIds = difference(dbIds, postIds),
					insIds = difference(postIds, dbIds);
				del = manyDelete(delIds, link, record);
				ins = manyInsert(insIds, link, record);
				break;		
		}
		ins ? queries.push(ins) : null;
		del ? queries.push(del) : null;
	}
	return queries;
}

function manyInsert (ids, link, record) {
	if (!ids.length) return null;

	var values = [];
	for (var i=0; i < ids.length; i++) {
		values.push('('+record.pk+','+ids[i]+')');
	}

	var str = query.replace('insert-many',
		link.table, [link.parentPk, link.childPk].join(), values.join());

	return str;
}

function manyDelete (ids, link, record) {
	if (!ids.length) return null;

	var str = query.replace('delete-many',
		link.table, link.parentPk, record.pk, link.childPk, ids.join());

	return str;
}

function difference (source, target) {
	return source.filter(function (i) {
		return !(target.indexOf(i) > -1);
	});
}
