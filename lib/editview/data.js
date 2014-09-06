
var async = require('async');
var qb = require('../qb');


// modifies `args.config.columns` with `value`
var otm = {
    _getData: function (args, ref, done) {
        var str = qb.otm.select(args, ref);
        args.db.client.query(str, function (err, rows) {
            if (err) return done(err);
            done(null, rows);
        });
    },
    get: function (args, done) {
        async.each(args.config.columns, function (column, done) {
            if ((!column.oneToMany && !column.manyToMany) || !column.control.select)
                return done();
            var ref = column.oneToMany ? column.oneToMany : column.manyToMany.ref;
            otm._getData(args, ref, function (err, rows) {
                if (err) return done(err);
                column.value = rows;
                done();
            });
        }, done);
    }
};

// load static values from settings
// modifies `args.config.columns` with `value`
var stc = {
    getSelect: function (options) {
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
    getRadio: function (options) {
        return [
            {text: options[0], value: 1},
            {text: options[1], value: 0}
        ];
    },
    // loopColumns
    get: function (args) {
        var columns = args.config.columns;
        for (var i=0; i < columns.length; i++) {
            var control = columns[i].control;
            if (!(control.options instanceof Array)) continue;

            if (control.select) {
                columns[i].value = stc.getSelect(control.options);
            }
            else if (control.radio) {
                columns[i].value = stc.getRadio(control.options);
            }
        }
    }
};

// get table records
var tbl = {
    get: function (args, done) {
        if (args.post) {
            var table = args.config.table,
                rows = args.post[table.name].records || [];
            return done(null, rows);
        }

        var str = qb.tbl.select(args);
        args.db.client.query(str, function (err, rows) {
            if (err) return done(err);
            var result = [];
            for (var i=0; i < rows.length; i++) {
                result.push({columns: rows[i]});
            }
            done(null, result);
        });
    }
};

// modifies `rows.columns` with manyToMany columns on select
// modifies `rows` with ids on post
var mtm = {
    // return an array of all child ids linked to this record's pk
    getIds: function (args, column, pk, done) {
        var str = qb.mtm.select(args, column, pk);
        args.db.client.query(str, function (err, rows) {
            if (err) return done(err);
            var result = [];
            for (var i=0; i < rows.length; i++) {
                result.push(rows[i][Object.keys(rows[i])[0]]);
            }
            done(err, result);
        });
    },
    loopColumns: function (args, row, done) {
        row.ids = {};
        async.each(args.config.columns, function (column, done) {
            if (!column.manyToMany) return done();
            
            // after select this column practically doesn't exists
            if (row.columns[column.name] === undefined)
                row.columns[column.name] = [];

            var pk = row.pk || row.columns['__pk'];
            if (!pk) return done();
            
            mtm.getIds(args, column, pk, function (err, ids) {
                if (err) return done(err);
                args.post
                    // save the ids from the database
                    ? row.ids[column.name] = ids
                    // selecting
                    : row.columns[column.name] = ids;

                done();
            });
        }, done);
    },
    // loopRecords
    get: function (args, rows, done) {
        async.each(rows, function (row, done) {
            mtm.loopColumns(args, row, done);
        }, done);
    }
};

exports = module.exports = {tbl: tbl, otm: otm, mtm: mtm, stc: stc};
