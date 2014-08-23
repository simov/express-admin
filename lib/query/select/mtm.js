
var sql = require('../../sql/sql');
var xsql = require('xsql');
var x = new xsql({dialect:
    (sql.client.mysql&&'mysql')||
    (sql.client.pg&&'pg')||
    (sql.client.sqlite&&'sqlite')
});
var z = require('./partials');


exports.query = function (args, column, pk) {
    var link = column.manyToMany.link;

    var str = [
        x.select(sql.concat(link, link.childPk)),
        x.from(sql.table(link)),
        x.where(sql.andValues(link, link.parentPk, pk)),
        ';'].join(' ');

    args.log && console.log('mtm'.cyan, str);
    return str;
}
