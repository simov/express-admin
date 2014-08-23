
var sql = require('../../sql/sql');
var xsql = require('xsql');
var x = new xsql({dialect:
    (sql.client.mysql&&'mysql')||
    (sql.client.pg&&'pg')||
    (sql.client.sqlite&&'sqlite')
});
var z = require('./partials');


exports.query = function (args) {
    var table = args.config.table,
        columns = args.config.columns;

    var names = [];
    for (var i=0; i < columns.length; i++) {
        if (columns[i].oneToMany && columns[i].fk) {
            names.push(sql.as(table, columns[i].fk, columns[i].name));
        }
        else if (!(columns[i].oneToMany && columns[i].fk) && !columns[i].manyToMany)
            names.push(sql.fullName(table, columns[i].name));
    }
    names.unshift(sql.as(table, table.pk, '__pk'));

    var str = [
        x.select(names.join()),
        x.from(sql.table(table)),
        x.where(sql.andValues(table, (args.fk? args.fk:table.pk), args.id)),
        ';'].join(' ');

    args.log && console.log('tbl'.cyan, str);
    return str;
}
