
var query = require('../utils/query'),
    sql = require('../utils/sql'),
    template = require('../utils/template');
var dcopy = require('deep-copy');


// modifies `args.config.columns` with `value`
var otm = {
    getRef: function (args, ref, cb) {
        var columns = sql.fullNames(ref.table, ref.columns);
        var pk = sql.pk(ref.table, ref.pk),
            text = sql.concat(sql.cast(columns), '__text');
        var str = query.replace('get-records', [pk,text].join(), ref.table);

        args.db.client.query(str, function (err, rows) {
            if (err) return cb(err);
            cb(null, rows);
        });
    },
    loopColumns: function (args, cb) {
        var columns = args.config.columns;
        (function loop (i) {
            if (i == columns.length) return cb();
            if ((!columns[i].oneToMany && !columns[i].manyToMany) || !columns[i].control.select)
                return loop(++i);
            var ref = columns[i].oneToMany ? columns[i].oneToMany : columns[i].manyToMany.ref;
            otm.getRef(args, ref, function (err, rows) {
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
    getSelect: function (options) {
        var values = [];
        for (var i=0; i < options.length; i++) {
            values.push({__pk: options[i], __text: options[i]});
        }
        return values;
    },
    getRadio: function (options) {
        return [
            {text: options[0], value: 1},
            {text: options[1], value: 0}
        ];
    },
    loopColumns: function (args) {
        var columns = args.config.columns;
        for (var i=0; i < columns.length; i++) {
            var control = columns[i].control;
            if (!(control.options instanceof Array)) continue;

            switch (true) {
                case control.select:
                    columns[i].value = stc.getSelect(control.options); break;
                case control.radio:
                    columns[i].value = stc.getRadio(control.options); break;
            }
        }
    }
};

// get table records
var tbl = {
    getSql: function (args) {
        var table = args.config.table,
            columns = args.config.columns;

        var names = [];
        for (var i=0; i < columns.length; i++) {
            if (!columns[i].manyToMany) names.push(columns[i].name);
        }

        names = sql.fullNames(table.name, names);
        names.unshift(sql.pk(table.name, table.pk));

        return query.replace('get-record',
            names.join(), table.name, (args.fk? args.fk:table.pk), args.id);
    },
    getRecords: function (args, cb) {
        if (args.post) {
            var table = args.config.table,
                rows = args.post[table.name].records || [];
            return cb(null, rows);
        }

        var str = tbl.getSql(args);
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
    getIds: function (column, pk, args, cb) {
        var link = column.manyToMany.link;
        var str = query.replace('get-record',
            sql.fullName(link.table, link.childPk), link.table, link.parentPk, pk);
        args.db.client.query(str, function (err, rows) {
            if (err) return cb(err);
            var result = [];
            for (var i=0; i < rows.length; i++) {
                result.push(rows[i][link.childPk]);
            }
            cb(err, result);
        });
    },
    loopColumns: function (row, columns, args, cb) {
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
            
            mtm.getIds(column, pk, args, function (err, ids) {
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
    loopRecords: function (args, rows, cb) {
        var columns = args.config.columns;
        (function loop (index) {
            if (index == rows.length) return cb();
            mtm.loopColumns(rows[index], columns, args, function (err) {
                if (err) return cb(err);
                loop(++index);
            });
        }(0));
    }
};


function getData (args, cb) {
    args.config.columns = removeHidden(args.config.columns);

    otm.loopColumns(args, function (err) {
        if (err) return cb(err);
        stc.loopColumns(args);
        tbl.getRecords(args, function (err, rows) {
            if (err) return cb(err);
            mtm.loopRecords(args, rows, function (err) {
                if (err) return cb(err);
                cb(null, getParams(args, rows));
            });
        });
    });
}





// `args.config.columns` is extended with `oneToMany` data
// `rows` comes either from sql select of from post request
function getParams (args, rows) {
    var table = args.config.table,
        _columns = args.config.columns;

    var names = [],
        blank = [];
    for (var i=0; i < _columns.length; i++) {
        names.push(_columns[i].name);
        blank.push(dcopy(_columns[i]));
    }
    for (var i=0; i < names.length; i++) {
        if (args.type === 'view') {
            blank[i].key = args.type+'['+table.name+'][records][0][columns]['+names[i]+']';
        } else {
            blank[i].key = args.type+'['+table.name+'][blank][index][columns]['+names[i]+']';
        }
    }
    var _insert = {
        key: args.type+'['+table.name+'][blank][index][insert]',
        value: true
    };

    var records = [];
    for (var i=0; i < rows.length; i++) {
        
        // var values = rows[i].columns || rows[i],
        var values = rows[i].columns,
            record = args.type+'['+table.name+'][records]['+i+']';

        var pk = {
            key: record+'[pk]',
            value: rows[i].pk || values['__pk']
        };
        
        var insert = rows[i].insert
            ? {
                key: record+'[insert]',
                value: true
            } : null;

        var remove = {
            key: record+'[remove]',
            value: rows[i].remove ? true : null
        };

        var columns = dcopy(_columns);
        for (var j=0; j < columns.length; j++) {
            
            var column = columns[j];
            column.key = record+'[columns]['+column.name+']';
            
            var value = values[column.name];
            column.error = template.validate(column, value);
            column.value = template.value(column, value);
            args.error = column.error ? true : args.error;
        }
        records.push({pk: pk, columns: columns, insert: insert, remove: remove});
    }
    return {name: table.name, verbose: table.verbose, 
            records: records, blank: blank, insert: _insert};
}

exports.getTypes = function (args, cb) {
    var types = ['view', 'oneToOne', 'manyToOne'],
        config = args.config,
        result = {};
    (function loop (i) {
        if (i == types.length) return cb(null, result);
        var type = types[i];

        args.type = type;

        args.tables = {};
        (type == 'view')
            ? args.tables[args.name] = null
            : args.tables = config.editview[type] || {};

        args.post = args.data ? args.data[type] : null;

        getTables(args, function (err, tables) {
            if (err) return cb(err);
            result[type] = {tables: tables};
            loop(++i);
        });
    }(0));
}

function getTables (args, cb) {
    var tables = [],
        keys = Object.keys(args.tables);
    (function loop (index) {
        if (index == keys.length) return cb(null, tables);
        var name = keys[index];
        
        args.config = dcopy(args.settings[name]);
        args.fk = args.tables[name];

        getData(args, function (err, table) {
            if (err) return cb(err);
            tables.push(table);
            loop(++index);
        });
    }(0));
}

function removeHidden (columns) {
    var result = [];
    for (var i=0; i < columns.length; i++) {
        if (!columns[i].editview.show) continue;
        result.push(columns[i]);
    }
    return result;
}

exports.test = {
    removeHidden: removeHidden,

    otm: otm,
    stc: stc,
    tbl: tbl,
    mtm: mtm,
    getParams: getParams
};
