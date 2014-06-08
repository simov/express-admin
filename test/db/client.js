
var path = require('path'),
    should = require('should');
var Client = require('../../lib/db/client'),
    sql = require('../../lib/sql/sql'),
    query = require('../../lib/sql/query');
// var sqlitedb = path.join(__dirname,
    // '../../../express-admin-examples/fixtures/sqlite-examples/db.sqlite');


describe.skip('client (db)', function () {

    describe('factory', function () {
        it('return an error on not supported db type', function (done) {
            var client = new Client({mongodb:{}});
            client.message.should.equal('Not supported database type!');
            done();
        });
        it('create db client instance based on config key', function (done) {
            should.exist((new Client({mysql:{}})).client.createConnection);
            should.exist((new Client({pg:{}})).client.Client);
            should.exist((new Client({sqlite:{}})).client.Database);
            done();
        });
    });


    describe('connect', function () {
        it('set global var for sql modules', function (done) {
            var client = new Client({mysql:{}});

            sql.client.mysql.should.equal(true);
            query.client.mysql.should.equal(true);

            sql.client.pg.should.equal(false);
            query.client.pg.should.equal(false);

            sql.client.sqlite.should.equal(false);
            query.client.sqlite.should.equal(false);
            done();
        });
        it.skip('mysql - connects to database', function (done) {
            var config = {mysql:
                {database:'express-admin-examples', user:'liolio', password:'karamba'}};
            var client = new Client(config);
            client.connect(config.mysql, function (err) {
                if (err) return done(err);
                client.config.schema.should.equal('express-admin-examples');
                client.connection.destroy();
                done();
            });
        });
        it.skip('pg - connects to database / set public schema by default', function (done) {
            var config = {pg:
                {database:'express-admin-examples', user:'liolio', password:'karamba'}};
            var client = new Client(config);
            client.connect(config.pg, function (err) {
                if (err) return done(err);
                client.config.schema.should.equal('public');
                client.connection.end();
                done();
            });
        });
        it.skip('pg - connects to database / set schema name through config', function (done) {
            var config = {pg: {database:'express-admin-examples', schema:'express',
                                user:'liolio', password:'karamba'}};
            var client = new Client(config);
            client.connect(config.pg, function (err) {
                if (err) return done(err);
                client.config.schema.should.equal('express');
                client.connection.end();
                done();
            });
        });
        it.skip('sqlite - connects to database', function (done) {
            var config = {sqlite:{database:sqlitedb}};
            var client = new Client(config);
            client.connect(config.sqlite, function (err) {
                if (err) return done(err);
                client.config.schema.should.equal('');
                client.connection.close();
                done();
            });
        });
    });


    describe.skip('query', function () {
        it('mysql - execute query', function (done) {
            var config = {mysql:
                {database:'express-admin-examples', user:'liolio', password:'karamba'}};
            var client = new Client(config);
            client.connect(config.mysql, function (err) {
                if (err) return done(err);
                client.query('select * from `user`;', function (err, rows) {
                    if (err) return done(err);
                    rows.length.should.equal(3);
                    client.connection.destroy();
                    done();
                });
            });
        });
        it('pg - execute query', function (done) {
            var config = {pg:
                {database:'express-admin-examples', user:'liolio', password:'karamba'}};
            var client = new Client(config);
            client.connect(config.pg, function (err) {
                if (err) return done(err);
                client.query('select * from "user";', function (err, rows) {
                    if (err) return done(err);
                    rows.length.should.equal(3);
                    client.connection.end();
                    done();
                });
            });
        });
        it('sqlite - execute query', function (done) {
            var config = {sqlite:{database:sqlitedb}};
            var client = new Client(config);
            client.connect(config.sqlite, function (err) {
                if (err) return done(err);
                client.query('select * from `user`;', function (err, rows) {
                    if (err) return done(err);
                    rows.length.should.equal(3);
                    client.connection.close();
                    done();
                });
            });
        });
        it.skip('pg - insert query', function (done) {
            // insert
            done(new Error('Not implemented!'));
            // remove
        });
        it.skip('sqlite - insert query', function (done) {
            // insert
            done(new Error('Not implemented!'));
            // remove
        });
    });

    describe.skip('mysql - column settings', function () {
        var columns = null;

        before(function (done) {
            var config = {mysql:
                {database:'express-admin-examples', user:'liolio', password:'karamba'}};
            var client = new Client(config);
            client.connect(config.mysql, function (err) {
                if (err) return done(err);
                var sql = query.replace('show-columns', 'controls', 'express-admin-examples');
                client.query(sql, function (err, rows) {
                    if (err) return done(err);

                    columns = client.getColumnsInfo(rows);
                    // console.log(JSON.stringify(columns, null, 4));
                    client.connection.destroy();
                    done();
                });
            });
        });
        it('set allow null', function (done) {
            columns.id.allowNull.should.equal(false);
            columns.text.allowNull.should.equal(true);
            done();
        });
        it('set pk', function (done) {
            columns.id.key.should.equal('pri');
            columns.text.key.should.equal('');
            done();
        });
        it.skip('set default value', function (done) {
            done();
        });
    });

    describe.skip('pg - column settings', function () {
        var columns = null;

        before(function (done) {
            var config = {pg:
                {database:'express-admin-examples', user:'liolio', password:'karamba'}};
            var client = new Client(config);
            client.connect(config.pg, function (err) {
                if (err) return done(err);
                var sql = query.replace('show-columns', 'controls', 'public');
                client.query(sql, function (err, rows) {
                    if (err) return done(err);
                    
                    columns = client.getColumnsInfo(rows);
                    // console.log(JSON.stringify(columns, null, 4));
                    client.connection.end();
                    done();
                });
            });
        });
        it('set allow null', function (done) {
            columns.id.allowNull.should.equal(false);
            columns.text.allowNull.should.equal(true);
            done();
        });
        it('set pk', function (done) {
            columns.id.key.should.equal('pri');
            columns.text.key.should.equal('');
            done();
        });
        it.skip('set default value', function (done) {
            done();
        });
    });

    describe.skip('sqlite - column settings', function () {
        var columns = null;

        before(function (done) {
            var config = {sqlite:{database:sqlitedb}};
            var client = new Client(config);
            client.connect(config.sqlite, function (err) {
                if (err) return done(err);
                var sql = query.replace('show-columns', 'controls', '');
                client.query(sql, function (err, rows) {
                    if (err) return done(err);
                    
                    columns = client.getColumnsInfo(rows);
                    // console.log(JSON.stringify(columns, null, 4));
                    client.connection.close();
                    done();
                });
            });
        });
        it('set allow null', function (done) {
            columns.text.allowNull.should.equal(true);
            done();
        });
        it('set pk', function (done) {
            columns.text.key.should.equal('');
            done();
        });
        it.skip('set default value', function (done) {
            done();
        });
    });


    describe.skip('pg - data types', function () {
        var columns = null;

        before(function (done) {
            var config = {pg:
                {database:'express-admin-examples', user:'liolio', password:'karamba'}};
            var client = new Client(config);
            client.connect(config.pg, function (err) {
                if (err) return done(err);
                var sql = query.replace('show-columns', 'controls', 'public');
                client.query(sql, function (err, rows) {
                    if (err) return done(err);
                    
                    columns = client.getColumnsInfo(rows);
                    // console.log(JSON.stringify(columns, null, 4));
                    client.connection.end();
                    done();
                });
            });
        });
        it('double precision', function (done) {
            columns.double.type.should.equal('double');
            done();
        });
        it.skip('numeric', function (done) {
            
            done();
        });
        it.skip('numeric(0,0)', function (done) {
            
            done();
        });
        it('time without time zone', function (done) {
            columns.time.type.should.equal('time');
            done();
        });
        it('timestamp without time zone', function (done) {
            columns.datetime.type.should.equal('timestamp');
            done();
        });
        it.skip('character', function (done) {
            
            done();
        });
        it('character varying', function (done) {
            columns.text.type.should.equal('varchar(45)');
            done();
        });
        it('boolean', function (done) {
            columns.boolean.type.should.equal('char');
            done();
        });
    });
});
