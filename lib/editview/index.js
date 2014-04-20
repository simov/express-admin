
var dcopy = require('deep-copy');
var upload = require('./upload'),
    data = require('./data'),
    params = require('./params');


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
                    cb(null, params.get(args, rows));
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
