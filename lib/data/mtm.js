
var async = require('async');
var qb = require('../qb')();


// modifies `rows.columns` with manyToMany columns on select
// modifies `rows` with ids on post

// return an array of all child ids linked to this record's pk
function getIds (args, column, pk, done) {
    var str = qb.mtm.select(args, column, pk);
    args.db.client.query(str, function (err, rows) {
        if (err) return done(err);
        var result = [];
        for (var i=0; i < rows.length; i++) {
            result.push(rows[i][Object.keys(rows[i])[0]]);
        }
        done(err, result);
    });
}

function loopColumns (args, row, done) {
    row.ids = {};
    async.each(args.config.columns, function (column, done) {
        if (!column.manyToMany) return done();
        
        // after select this column practically doesn't exists
        if (row.columns[column.name] === undefined)
            row.columns[column.name] = [];

        var pk = row.pk || row.columns['__pk'];
        if (!pk) return done();
        
        getIds(args, column, pk, function (err, ids) {
            if (err) return done(err);
            args.post
                // save the ids from the database
                ? row.ids[column.name] = ids
                // selecting
                : row.columns[column.name] = ids;

            done();
        });
    }, done);
}

// loopRecords
exports.get = function (args, rows, done) {
    async.each(rows, function (row, done) {
        loopColumns(args, row, done);
    }, done);
}
