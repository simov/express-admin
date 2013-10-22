
var mysql = require('mysql'),
	query = require('./query');


function Database () {
	this.connection = null;
}

/**
 * Connect to database with provided user name and password.
 *
 * @param {Object} mysql connection options
 * @param {Function} callback
 * @return {Object} connection instance
 * @api public
 */

Database.prototype.connect = function (options, cb) {
	options.typeCast = false;
	options.multipleStatements = true;
	this.connection = mysql.createConnection(options);
	this.connection.connect(function (err) {
		// if (err) return cb(new DbError(err));
		if (err) return cb(err);
		cb(null);
	});
}

/**
 * Check if the connected user has permissions
 * for the specified schema.
 *
 * @param {String} schema name
 * @param {Function} callback
 * @return {Boolean} whether the user has permissions or not
 * @api public
 */

Database.prototype.grants = function (schema, cb) {
	if (!this.connection) return cb(new DbError('connection'));
	var c = this.connection,
		sql = query.replace('show-grants', c.config.user);
	c.query(sql, function (err, rows) {
		if (err) return cb(err);
		for (var i=0; i < rows.length; i++) {
			var data = rows[i]['Grants for '+c.config.user+'@localhost'],
				regex = new RegExp('.*`'+schema+'`\\.*.*');
			if (regex.test(data)) {
				return cb(null, true);
			}
		}
		return cb(null, false);
	});
}

/**
 * Check if the specified schema exists.
 *
 * @param {String} schema name
 * @param {Function} callback
 * @return {Boolean} whether the schema exists or not
 * @api public
 */

Database.prototype.exists = function (schema, cb) {
	if (!this.connection) return cb(new DbError('connection'));
	var c = this.connection,
		sql = query.replace('show-schemas', schema);
	c.query(sql, function (err, rows) {
		if (err) return cb(err);
		if (rows.length) return cb(null, true);
		cb(null, false);
	});
}

/**
 * Check if the specified schema is empty.
 *
 * @param {String} schema name
 * @param {Function} callback
 * @return {Boolean} whether the schema is empty or not
 * @api public
 */

Database.prototype.empty = function (schema, cb) {
	if (!this.connection) return cb(new DbError('connection'));
	var c = this.connection,
		sql = query.replace('show-tables', schema);
	c.query(sql, function (err, rows) {
		if (err) return cb(err);
		if (rows.length) return cb(null, false);
		cb(null, true);
	});
}

/**
 * Set schema to be used for now on.
 *
 * @param {String} schema name
 * @param {Function} callback
 * @api public
 */

Database.prototype.use = function (schema, cb) {
	if (!this.connection) return cb(new DbError('connection'));
	var c = this.connection,
		sql = query.replace('use', schema);
	c.query(sql, function (err, rows) {
		if (err) return cb(new DbError(err));
		c.config.database = schema;
		cb();
	});
}

exports = module.exports = new Database();


function DbError (err) {
	if (err instanceof Error) {
		switch (err.code) {
			case 'ER_ACCESS_DENIED_ERROR':
				this.message = 'Non existing database or user! '+
								'Misspelled username or password!';
				break;
			case 'ER_DBACCESS_DENIED_ERROR':
				this.message = err.message.replace('ER_DBACCESS_DENIED_ERROR: ', '');
				break;
			default: return err; // throw raw mysql error
		}
	} else if ('string' === typeof err) {
		this.name = 'DatabaseError';
		switch (err) {
			case 'connection': this.message = 'Missing database connection!';
				break;
			default: this.message = 'Database error!'; break;
		}
	}
}
DbError.prototype = new Error();
DbError.prototype.constructor = DbError;
