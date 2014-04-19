
var fs = require('fs'),
    path = require('path'),
    should = require('should');
var db = require('../../lib/db/database'),
    Schema = require('../../lib/db/schema');


describe('schema (db)', function () {
    var schema = null;
    before(function (done) {
        db.connect({mysql:{database: 'express-admin-simple',
                    user:'liolio', password:'karamba'}}, function (err) {
            if (err) return done(err);
            schema = new Schema(db);
            done();
        });
    });

    it('get table names', function (done) {
        schema.getTables(function (err, tables) {
            if (err) return done(err);
            tables.join().should.equal(
                'item,property,purchase,recipe,recipe_ref,recipe_type,subtype,type,user');
            done();
        });
    });
    it('get table columns info', function (done) {
        schema.getTables(function (err, tables) {
            if (err) return done(err);
            schema.getColumns(tables[0], function (err, info) {
                if (err) return done(err);
                var columns = Object.keys(info);
                columns.join().should.equal('id,name,notes');
                // may test column properties too
                done();
            });
        });
    });
    it('get schema columns info', function (done) {
        schema.getAllColumns(function (err, columns) {
            if (err) return done(err);
            var tables = Object.keys(columns);
            tables.join().should.equal(
                'item,property,purchase,recipe,recipe_ref,recipe_type,subtype,type,user');
            done();
        });
    });
});

describe.skip('schema mysql|pg', function () {
    function getColumnsInfo (dbType, cb) {
        var config = {};
        config[dbType] = {database:'express-admin-types', user:'liolio', password:'karamba'};
        db.connect(config, function (err) {
            if (err) return cb(err);
            var schema = new Schema(db);
            schema.getAllColumns(cb);
        });
    }
    it('generate correct settings', function (done) {
        getColumnsInfo('mysql', function (err, mysql) {
            if (err) return done(err);
            getColumnsInfo('pg', function (err, pg) {
                if (err) return done(err);

                // pk
                mysql.datatypes.int.key.should.equal('pri');
                mysql.datatypes.int.key.should.equal(pg.datatypes.int.key);
                // allow null
                mysql.datatypes.int.allowNull.should.equal(false);
                mysql.datatypes.int.allowNull.should.equal(pg.datatypes.int.allowNull);

should.deepEqual(pg.datatypes, { 
    boolean: { type: 'boolean', allowNull: true, key: '', defaultValue: null },
    smallint: { type: 'smallint', allowNull: true, key: '', defaultValue: null },
    int: { type: 'integer', allowNull: false, key: 'pri',defaultValue: null },
    integer: { type: 'integer', allowNull: true, key: '', defaultValue: null },
    bigint: { type: 'bigint', allowNull: true, key: '', defaultValue: null },
    real: { type: 'real', allowNull: true, key: '', defaultValue: null },
    float: { type: 'double', allowNull: true, key: '', defaultValue: null },
    'float(3)': { type: 'real', allowNull: true, key: '', defaultValue: null },
    double: { type: 'double', allowNull: true, key: '', defaultValue: null },
    decimal: { type: 'decimal', allowNull: true, key: '', defaultValue: null },
    'decimal(6)': { type: 'decimal(6,0)', allowNull: true, key: '', defaultValue: null },
    'decimal(6,2)': { type: 'decimal(6,2)', allowNull: true, key: '', defaultValue: null },
    numeric: { type: 'decimal', allowNull: true, key: '', defaultValue: null },
    'numeric(20)': { type: 'decimal(20,0)', allowNull: true, key: '', defaultValue: null },
    'numeric(20,5)': { type: 'decimal(20,5)', allowNull: true, key: '', defaultValue: null },
    date: { type: 'date', allowNull: true, key: '', defaultValue: null },
    time: { type: 'time', allowNull: true, key: '', defaultValue: null },
    timestamp: { type: 'timestamp', allowNull: true, key: '', defaultValue: null },
    bit: { type: 'bit(1)', allowNull: true, key: '', defaultValue: null },
    char: { type: 'char(1)', allowNull: true, key: '', defaultValue: null },
    'varchar(45)': { type: 'varchar(45)', allowNull: true, key: '', defaultValue: null },
    text: { type: 'text', allowNull: true, key: '', defaultValue: null }
});

                done();
            });
        });
    });
});
