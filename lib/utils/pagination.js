
var pagination = require('sr-pagination');
var query = require('./query'),
    sql = require('./sql');


exports.get = function (args, cb) {
    var s = args.statements,
        pk = sql.fullName(args.config.table.name, args.config.table.pk);

    var str = query.replace('total', pk, s.table, s.join, s.where);
    args.db.client.query(str, function (err, rows) {
        if (err) return cb(err);
        var total = parseInt(rows[0].count),
            rows = args.config.listview.page,
            page = parseInt(args.page || 1);
        cb(null, pagination({page: page, links: 9, rows: rows, total: total}));
    });
}
