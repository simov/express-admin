
var query = require('../sql/query'),
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
    
    var s = args.statements;
    args.query = query.replace('list-view',
        s.columns, s.table, s.join, s.where, s.group, s.order, s.from, s.to);
    args.log && console.log('list'.cyan, args.query);

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
                if (columns[j].manyToMany) value = {mtm: value ? value.split(',') : ''}
                values.push(value);
            }
            records.push({pk: pk, values: values});
        }
        cb(null, {columns: names, records: records});
    });
}
