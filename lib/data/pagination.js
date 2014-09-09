
var pagination = require('sr-pagination');
var qb = require('../qb')();


exports.get = function (args, done) {
    var str = qb.lst.pagination(args);
    args.db.client.query(str, function (err, rows) {
        if (err) return done(err);
        var total = parseInt(rows[0].count),
            rows = args.config.listview.page,
            page = parseInt(args.page || 1);
        done(null, pagination({page: page, links: 9, rows: rows, total: total}));
    });
}
