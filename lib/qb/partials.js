
var x = require('../').x;


exports.schema = function (table) {
    if (x.dialect != 'pg') return;
    return table.schema||x.schema;
}

exports.concat = function (columns, table, schema, sep) {
    if (!(columns instanceof Array))
        return x.name(columns,table,schema);

    var result = [];
    if (x.dialect == 'sqlite') {
        for (var i=0; i < columns.length; i++) {
            result.push(x.func('ifnull',[x.name(columns[i],table),x.wrap('')]));
        }
    }
    else {
        // mysql|pg
        result = x.names(columns,table,schema);
    }
    columns = result;

    return (/mysql|pg/.test(x.dialect))
        ? x.func('concat_ws',[x.wrap(sep),columns])
        // sqlite
        : columns.join("||'"+sep+"'||");
}

exports.group = function (columns) {
    return (/mysql|sqlite/.test(x.dialect))
        ? x.func('group_concat',['distinct',columns],' ')
        // pg
        : x.func('string_agg',['distinct',[columns,x.wrap(',')].join()],' ')
}

exports.join = function (table, fk, ref, pk, alias) {
    var tbl = table.name||table.table,
        tsch = this.schema(table),
        rsch = this.schema(ref),
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

exports.eq = function (table, column, value) {
    var columns = column instanceof Array ? column : [column];

    var values =
        (value instanceof Array) ? value :
        ('string'===typeof value  ? value.split(',') :
        [value]);

    var tbl = table.name||table.table,
        sch = this.schema(table);

    var result = [];
    for (var i=0; i < columns.length; i++) {
        result.push(x.eqv(x.name(columns[i],tbl,sch),values[i]));
    }

    return result;
}

// ['child1','child2'] - ['2,4', '6,7']
// `child1` IN (2,6) AND `child2` IN (4,7)
function aargh (columns, values) {
    var result = [];
    for (var i=0; i < columns.length; i++) {
        var arr = [];
        for (var j=0; j < values.length; j++) {
            arr.push(escape(values[j].toString().split(',')[i]));
        }
        result.push(arr);
    }
    return result;
}
exports.in = function (column, value, alias) {
    var columns = column instanceof Array ? column : [column],
        values = value instanceof Array ? value : [value];

    values = aargh(columns, values);

    var result = [];
    for (var i=0; i < columns.length; i++) {
        result.push([x.name(columns[i],alias&&alias.alias), x.in(values[i])].join(' '));
    }

    return x.and(result);
}
