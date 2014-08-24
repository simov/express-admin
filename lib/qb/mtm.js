
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

    var columns = x.names(parentPk.concat(childPk));

    var values = (function values (parentValues, childValues) {
        parentValues = parentValues.toString().split(',');

        var result = [];
        for (var i=0; i < childValues.length; i++) {
            result.push(parentValues.concat(childValues[i].toString().split(',')));
        }
        return result;
    }(record.pk, ids));

    var table = x.name(link.table,z.schema(link));

    var str = [x.insert(table,columns,values), ';'].join(' ');

    return str;
}

exports.remove = function (ids, link, record) {
    var str = query.replace('delete-many', sql.table(link),
        sql.andValues('', link.parentPk, record.pk),
        sql.in('', link.childPk, ids));

    return str;
}
