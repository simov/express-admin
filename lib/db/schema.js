
var async = require('async');
var qb = require('../qb')();


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
        sql = qb.partials.tables(schema);
    this.db.client.query(sql, function (err, rows) {
        if (err) return cb(err);
        var tables = [];
        for (var i=0; i < rows.length; i++) {
            var name = this.db.client.sqlite
                ? rows[i].name
                : rows[i][Object.keys(rows[i])[0]];
            tables.push(name);
        }
        cb(null, tables);
    }.bind(this));
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
        sql = qb.partials.columns(table, schema);
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

Schema.prototype.getAllColumns = function (done) {
    var $this = this;
    this.getTables(function (err, tables) {
        if (err) return done(err);
        var columns = {};
        async.each(tables, function (table, done) {
            $this.getColumns(table, function (err, info) {
                if (err) return done(err);
                columns[table] = info;
                done();
            });
        }, function (err) {
            done(err, columns);
        });
    });
}

exports = module.exports = Schema;
