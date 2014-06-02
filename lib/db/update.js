
var sql = require('../sql/sql'),
    query = require('../sql/query');


exports.update = function (args, cb) {
    switch (args.action) {
        case 'insert':
        case 'update':
            var types = ['view', 'oneToOne', 'manyToOne'];
            break;
        case 'remove':
            var types = ['oneToOne', 'manyToOne', 'view'];
            break;
    }
    args.queries = [];

    (function loopTypes (k) {
        if (k == types.length) return cb();
        
        args.type = types[k];
        args.tables = args.data[types[k]];
        if (!args.tables) return loopTypes(++k);
        var keys = Object.keys(args.tables);

        (function loopTables (i) {
            if (i == keys.length) return loopTypes(++k);
            
            var records = args.tables[keys[i]].records;
            if (!records) return loopTables(++i);

            (function loopRecords (j) {
                if (j == records.length) return loopTables(++i);

                var record = records[j],
                    settings = args.settings[keys[i]];
                updateRecord(args, settings, record, function (err) {
                    if (err) return cb(err);
                    loopRecords(++j);
                });
            }(0));
        }(0));
    }(0));
}

// settings - current table settings, record - current record data
function updateRecord (args, settings, record, cb) {
    if (args.type !== 'view') {
        var fk = args.settings[args.name].editview[args.type][settings.table.name];
        fk = fk instanceof Array ? fk : [fk];
        for (var i=0; i < fk.length; i++) {
            record.columns[fk[i]] = args.id[i];
        }
    }

    if (record.insert) {
        var data = kvp(args.name, record.columns, settings.columns),
            str = query.replace('insert',
                settings.table.name, data.keys.join(), data.values.join(), sql.list('',settings.table.pk));
        
        var action = 'insert';

    } else if (record.remove || args.action == 'remove') {
        var pk = settings.table.pk;
            str = query.replace('delete', settings.table.name, sql.andValues(settings.table.name, pk, record.pk));

        var action = 'remove';

    } else { // update
        var pk = settings.table.pk,
            data = kvp(args.name, record.columns, settings.columns),
            str = query.replace('update',
                settings.table.name, data.pairs.join(), sql.andValues(settings.table.name, pk, record.pk));

        var action = 'update';
    }

    execute(action, args, str, record, settings, cb);
}

function execute (action, args, str, record, settings, cb) {
    if (args.debug) {
        // insert or update
        if (action != 'remove') {
            args.queries.push(str);
            if (action == 'insert') {
                record.pk = '[PK]';
                if (args.type == 'view' && args.action == 'insert')
                    args.id = '[FK]';
            }
            var queries = manyToMany(action, args, record, settings.columns);
            args.queries = args.queries.concat(queries);
        }
        // remove
        else {
            var queries = manyToMany(action, args, record, settings.columns);
            args.queries = args.queries.concat(queries);
            args.queries.push(str);
        }
        return cb();
    }

    args.log && console.log('tbl'.green, str);

    // insert or update
    if (action != 'remove') {
        args.db.client.query(str, function (err, result) {
            if (err) return cb(err);

            if (action == 'insert') {
                var pks = settings.table.pk instanceof Array ? settings.table.pk : [settings.table.pk],
                    columns = record.columns,
                    values = [];

                for (var i=0; i < pks.length; i++) {
                    if (columns[pks[i]] === undefined) {
                        values.push(result.insertId);
                    } else {
                        values.push(columns[pks[i]]);
                    }
                }

                record.pk = values;
                if (args.type == 'view' && args.action == 'insert')
                    args.id = values;
            }

            var queries = manyToMany(action, args, record, settings.columns);
            spin(args, queries, function (err) {
                if (err) return cb(err);
                cb();
            });
        });
    }
    // remove
    else {
        var queries = manyToMany(action, args, record, settings.columns);
        spin(args, queries, function (err) {
            if (err) return cb(err);
            args.db.client.query(str, function (err, result) {
                if (err) return cb(err);
                cb();
            });
        });
    }
}

function spin (args, queries, cb) {
    (function loop (i) {
        if (i == queries.length) return cb();
        args.log && console.log('mtm'.green, queries[i]);
        args.db.client.query(queries[i], function (err) {
            if (err) return cb(err);
            loop(++i);
        });
    }(0));
}

// sql string helpers

function kvp (table, data, columns) {
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
                        var value = escape(_values[j], columns[k].type);
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
        var value = escape(data[name], columns[i].type);

        values.push(value);
        pairs.push(just+'='+value);
    }
    return {keys: keys, values: values, pairs: pairs};
}

function escape (value, type) {
    if (/(?:var)?char|(?:tiny|medium|long)?text/i.test(type)) {
        return "\'"+value.replace(/('|")/g, '\\$1')+"\'";
    }
    else if (/date|time|timestamp|datetime|year/i.test(type)) {
        return (value === '' || value === null) ? 'NULL' : "\'"+value+"\'";
    }
    else if (/(?:tiny|medium|long)?blob|(?:var)?binary\(\d+\)/i.test(type)) {
        return "X\'"+value+"\'";
    }
    else if (/bytea/.test(type)) {
        return "\'\\x"+value+"\'";
    }
    else {
        return value;
    }
}

// many-to-many helpers

function manyToMany (action, args, record, columns) {
    var queries = [];

    for (var i=0; i < columns.length; i++) {
        if (!columns[i].manyToMany) continue;

        var link = columns[i].manyToMany.link,
            dbIds = record.ids[columns[i].name] || [],
            postIds = record.columns[columns[i].name] || [];
        postIds = (postIds instanceof Array) ? postIds : [postIds];

        var ins, del;
        switch (action) {
            case 'insert':
                ins = manyInsert(postIds, link, record);
                break;
            case 'remove':
                del = manyDelete(dbIds, link, record);
                break;
            case 'update':
                var delIds = difference(dbIds, postIds),
                    insIds = difference(postIds, dbIds);
                del = manyDelete(delIds, link, record);
                ins = manyInsert(insIds, link, record);
                break;		
        }
        ins ? queries.push(ins) : null;
        del ? queries.push(del) : null;
    }
    return queries;
}

function manyInsert (ids, link, record) {
    if (!ids.length) return null;

    var parentPk = link.parentPk instanceof Array ? link.parentPk : [link.parentPk],
        childPk = link.childPk instanceof Array ? link.childPk : [link.childPk];

    var str = query.replace('insert-many', link.table,
        sql.list('', parentPk.concat(childPk)),
        sql.values(record.pk, ids));

    return str;
}

function manyDelete (ids, link, record) {
    if (!ids.length) return null;

    var str = query.replace('delete-many', link.table,
        sql.andValues('', link.parentPk, record.pk),
        sql.in('', link.childPk, ids));

    return str;
}

function difference (source, target) {
    for (var i=0; i < source.length; i++) {
        source[i] = source[i].toString();
    }
    for (var i=0; i < target.length; i++) {
        target[i] = target[i].toString();
    }
    return source.filter(function (i) {
        return !(target.indexOf(i) > -1);
    });
}
