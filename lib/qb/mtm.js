
var x = require('../').x,
    z = require('./partials');


exports.select = function (args, column, pk) {
    var link = column.manyToMany.link;

    var select = (function select (cols, table) {

        var concat = z.concat(cols, table.table, z.schema(table),',');

        return concat;
    }(link.childPk, link));

    var str = [
        x.select(select),
        x.from(x.name(link.table,z.schema(link))),
        x.where(z.eq(link, link.parentPk, pk)),
        ';'].join(' ');

    args.log && console.log('mtm'.blue, str);
    return str;
}

exports.insert = function (args, ids, link, record) {
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

    args.log && console.log('mtm'.yellow, str);
    return str;
}

exports.remove = function (args, ids, link, record) {

    var str = [
        x.delete(x.name(link.table,z.schema(link))),
        x.where(z.eq(link, link.parentPk, record.pk)),
        'and', z.in(link.childPk, ids),
        ';'
    ].join(' ');

    args.log && console.log('mtm'.red, str);
    return str;
}
