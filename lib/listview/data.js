
var qb = require('../qb'),
    format = require('./format');


exports = module.exports = function (args, cb) {
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
        if (err) return cb(err);
        var records = [];
        for (var i=0; i < rows.length; i++) {
            var pk = {
                id: rows[i]['__pk'],
                text: rows[i][columns[0].name]
            };
            var values = [];
            for (var j=1; j < columns.length; j++) {
                var value = rows[i][columns[j].name];
                value = format.value(columns[j], value);
                if (columns[j].manyToMany && value) value = {mtm: value.split(',')}
                values.push(value);
            }
            records.push({pk: pk, values: values});
        }
        cb(null, {columns: names, records: records});
    });
}
