
var query  = require('../sql/query');


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
    var schema = this.db.client.config.schema,
        sql = query.replace('show-tables', schema);
    this.db.client.query(sql, function (err, rows) {
        if (err) return cb(err);
        var tables = [];
        for (var i=0; i < rows.length; i++) {
            var name = query.client.sqlite ? rows[i].name
                : rows[i][Object.keys(rows[i])[0]];
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
    var schema = this.db.client.config.schema,
        sql = query.replace('show-columns', table, schema);
    this.db.client.query(sql, function (err, columns) {
        if (err) return cb(err);
        cb(null, this.db.client.getColumnsInfo(columns));
    }.bind(this));
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

exports = module.exports = Schema;
