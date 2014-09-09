
var qb = require('../qb')();


// get table records

exports.get = function (args, done) {
    if (args.post) {
        var table = args.config.table,
            rows = args.post[table.name].records || [];
        return done(null, rows);
    }

    var str = qb.tbl.select(args);
    args.db.client.query(str, function (err, rows) {
        if (err) return done(err);
        var result = [];
        for (var i=0; i < rows.length; i++) {
            result.push({columns: rows[i]});
        }
        done(null, result);
    });
}
