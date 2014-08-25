
var x = require('../').x;


exports.schema = function (table) {
    if (x.dialect != 'pg') return;
    return table.schema||x.schema;
}

exports.cast = function (columns, tbl, sch) {
    columns = (columns instanceof Array) ? columns : [columns];
    var result = [];
    for (var i=0; i < columns.length; i++) {
        var col = columns[i];

        if (x.dialect == 'mysql') {
            result.push(x.func('cast',x.as(x.name(col,tbl),'char')));
        }
        else if (x.dialect == 'pg') {
            result.push(x.name(col,tbl,sch));
        }
        else if (x.dialect == 'sqlite') { 
            result.push(x.func('ifnull',[x.name(col,tbl),x.wrap('')]));
        }
    }
    return result;
}

exports.concat = function (columns, sep) {
    sep = sep||' ';
    return (/mysql|pg/.test(x.dialect))
        ? x.func('concat_ws',[x.wrap(sep),columns])
        // sqlite
        : columns.join("||'"+sep+"'||")
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

exports.as = function (table, column, name,sep) {
    var schema = this.schema(table);
    var columns = (column instanceof Array)
        ? this.concat(this.cast(column,table.name||table.table,schema),sep)
        : x.name(column,table.name||table.table,schema)
    
    return x.as(columns,x.name(name));
}

exports.eq = function (table, column, value) {
    var columns = column instanceof Array ? column : [column];

    var values =
        (value instanceof Array) ? value :
        ('string'===typeof value  ? value.split(',') :
        [value]);

    var result = [];
    for (var i=0; i < columns.length; i++) {
        var val = (undefined===values[i]) ? null :
            ('string'===typeof values[i]) ? x.string(values[i]) :
            values[i];

        result.push(x.eq(x.name(columns[i]),val));
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
