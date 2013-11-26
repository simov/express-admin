
var fs = require('fs'),
    path = require('path'),
    should = require('should');
var db = require('../../lib/utils/database'),
    Schema = require('../../lib/utils/schema');


describe('schema', function () {
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
