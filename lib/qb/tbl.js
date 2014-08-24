
var sql = require('../sql/sql'),
    query = require('../sql/query');
var xsql = require('xsql');
var x = new xsql({dialect:
    (sql.client.mysql&&'mysql')||
    (sql.client.pg&&'pg')||
    (sql.client.sqlite&&'sqlite')
});
var z = require('./partials');


exports.select = function (args) {
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
        x.where(x.and(z.eq(table, (args.fk? args.fk:table.pk), args.id))),
        ';'].join(' ');

    args.log && console.log('tbl'.cyan, str);
    return str;
}

// settings - current table settings, record - current record data

exports.insert = function (args, settings, record) {
    var data = _kvp(args.name, record.columns, settings.columns),
        str = query.replace('insert',
            sql.table(settings.table), 
            data.keys.join(), data.values.join(), sql.list('',settings.table.pk));

    args.log && console.log('tbl'.yellow, str);
    return str;
}

exports.update = function (args, settings, record) {
    var pk = settings.table.pk,
        data = _kvp(args.name, record.columns, settings.columns),
        str = query.replace('update',
            sql.table(settings.table),
            data.pairs.join(), x.and(z.eq(settings.table, pk, record.pk)));

    args.log && console.log('tbl'.green, str);
    return str;
}

exports.remove = function (args, settings, record) {
    var pk = settings.table.pk;
        str = query.replace('delete',
            sql.table(settings.table), x.and(z.eq(settings.table, pk, record.pk)));

    args.log && console.log('tbl'.red, str);
    return str;
}

function _kvp (table, data, columns) {
    var keys = [], values = [], pairs = [];

    for (var i=0; i < columns.length; i++) {
        if (columns[i].manyToMany) continue;

        var name = columns[i].name;
        if (!{}.hasOwnProperty.call(data, name)) continue;

        if (columns[i].oneToMany && columns[i].fk) {
            var _values = data[name].split(',');
            for (var j=0; j < columns[i].fk.length; j++) {
                var _name = columns[i].fk[j];
                var just = sql.justName(_name);

                keys.push(just);
                for (var k=0; k < columns.length; k++) {
                    if (columns[k].name == _name) {
                        var value = _escape(_values[j], columns[k].type);
                        break;
                    }
                }
                values.push(value);
                pairs.push(just+'='+value);
            }
            continue;
        }

        var just = sql.justName(name);

        keys.push(just);
        var value = _escape(data[name], columns[i].type);

        values.push(value);
        pairs.push(just+'='+value);
    }
    return {keys: keys, values: values, pairs: pairs};
}

function _escape (value, type) {
    if (value === null || value === undefined) return 'NULL';
    switch (true) {
        case (/(?:var)?char|(?:tiny|medium|long)?text/i.test(type)):
            return "\'"+value.replace(/('|")/g, '\\$1')+"\'";

        case (/date|time|timestamp|datetime|year/i.test(type)):
            return (!value) ? 'NULL' : "\'"+value+"\'";

        case (/(?:tiny|medium|long)?blob|(?:var)?binary\(\d+\)/i.test(type)):
            return "X\'"+value+"\'";

        case (/bytea/.test(type)):
            return "\'\\x"+value+"\'";

        default:
            return (value === '') ? 'NULL' : value;
    }
}

