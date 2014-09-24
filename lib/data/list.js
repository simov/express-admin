
var qb = require('../qb')(),
    format = require('../format');


exports.get = function (args, done) {
    var columns = args.config.columns;

    var visible = [],
        names = [];
    for (var i=0; i < columns.length; i++) {
        if (!columns[i].listview.show) continue;
        visible.push(columns[i]);
        names.push(columns[i].verbose);
    }
    columns = visible;
    
    qb.lst.create(args);

    args.db.client.query(args.query, function (err, rows) {
        if (err) return done(err);
        var idx = args.config.table.view ? 0 : 1;

        var records = [];
        for (var i=0; i < rows.length; i++) {
            var pk = idx ? {
                id: rows[i]['__pk'],
                text: rows[i][columns[0].name]
            } : null;
            var values = [];
            for (var j=idx; j < columns.length; j++) {
                var value = rows[i][columns[j].name];
                value = format.list.value(columns[j], value);
                if (columns[j].manyToMany && value) value = {mtm: value.split(',')}
                values.push(value);
            }
            records.push({pk: pk, values: values});
        }
        done(null, {columns: names, records: records});
    });
}
