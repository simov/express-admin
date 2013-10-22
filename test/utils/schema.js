
var fs = require('fs'),
    path = require('path'),
    should = require('should');
var db = require('../../lib/utils/database'),
    Schema = require('../../lib/utils/schema');


describe('schema', function () {
    var schema = null;
    before(function (done) {
        db.connect({user: 'liolio', password: 'karamba'}, function (err) {
            if (err) return done(err);
            db.use('express-admin-simple', function (err) {
                if (err) return done(err);
                schema = new Schema(db);
                done();
            });
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
    it('get schema references', function (done) {
        schema.getReferences(function (err, ref) {
            if (err) return done(err);
            var tables = Object.keys(ref);
            should.deepEqual(tables, ['property','purchase','recipe','recipe_ref','type']);
            // may test column properties too
            done();
        });
    });
    it('get table indexes', function (done) {
        schema.getIndexes('purchase', function (err, indexes) {
            if (err) return done(err);
            Object.keys(indexes).join()
                .should.equal('PRIMARY,fk_purchase_user_idx,fk_purchase_item1_idx');
            done();
        });
    });
    it('get schema indexes', function (done) {
        schema.getAllIndexes(function (err, indexes) {
            if (err) return done(err);
            var tables = Object.keys(indexes);
            tables.join().should.equal(
                'item,property,purchase,recipe,recipe_ref,recipe_type,subtype,type,user');
            // may test column properties too
            done();
        });
    });
});
