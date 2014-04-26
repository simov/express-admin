
var fs = require('fs'),
    path = require('path'),
    should = require('should');
var app = require('../../app');


describe('database initialization', function () {

    it('return an error on wrong database', function (done) {
        var args = {config: {mysql:{
            database:'non-existent', user: 'liolio', password: 'karamba'
        }}};
        app.initDatabase(args, function (err) {
            err.code.should.equal('ER_DBACCESS_DENIED_ERROR');
            err.message.should.equal("ER_DBACCESS_DENIED_ERROR: Access denied for user 'liolio'@'localhost' to database 'non-existent'");
            done();
        });
    });

    it('return an error on wrong user name', function (done) {
        var args = {config: {mysql:{
            database:'express-admin-simple', user: 'liolio1', password: 'karamba'
        }}};
        app.initDatabase(args, function (err) {
            err.message.should.equal("ER_ACCESS_DENIED_ERROR: Access denied for user 'liolio1'@'localhost' (using password: YES)");
            done();
        });
    });

    it('return an error on wrong user\'s password', function (done) {
        var args = {config: {mysql:{
            database:'express-admin-simple', user: 'liolio', password: 'karamba1'
        }}};
        app.initDatabase(args, function (err) {
            err.message.should.equal("ER_ACCESS_DENIED_ERROR: Access denied for user 'liolio'@'localhost' (using password: YES)");
            done();
        });
    });

    it('return an error on empty schema', function (done) {
        var args = {
            config: {mysql:{
                database:'express-admin-empty', user: 'liolio', password: 'karamba'
            }},
            dpath: __dirname,
            settings: {}
        };
        app.initDatabase(args, function (err) {
            err.message.should.equal('Empty schema!');
            done();
        });
    });

    it('write the settings to the hard drive', function (done) {
        var args = {
            config: {mysql:{
                database:'express-admin-simple', user: 'liolio', password: 'karamba'
            }},
            dpath: __dirname,
            settings: {}
        };
        app.initDatabase(args, function (err) {
            if (err) return done(err);
            should.notDeepEqual(require(path.join(__dirname, 'settings.json')), {});
            done();
        });
    });

    it('refresh the settings', function (done) {
        var args = {
            config: {mysql:{
                database:'express-admin-simple', user: 'liolio', password: 'karamba'
            }},
            dpath: __dirname,
            settings: {}
        };
        app.initDatabase(args, function (err) {
            if (err) return done(err);
            should.notDeepEqual(args.settings, {});
            done();
        });
    });

    after(function () {
        fs.unlinkSync(path.join(__dirname, 'settings.json'));
    });
});
