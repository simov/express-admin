
var async = require('async');
var qb = require('../qb')();


// modifies `args.config.columns` with `value`

function getData (args, ref, done) {
    var str = qb.otm.select(args, ref);
    args.db.client.query(str, function (err, rows) {
        if (err) return done(err);
        done(null, rows);
    });
}

exports.get = function (args, done) {
    async.each(args.config.columns, function (column, done) {
        if ((!column.oneToMany && !column.manyToMany) || !column.control.select)
            return done();
        var ref = column.oneToMany ? column.oneToMany : column.manyToMany.ref;
        getData(args, ref, function (err, rows) {
            if (err) return done(err);
            column.value = rows;
            done();
        });
    }, done);
}

exports._getData = getData;
