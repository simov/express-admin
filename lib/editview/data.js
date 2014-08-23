
var qb = require('../query')


// modifies `args.config.columns` with `value`
var otm = {
    _getRef: function (args, ref, cb) {
        var str = qb.select.otm(args, ref);
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
            if ('string' === typeof options[i]) {
                values.push({__pk: options[i], __text: options[i]});
            }
            else if ('object' === typeof options[i]) {
                var value = Object.keys(options[i])[0],
                    text = options[i][value];
                values.push({__pk: value, __text: text});
            }
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
    // public - add docs
    get: function (args, cb) {
        if (args.post) {
            var table = args.config.table,
                rows = args.post[table.name].records || [];
            return cb(null, rows);
        }

        var str = qb.select.tbl(args);
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
    _getIds: function (args, column, pk, cb) {
        var str = qb.select.mtm(args, column, pk);
        args.db.client.query(str, function (err, rows) {
            if (err) return cb(err);
            var result = [];
            for (var i=0; i < rows.length; i++) {
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
            
            mtm._getIds(args, column, pk, function (err, ids) {
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
