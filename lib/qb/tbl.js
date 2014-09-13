
var x = null,
    z = require('./partials')();


function select (args) {
    var table = args.config.table,
        columns = args.config.columns;

    var names = [];
    for (var i=0; i < columns.length; i++) {
        if (columns[i].oneToMany && columns[i].fk)
            names.push(x.as(
                z.concat(columns[i].fk,table.name,z.schema(table),','),
                x.name(columns[i].name)
            ));

        else if (!columns[i].manyToMany)
            names.push(x.name(columns[i].name,table.name,z.schema(table)));
    }
    names.unshift(x.as(
        z.concat(table.pk,table.name,z.schema(table),','),
        x.name('__pk')
    ));

    var str = [
        x.select(names.join()),
        x.from(x.name(table.name,z.schema(table))),
        x.where(x.and(z.eq(table, (args.fk? args.fk:table.pk), args.id))),
        ';'
    ].join(' ');

    args.log && console.log('tbl'.cyan, str);
    return str;
}

function insert (args, settings, record) {
    var data = _kvp(args.name, record.columns, settings.columns);
    
    var result = [
        x.insert(
            x.name(settings.table.name,z.schema(settings.table)), 
            data.keys,
            data.values
        )
    ];

    if (x.dialect == 'pg') {
        (settings.table.pk instanceof Array)
            ? result.push('returning ' + x.names(settings.table.pk))
            : result.push('returning ' + x.name(settings.table.pk));
    }
    result.push(';');

    var str = result.join(' ');
    args.log && console.log('tbl'.yellow, str);
    return str;
}

function update (args, settings, record) {
    var data = _kvp(args.name, record.columns, settings.columns);

    var str = [
        x.update(
            x.name(settings.table.name,z.schema(settings.table)),
            data.keys,
            data.values
        ),
        x.where(x.and(z.eq(settings.table, settings.table.pk, record.pk))),
        ';'
    ].join(' ');

    args.log && console.log('tbl'.green, str);
    return str;
}

function remove (args, settings, record) {
    var pk = settings.table.pk;

    var str = [
        x.delete(x.name(settings.table.name,z.schema(settings.table))),
        x.where(x.and(z.eq(settings.table,pk,record.pk))),
        ';'
    ].join(' ');

    args.log && console.log('tbl'.red, str);
    return str;
}

function _kvp (table, data, columns) {
    var keys = [], values = [];

    for (var i=0; i < columns.length; i++) {
        if (columns[i].manyToMany) continue;

        var name = columns[i].name;
        if (!{}.hasOwnProperty.call(data, name)) continue;

        if (columns[i].oneToMany && columns[i].fk) {
            var _values = data[name].split(',');
            for (var j=0; j < columns[i].fk.length; j++) {
                var _name = columns[i].fk[j];

                keys.push(x.name(_name));
                for (var k=0; k < columns.length; k++) {
                    if (columns[k].name == _name) {
                        var value = _values[j];
                        break;
                    }
                }
                values.push(value||null);
            }
            continue;
        }

        keys.push(x.name(name));
        var value = _escape(data[name], columns[i].type);

        values.push(value);
    }
    return {keys: keys, values: values};
}

function _escape (value, type) {
    if (!value) return null;
    switch (true) {
        case (/(?:tiny|medium|long)?blob|(?:var)?binary\(\d+\)/i.test(type)):
            return "X\'"+value+"\'";

        case (/bytea/.test(type)):
            return "\'\\x"+value+"\'";

        default:
            return value;
    }
}

exports = module.exports = function (instance) {
    if (instance) x = instance;
    return {
        select:select, insert:insert, update:update,
        remove:remove
    }
}
