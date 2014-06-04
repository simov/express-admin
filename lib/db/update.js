
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
                tbl.inline(args, settings, record);
                var data = tbl.query(args, settings, record);

                tbl.execute(data.action, args, data.query, record, settings, function (err) {
                    if (err) return cb(err);
                    loopRecords(++j);
                });
            }(0));
        }(0));
    }(0));
}


var tbl = {
    // modifies inline record.columns[fk] with parent [pk]
    inline: function (args, settings, record) {
        if (args.type == 'view') return;

        var fk = args.settings[args.name].editview[args.type][settings.table.name];
        fk = fk instanceof Array ? fk : [fk];
        for (var i=0; i < fk.length; i++) {
            record.columns[fk[i]] = args.id[i];
        }
    },
    // settings - current table settings, record - current record data
    query: function (args, settings, record) {
        if (record.insert) {
            var data = this._kvp(args.name, record.columns, settings.columns),
                str = query.replace('insert',
                    sql.table(settings.table.name), data.keys.join(), data.values.join(), sql.list('',settings.table.pk));
            
            var action = 'insert';

        } else if (record.remove || args.action == 'remove') {
            var pk = settings.table.pk;
                str = query.replace('delete', sql.table(settings.table.name), sql.andValues(settings.table.name, pk, record.pk));

            var action = 'remove';

        } else { // update
            var pk = settings.table.pk,
                data = this._kvp(args.name, record.columns, settings.columns),
                str = query.replace('update',
                    sql.table(settings.table.name), data.pairs.join(), sql.andValues(settings.table.name, pk, record.pk));

            var action = 'update';
        }

        return {action:action, query:str};
    },
    _pks: function (args, settings, record, result) {
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
    },
    execute: function (action, args, str, record, settings, cb) {
        args.log && console.log('tbl'.green, str);
        if (args.debug) return cb();

        // insert or update
        if (action != 'remove') {
            args.db.client.query(str, function (err, result) {
                if (err) return cb(err);

                if (action == 'insert') {
                    tbl._pks(args, settings, record, result);
                }

                var queries = many.queries(action, args, record, settings.columns);
                many.execute(args, queries, function (err) {
                    if (err) return cb(err);
                    cb();
                });
            });
        }
        // remove
        else {
            var queries = many.queries(action, args, record, settings.columns);
            many.execute(args, queries, function (err) {
                if (err) return cb(err);
                args.db.client.query(str, function (err, result) {
                    if (err) return cb(err);
                    cb();
                });
            });
        }
    },
    _kvp: function (table, data, columns) {
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
                            var value = this._escape(_values[j], columns[k].type);
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
            var value = this._escape(data[name], columns[i].type);

            values.push(value);
            pairs.push(just+'='+value);
        }
        return {keys: keys, values: values, pairs: pairs};
    },
    _escape: function (value, type) {
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
};


var many = {
    queries: function (action, args, record, columns) {
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
                    ins = many._insert(postIds, link, record);
                    break;
                case 'remove':
                    del = many._delete(dbIds, link, record);
                    break;
                case 'update':
                    var delIds = this._difference(dbIds, postIds),
                        insIds = this._difference(postIds, dbIds);
                    del = this._delete(delIds, link, record);
                    ins = this._insert(insIds, link, record);
                    break;		
            }
            ins ? queries.push(ins) : null;
            del ? queries.push(del) : null;
        }
        return queries;
    },
    _insert: function (ids, link, record) {
        if (!ids.length) return null;

        var parentPk = link.parentPk instanceof Array ? link.parentPk : [link.parentPk],
            childPk = link.childPk instanceof Array ? link.childPk : [link.childPk];

        var str = query.replace('insert-many', sql.table(link.table),
            sql.list('', parentPk.concat(childPk)),
            sql.values(record.pk, ids));

        return str;
    },
    _delete: function (ids, link, record) {
        if (!ids.length) return null;

        var str = query.replace('delete-many', sql.table(link.table),
            sql.andValues('', link.parentPk, record.pk),
            sql.in('', link.childPk, ids));

        return str;
    },
    _difference: function (source, target) {
        for (var i=0; i < source.length; i++) {
            source[i] = source[i].toString();
        }
        for (var i=0; i < target.length; i++) {
            target[i] = target[i].toString();
        }
        return source.filter(function (i) {
            return !(target.indexOf(i) > -1);
        });
    },
    execute: function (args, queries, cb) {
        (function loop (i) {
            if (i == queries.length) return cb();
            args.log && console.log('mtm'.green, queries[i]);
            args.db.client.query(queries[i], function (err) {
                if (err) return cb(err);
                loop(++i);
            });
        }(0));
    }
};
