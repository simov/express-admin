
var Client = require('./client'),
    qb = require('../qb')();


function Database () {
    this.client = null;
}

/**
 * Connect to database with provided user name and password.
 *
 * @param {Object} connection options
 * @param {Function} callback
 * @return {Object} connection instance
 * @api public
 */

Database.prototype.connect = function (config, cb) {
    try {
        this.client = new Client(config);
    } catch (err) {
        return cb(err);
    }

    var options = config.mysql || config.pg || config.sqlite;
    this.client.connect(options, cb);
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
    if (!this.client.connection) return cb(new Error('Missing database connection!'));
    var sql = qb.partials.tables(schema);
    this.client.query(sql, function (err, rows) {
        if (err) return cb(err);
        if (rows.length) return cb(null, false);
        cb(null, true);
    });
}

exports = module.exports = new Database();
