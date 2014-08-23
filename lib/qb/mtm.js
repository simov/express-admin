
var sql = require('../sql/sql'),
    query = require('../sql/query');
var xsql = require('xsql');
var x = new xsql({dialect:
    (sql.client.mysql&&'mysql')||
    (sql.client.pg&&'pg')||
    (sql.client.sqlite&&'sqlite')
});
var z = require('./partials');


exports.select = function (args, column, pk) {
    var link = column.manyToMany.link;

    var str = [
        x.select(sql.concat(link, link.childPk)),
        x.from(sql.table(link)),
        x.where(sql.andValues(link, link.parentPk, pk)),
        ';'].join(' ');

    args.log && console.log('mtm'.cyan, str);
    return str;
}

exports.insert = function (ids, link, record) {
    var parentPk = link.parentPk instanceof Array ? link.parentPk : [link.parentPk],
        childPk = link.childPk instanceof Array ? link.childPk : [link.childPk];

    var str = query.replace('insert-many', sql.table(link),
        sql.list('', parentPk.concat(childPk)),
        sql.values(record.pk, ids));

    return str;
}

exports.remove = function (ids, link, record) {
    var str = query.replace('delete-many', sql.table(link),
        sql.andValues('', link.parentPk, record.pk),
        sql.in('', link.childPk, ids));

    return str;
}
