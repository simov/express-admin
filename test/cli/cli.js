
var path = require('path');
require('colors');
var prompt = require('./prompt');


describe('arguments (cli)', function () {
    var mpath = path.resolve(__dirname, 'wrapper.js'),
        tpath = path.resolve('../some/test/path');

    it('get config path without flags', function (done) {
        var params = [mpath, tpath, '-test-args'];
        prompt.start(params, tpath, done);
    });
    
    it('get config path from --dev flag', function (done) {
        var params = [mpath, '-v', tpath, '-test-args'];
        prompt.start(params, tpath, done);
    });
});

describe('prompt for mysql (cli)', function () {
    before(function (done) {
        var params = [path.resolve(__dirname, 'wrapper.js'), '-test-prompt'];

        prompt.start(params, 'Database type:', done);
    });

    // database
    it('return error message on wrong database type', function (done) {
        var expected = 'Valid database type is: mysql, sqlite or pg!'.red
                        + 'Database type:';
        prompt.next('mariadb', expected, done);
    });
    it('set mysql as default database type', function (done) {
        prompt.next('\n', 'Database name:', done);
    });
    it('return error message on missing database credentials', function (done) {
        var expected = 'Database credentials are required!'.red + 'Database name:';
        prompt.next('\n', expected, done);
    });
    it('prompt for database name', function (done) {
        prompt.next('express-admin', 'Database user:', done);
    });
    it('prompt for database user', function (done) {
        prompt.next('liolio', 'Database password:', done);
    });
    it('prompt for database password', function (done) {
        prompt.next('karamba', 'Server port:', done);
    });

    // server
    it('set 3000 as default server port', function (done) {
        prompt.next('\n', 'Admin user:', done);
    });
    
    // admin
    it('return error message on missing admin user name', function (done) {
        var expected = 'Administrator user name is required!'.red + 'Admin user:';
        prompt.next('\n', expected, done);
    });
    it('prompt for admin user name', function (done) {
        prompt.next('admin', 'Admin password:', done);
    });
    it('return error message on invalid password', function (done) {
        var expected = ('Must contains at least:'
                + '2 lower case letters, 2 upper case letters and 2 digits').red
                + 'Admin password:';
        prompt.next('11aaAa', expected, done);
    });
    it('have mysql set up', function (done) {
        var expected = '{"mysql":{"database":"express-admin","user":"liolio",'+
            '"password":"karamba"},"server":{"port":3000},'+
            '"user":{"name":"admin","pass":"11aaAA"}}';
        prompt.next('11aaAA', expected, done);
    });
});

describe('prompt for pg (cli)', function () {
    before(function (done) {
        var params = [path.resolve(__dirname, 'wrapper.js'), '-test-prompt'];

        prompt.start(params, 'Database type:', function () {
            prompt.next('pg', 'Database name:', function () {
                prompt.next('express-admin', 'Database user:', function () {
                    prompt.next('liolio', 'Database password:', done);
                });
            });
        });
    });

    it('prompt for database schema', function (done) {
        prompt.next('karamba', 'Database schema:', done);
    });
    it('use the public schema by default', function (done) {
        prompt.next('\n', 'Server port:', done);
    });
    it('set the server port', function (done) {
        prompt.next('4444', 'Admin user:', function () {
            prompt.next('admin', 'Admin password:', done);
        });
    });
    it('have pg set up', function (done) {
        var expected = '{"pg":{"database":"express-admin","user":"liolio",'+
            '"password":"karamba","schema":"public"},"server":{"port":4444},'+
            '"user":{"name":"admin","pass":"11aaAA"}}';
        prompt.next('11aaAA', expected, done);
    });
});
