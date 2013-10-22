
var query  = require('./query');


/**
 * Create new schema object.
 *
 * @param {Object} db
 * @api public
 */

function Schema (db) {
	if (!db) return new Error('Missing database connection!');
	this.db = db;
}

/**
 * Get all table names from the database.
 *
 * @param {Function} callback
 * @return {Array} tables
 * @api public
 */

Schema.prototype.getTables = function (cb) {
	var schema = this.db.connection.config.database,
		sql = query.replace('show-tables', schema);
	this.db.connection.query(sql, function (err, rows) {
		if (err) return cb(err);
		var tables = [];
		for (var i=0; i < rows.length; i++) {
			var name = rows[i][Object.keys(rows[i])[0]];
			tables.push(name);
		}
		cb(null, tables);
	});
}

/**
 * Get creation information for each column.
 *
 * @param {String} table
 * @param {Function} callback
 * @return {Object} columns
 * @api public
 */

Schema.prototype.getColumns = function (table, cb) {
	var schema = this.db.connection.config.database,
		sql = query.replace('show-columns', table, schema);
	this.db.connection.query(sql, function (err, columns) {
		if (err) return cb(err);
		cb(null, columnsInfo(columns));
	});
}

/**
 * Format columns data into user friendly object.
 *
 * @param {Object} data
 * @return {Object} columns
 * @api private
 */

function columnsInfo (data) {
	var columns = {};
	for (var key in data) {
		var column = data[key];
		columns[column.Field] = {
			type: column.Type,
			allowNull: column.Null === 'YES' ? true : false,
			key: column.Key.toLowerCase(),
			defaultValue: column.Default,
			extra: column.Extra
		};
	}
	return columns;
}

/**
 * Get creation information for each column in each table.
 *
 * @param {Function} callback
 * @return {Object} columns
 * @api public
 */

Schema.prototype.getAllColumns = function (cb) {
	var tables = null;
	this.getTables(function (err, result) {
		if (err) return cb(err);
		tables = result;
		loop(0);
	});
	var columns = {};
	var loop = function (index) {
		if (index == tables.length) return cb(null, columns);
		this.getColumns(tables[index], function (err, info) {
			if (err) return cb(err);
			columns[tables[index]] = info;
			loop(++index);
		});
	}.bind(this);
}

/**
 * Get reference information for each column in each table.
 *
 * @param {Function} callback
 * @return {Object} references
 * @api public
 */

Schema.prototype.getReferences = function (cb) {
	var schema = this.db.connection.config.database,
		sql = query.replace('foreign-keys', schema, schema);
	this.db.connection.query(sql, function (err, rows) {
		if (err) return cb(err);
		var ref = {};
		rows = rows[1];
		for (var i=0; i < rows.length; i++) {
			ref[rows[i].table] = [];
		}
		for (var i=0; i < rows.length; i++) {
			ref[rows[i].table].push({
				foreignKey: rows[i].foreignKey,
				referencedTable: rows[i].referencedTable,
				referencedColumn: rows[i].referencedColumn,
				onUpdate: rows[i].onUpdate,
				onDelete: rows[i].onDelete
			});
		}
		cb(null, ref);
	});
}

/**
 * Get indexes information for each column.
 *
 * @param {String} table
 * @param {Function} callback
 * @return {Object} indexes
 * @api public
 */

Schema.prototype.getIndexes = function (table, cb) {
	var schema = this.db.connection.config.database,
		sql = query.replace('show-indexes', table, schema);
	var indexes = {};
	this.db.connection.query(sql, function (err, rows) {
		if (err) return cb(err);
		for (var i=0; i < rows.length; i++) {
			indexes[rows[i].Key_name] = rows[i].Column_name;
		}
		cb(null, indexes);
	});
}

/**
 * Get indexes information for each column in each table.
 *
 * @param {Function} callback
 * @return {Object} indexes
 * @api public
 */

Schema.prototype.getAllIndexes = function (cb) {
	var tables = null;
	this.getTables(function (err, result) {
		if (err) return cb(err);
		tables = result;
		loop(0);
	});
	var indexes = {};
	var loop = function (index) {
		if (index == tables.length) return cb(null, indexes);
		this.getIndexes(tables[index], function (err, info) {
			indexes[tables[index]] = info;
			loop(++index);
		});
	}.bind(this);
}

/*
	var Schema = require('schema'),
		db = require('database');

	db.connect('user', 'pass', function () {
		db.use('database', function () {
			schema = new Schema(db);
		});
	})
 */

exports = module.exports = Schema;
