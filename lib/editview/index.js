
var async = require('async'),
    dcopy = require('deep-copy');
var upload = require('./upload'),
    data = require('../data'),
    template = require('../template');


function removeHidden (columns) {
    var result = [];
    for (var i=0; i < columns.length; i++) {
        if (!columns[i].editview.show) continue;
        result.push(columns[i]);
    }
    return result;
}

function getData (args, done) {
    args.config.columns = removeHidden(args.config.columns);

    data.otm.get(args, function (err) {
        if (err) return done(err);
        data.stc.get(args);
        data.tbl.get(args, function (err, rows) {
            if (err) return done(err);
            data.mtm.get(args, rows, function (err) {
                if (err) return done(err);
                upload.loopRecords(args, function (err) {
                    if (err) return done(err);
                    done(null, template.table.get(args, rows));
                });
            });
        });
    });
}

function getTables (args, done) {
    var tables = [];
    async.eachSeries(Object.keys(args.tables), function (name, done) {

        args.config = dcopy(args.settings[name]);
        args.fk = args.tables[name];

        getData(args, function (err, table) {
            if (err) return done(err);
            tables.push(table);
            done();
        });
    }, function (err) {
        done(err, tables);
    });
}

exports.getTypes = function (args, done) {
    var result = {};
    args.config = dcopy(args.settings[args.name]);
    async.eachSeries(['view', 'oneToOne', 'manyToOne'], function (type, done) {
        args.type = type;

        args.tables = {};
        (type == 'view')
            ? args.tables[args.name] = null
            : args.tables = args.config.editview[type] || {};

        args.post = args.data ? args.data[type] : null;
        args.files = args.upload ? args.upload[type] : null;

        getTables(args, function (err, tables) {
            if (err) return done(err);
            result[type] = {tables: tables};
            done();
        });
    }, function (err) {
        delete args.type;
        delete args.tables;
        delete args.post;
        delete args.files;
        delete args.config;
        delete args.fk;
        done(err, result);
    });
}

exports._removeHidden = removeHidden;
