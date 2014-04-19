
var dcopy = require('deep-copy');
var validate = require('./validate'),
    format = require('./format'),
    upload = require('./upload'),
    data = require('./data');



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
            column.error = validate.value(column, value);
            column.value = format.value(column, value);
            args.error = column.error ? true : args.error;
        }
        records.push({pk: pk, columns: columns, insert: insert, remove: remove});
    }
    return {name: table.name, verbose: table.verbose, 
            records: records, blank: blank, insert: _insert};
}

function removeHidden (columns) {
    var result = [];
    for (var i=0; i < columns.length; i++) {
        if (!columns[i].editview.show) continue;
        result.push(columns[i]);
    }
    return result;
}

function getData (args, cb) {
    args.config.columns = removeHidden(args.config.columns);

    data.otm.get(args, function (err) {
        if (err) return cb(err);
        data.stc.get(args);
        data.tbl.get(args, function (err, rows) {
            if (err) return cb(err);
            data.mtm.get(args, rows, function (err) {
                if (err) return cb(err);
                upload.loopRecords(args, function (err) {
                    if (err) return cb(err);
                    cb(null, getParams(args, rows));
                });
            });
        });
    });
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
        args.files = args.upload ? args.upload[type] : null;

        getTables(args, function (err, tables) {
            if (err) return cb(err);
            result[type] = {tables: tables};
            loop(++i);
        });
    }(0));
}

exports._removeHidden = removeHidden;
