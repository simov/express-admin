
var sql = require('../sql/sql');
var xsql = require('xsql');
var x = new xsql({dialect:
    (sql.client.mysql&&'mysql')||
    (sql.client.pg&&'pg')||
    (sql.client.sqlite&&'sqlite')
});


exports.cast = function (columns, tbl) {
    var result = [];
    for (var i=0; i < columns.length; i++) {
        var col = columns[i];

        if (x.dialect == 'mysql') {
            result.push(x.func('cast',x.as(x.name(col,tbl),'char')));
        }
        else if (x.dialect == 'pg') {
            result.push(x.name(col,tbl));
        }
        else if (x.dialect == 'sqlite') { 
            result.push(x.func('ifnull',[x.name(col,tbl),x.wrap('')]));
        }
    }
    return result;
}

exports.concat = function (columns) {
    return (/mysql|pg/.test(x.dialect))
        ? x.func('concat_ws',[x.wrap(' '),columns])
        // sqlite
        : columns.join("||' '||")
}

exports.group = function (columns) {
    return (/mysql|sqlite/.test(x.dialect))
        ? x.func('group_concat',['distinct',columns],' ')
        // pg
        : x.func('string_agg',['distinct',[columns,x.wrap(',')].join()],' ')
}

exports.join = function (table, fk, ref, pk, alias) {
    var tbl = table.name||table.table,
        rsch = (x.dialect=='pg'&&(ref.schema||sql.schema))||undefined,
        tsch = (x.dialect=='pg'&&(table.schema||sql.schema))||undefined,
        ali = (alias&&alias.alias)||undefined,
        ref = ref.table;

    var fks = (fk instanceof Array) ? fk : [fk];
    var pks = (pk instanceof Array) ? pk : [pk];

    var result = [];
    for (var i=0; i < fks.length; i++) {
        var pk = pks[i], fk = fks[i];

        result.push(x.eq(
            x.name(fk,tbl,tsch),
            ali ? x.name(pk,ali) : x.name(pk,ref,rsch)));
    }

    return x.join(
        ali ? x.alias(x.name(ref,rsch),x.name(ali)) : x.name(ref,rsch),
        result,
        'left'
    );
}

exports.as = function (table, column, name) {
    var schema = (x.dialect=='pg'&&(table.schema||sql.schema))||undefined;
    var columns = (column instanceof Array)
        ? this.concat(x.names(column,table.name||table.table,schema))
        : x.name(column,table.name||table.table,schema)
    
    return x.as(columns,x.name(name));
}
