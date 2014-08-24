
var sql = require('../sql/sql');
var xsql = require('xsql');
var x = new xsql({dialect:
    (sql.client.mysql&&'mysql')||
    (sql.client.pg&&'pg')||
    (sql.client.sqlite&&'sqlite')
});
var z = require('./partials');


exports.select = function (args, ref) {
    var select = (function select (cols, table) {
        var columns = z.cast(cols, table);

        var concat = z.concat(columns);

        return concat;
    }(ref.columns, ref.table));

    var pk = sql.as(ref, ref.pk, '__pk'),
        text = x.as(select,x.name('__text'));

    var str = [x.select([pk,text].join()), x.from(sql.table(ref)), ';'].join(' ');
    args.log && console.log('otm'.cyan, str);

    return str;
}