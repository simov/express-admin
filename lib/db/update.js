
var async = require('async');
var qb = require('../qb')();


exports.update = function (args, done) {
    var types = /insert|update/.test(args.action)
        ? ['view', 'oneToOne', 'manyToOne']
        // remove
        : ['oneToOne', 'manyToOne', 'view'];

    async.eachSeries(types, function (type, done) {
        args.type = type;
        args.tables = args.data[type];
        if (!args.tables) return done();

        async.eachSeries(Object.keys(args.tables), function (table, done) {
            var records = args.tables[table].records;
            if (!records) return done();

            async.eachSeries(records, function (record, done) {
                var settings = args.settings[table];
                tbl.inline(args, settings, record);

                var data = tbl.query(args, settings, record);
                tbl.execute(data.action, args, data.query, record, settings, done);
            }, done);
        }, done);
    }, done);
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
            var str = qb.tbl.insert(args, settings, record);
            var action = 'insert';

        } else if (record.remove || args.action == 'remove') {
            var str = qb.tbl.remove(args, settings, record);
            var action = 'remove';

        } else { // update
            var str = qb.tbl.update(args, settings, record);
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
                    ins = many._insert(args, postIds, link, record);
                    break;
                case 'remove':
                    del = many._delete(args, dbIds, link, record);
                    break;
                case 'update':
                    var delIds = this._difference(dbIds, postIds),
                        insIds = this._difference(postIds, dbIds);
                    del = this._delete(args, delIds, link, record);
                    ins = this._insert(args, insIds, link, record);
                    break;		
            }
            ins ? queries.push(ins) : null;
            del ? queries.push(del) : null;
        }
        return queries;
    },
    _insert: function (args, ids, link, record) {
        if (!ids.length) return null;

        return qb.mtm.insert(args, ids, link, record);
    },
    _delete: function (args, ids, link, record) {
        if (!ids.length) return null;

        return qb.mtm.remove(args, ids, link, record);
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
    execute: function (args, queries, done) {
        async.eachSeries(queries, function (query, done) {
            args.db.client.query(query, done);
        }, done);
    }
};
