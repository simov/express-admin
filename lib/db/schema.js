
var async = require('async');
var qb = require('../qb')();


// get all table or view names for this schema
exports.getTables = function (client, type, done) {
    var sql = qb.partials[type](client.config.schema);
    client.query(sql, function (err, rows) {
        if (err) return done(err);
        done(null, rows.map(function (row) {
            return row[Object.keys(row)[0]];
        }));
    });
}

// get creation information for each column
exports.getColumns = function (client, table, done) {
    var sql = qb.partials.columns(table, client.config.schema);
    client.query(sql, function (err, columns) {
        if (err) return done(err);
        done(null, client.getColumnsInfo(columns));
    });
}

// get creation information for each column in each table and view
exports.getData = function (client, done) {
    var result = {};
    async.each(['tables', 'views'], function (type, done) {
        exports.getTables(client, type, function (err, tables) {
            if (err) return done(err);
            async.each(tables, function (table, done) {
                exports.getColumns(client, table, function (err, info) {
                    if (err) return done(err);
                    result[table] = info;
                    if (type == 'views') result[table].__view = true;
                    done();
                });
            }, done);
        });
    }, function (err) {
        done(err, result);
    });
}
