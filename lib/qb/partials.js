
var x = null;


function schema (table) {
    if (x.dialect != 'pg') return;
    return table.schema||x._schema;
}

function concat (columns, table, schema, sep) {
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

function group (columns) {
    return (/mysql|sqlite/.test(x.dialect))
        ? x.func('group_concat',['distinct',columns],' ')
        // pg
        : x.func('string_agg',['distinct',[columns,x.wrap(',')].join()],' ')
}

function join (table, fk, ref, pk, alias) {
    var tbl = table.name||table.table,
        tsch = this.schema(table),
        rsch = this.schema(ref),
        ref = ref.table;

    var fks = (fk instanceof Array) ? fk : [fk];
    var pks = (pk instanceof Array) ? pk : [pk];

    var condition = [];
    for (var i=0; i < fks.length; i++) {
        var pk = pks[i], fk = fks[i];

        condition.push(
            x.eq(x.name(fk,tbl,tsch),
                alias ? x.name(pk,alias) : x.name(pk,ref,rsch)
            ));
    }

    return x.join(
        alias ? x.alias(x.name(ref,rsch),x.name(alias)) : x.name(ref,rsch),
        condition,
        'left'
    );
}

function eq (table, column, value) {
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

// [1,2],[3,4] = [1,3],[2,4]
function zip (columns, values) {
    for (var i=0; i < values.length; i++) {
        values[i] = values[i].toString().split(',');
    }
    var result = [];
    for (var i=0; i < columns.length; i++) {
        var val = [];
        for (var j=0; j < values.length; j++) {
            val.push(values[j][i]);
        }
        result.push(val);
    }
    return result;
}
function _in (column, value, alias) {
    var columns = column instanceof Array ? column : [column],
        values = value instanceof Array ? value : [value];

    values = zip(columns, values);

    var result = [];
    for (var i=0; i < columns.length; i++) {
        result.push([
            x.name(columns[i],alias&&alias.alias),
            x.in(values[i])
        ].join(' '));
    }

    return x.and(result);
}

function tables (db) {
    if (x.dialect == 'mysql') {
        return [
            'show tables in',
            x.name(db),
            ';'
        ].join(' ');
    }
    else if (x.dialect == 'pg') {
        return [
            x.select('table_name'),
            x.from('information_schema.tables'),
            x.where(x.eq('table_schema',x.wrap(db))),
            ';'
        ].join(' ');
    }
    else if (x.dialect == 'sqlite') {
        return [
            x.select(x.name('name')),
            x.from('sqlite_master'),
            x.where(x.eq('type',x.wrap('table'))),
            ';'
        ].join(' ');
    }
}

function views (db) {
    if (x.dialect == 'mysql') {
        return [
            'show full tables in',
            x.name(db),
            x.where(x.name('TABLE_TYPE')),
            x.like(x.wrap('VIEW')),
            ';'
        ].join(' ');
    }
    else if (x.dialect == 'pg') {
        return "select viewname from pg_catalog.pg_views "+
        "where schemaname NOT IN ('pg_catalog', 'information_schema') "+
        "order by viewname;";
    }
    else if (x.dialect == 'sqlite') {
        return [
            x.select(x.name('name')),
            x.from('sqlite_master'),
            x.where(x.eq('type',x.wrap('view'))),
            ';'
        ].join(' ');
    }
}

function columns (table, schema) {
    if (x.dialect == 'mysql') {
        return [
            'show columns in',
            x.name(table),
            'in',
            x.name(schema),
            ';'
        ].join(' ');
    }
    else if (x.dialect == 'sqlite') {
        return [
            'pragma',
            x.func('table_info', x.wrap(table)),
            ';'
        ].join(' ');
    }
    else if (x.dialect == 'pg') {
        return 'SELECT cs.column_name AS "Field", cs.data_type AS "Type", '+
        'cs.is_nullable AS "Null", tc.constraint_type AS "Key", '+
        'cs.column_default AS "Default", '+
        'cs.numeric_precision, cs.numeric_precision_radix, cs.numeric_scale, '+
        'cs.character_maximum_length '+
        'FROM "information_schema"."columns" cs '+
        'LEFT JOIN "information_schema"."key_column_usage" kc '+
        '	ON cs.column_name = kc.column_name '+
        '	AND cs.table_schema = kc.table_schema '+
        '	AND cs.table_name = kc.table_name '+
        'LEFT JOIN "information_schema"."table_constraints" tc '+
        '	ON kc.constraint_name = tc.constraint_name '+
        '	AND kc.table_schema = tc.table_schema '+
        '	AND kc.table_name = tc.table_name '+
        'WHERE '+
        '	cs.table_name = \''+table+'\' '+
        '	AND cs.table_schema = \''+schema+'\' ;';
    }
}

exports = module.exports = function (instance) {
    if (instance) x = instance;
    return {
        schema:schema, concat:concat, group:group,
        join:join, eq:eq, in:_in,
        tables:tables, views:views, columns:columns
    }
}
