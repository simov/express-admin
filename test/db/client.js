
var path = require('path'),
    should = require('should');
var Client = require('../../lib/db/client'),
    sql = require('../../lib/sql/sql'),
    query = require('../../lib/sql/query');


describe('client (db)', function () {

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

    describe('mysql', function () {
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
        it('connects to database', function (done) {
            var config = {mysql:
                {database:'express-admin-simple', user:'liolio', password:'karamba'}};
            var client = new Client(config);
            client.connect(config.mysql, function (err) {
                if (err) return done(err);
                client.config.schema.should.equal('express-admin-simple');
                client.connection.destroy();
                done();
            });
        });
        // .query() ...
    });

    describe('pg', function () {
        it('connects to database / set public schema by default', function (done) {
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
        it('connects to database / set schema name through config', function (done) {
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
    });

    describe('sqlite', function () {
        it('connects to database', function (done) {
            var config = {sqlite:{database:path.join(__dirname, '../../../express-admin-examples/fixtures/sqlite-examples/db.sqlite')}};
            var client = new Client(config);
            client.connect(config.sqlite, function (err) {
                if (err) return done(err);
                client.config.schema.should.equal('');
                client.connection.close();
                done();
            });
        });
    });
});
