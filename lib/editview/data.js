
var query = require('../sql/query'),
    sql = require('../sql/sql');


// modifies `args.config.columns` with `value`
var otm = {
    _getRef: function (args, ref, cb) {
        var pk = sql.as(ref.table, ref.pk, '__pk'),
            text = sql.castConcat(ref.table, ref.columns, '__text');
        var str = query.replace('get-records', [pk,text].join(), sql.table(ref));
        args.log && console.log('otm'.cyan, str);
        args.db.client.query(str, function (err, rows) {
            if (err) return cb(err);
            cb(null, rows);
        });
    },
    // loopColumns - add docs
    get: function (args, cb) {
        var columns = args.config.columns;
        (function loop (i) {
            if (i == columns.length) return cb();
            if ((!columns[i].oneToMany && !columns[i].manyToMany) || !columns[i].control.select)
                return loop(++i);
            var ref = columns[i].oneToMany ? columns[i].oneToMany : columns[i].manyToMany.ref;
            otm._getRef(args, ref, function (err, rows) {
                if (err) return cb(err);
                columns[i].value = rows;
                loop(++i);
            });
        }(0));
    }
};

// load static values from settings
// modifies `args.config.columns` with `value`
var stc = {
    _getSelect: function (options) {
        var values = [];
        for (var i=0; i < options.length; i++) {
            values.push({__pk: options[i], __text: options[i]});
        }
        return values;
    },
    _getRadio: function (options) {
        return [
            {text: options[0], value: 1},
            {text: options[1], value: 0}
        ];
    },
    // loopColumns - add docs
    get: function (args) {
        var columns = args.config.columns;
        for (var i=0; i < columns.length; i++) {
            var control = columns[i].control;
            if (!(control.options instanceof Array)) continue;

            switch (true) {
                case control.select:
                    columns[i].value = stc._getSelect(control.options); break;
                case control.radio:
                    columns[i].value = stc._getRadio(control.options); break;
            }
        }
    }
};

// get table records
var tbl = {
    _getSql: function (args) {
        var table = args.config.table,
            columns = args.config.columns;

        var names = [];
        for (var i=0; i < columns.length; i++) {
            if (columns[i].oneToMany && columns[i].fk) {
                names.push(sql.as(table.name, columns[i].fk, columns[i].name));
            }
            else if (!(columns[i].oneToMany && columns[i].fk) && !columns[i].manyToMany)
                names.push(sql.fullName(table.name, columns[i].name));
        }
        names.unshift(sql.as(table.name, table.pk, '__pk'));

        return query.replace('get-record',
            names.join(), sql.table(table), sql.andValues(table.name, (args.fk? args.fk:table.pk), args.id));
    },
    // public - add docs
    get: function (args, cb) {
        if (args.post) {
            var table = args.config.table,
                rows = args.post[table.name].records || [];
            return cb(null, rows);
        }

        var str = tbl._getSql(args);
        args.log && console.log('tbl'.cyan, str);
        args.db.client.query(str, function (err, rows) {
            if (err) return cb(err);
            var result = [];
            for (var i=0; i < rows.length; i++) {
                result.push({columns: rows[i]});
            }
            cb(null, result);
        });
    }
};

// modifies `rows.columns` with manyToMany columns on select
// modifies `rows` with ids on post
var mtm = {
    // return an array of all child ids linked to this record's pk
    _getIds: function (column, pk, args, cb) {
        var link = column.manyToMany.link;
        var str = query.replace('get-record',
            sql.concat(link.table, link.childPk), sql.table(link), sql.andValues(link.table, link.parentPk, pk));
        args.log && console.log('mtm'.cyan, str);
        args.db.client.query(str, function (err, rows) {
            if (err) return cb(err);
            var result = [];
            for (var i=0; i < rows.length; i++) {
                // result.push(rows[i][link.childPk]);
                result.push(rows[i][Object.keys(rows[i])[0]]);
            }
            cb(err, result);
        });
    },
    _loopColumns: function (row, columns, args, cb) {
        row.ids = {};
        (function loop (index) {
            if (index == columns.length) return cb();

            var column = columns[index];
            if (!column.manyToMany) return loop(++index);
            
            // after select this column practically doesn't exists
            if (row.columns[column.name] === undefined)
                row.columns[column.name] = [];

            var pk = row.pk || row.columns['__pk'];
            if (!pk) return loop(++index);
            
            mtm._getIds(column, pk, args, function (err, ids) {
                if (err) return cb(err);
                args.post
                    // save the ids from the database
                    ? row.ids[column.name] = ids
                    // selecting
                    : row.columns[column.name] = ids;

                loop(++index);
            });
        }(0));
    },
    // loopRecords - add docs
    get: function (args, rows, cb) {
        var columns = args.config.columns;
        (function loop (index) {
            if (index == rows.length) return cb();
            mtm._loopColumns(rows[index], columns, args, function (err) {
                if (err) return cb(err);
                loop(++index);
            });
        }(0));
    }
};

exports = module.exports = {tbl: tbl, otm: otm, mtm: mtm, stc: stc};
