
var fs = require('fs'),
    path = require('path'),
    should = require('should'),
    recursive = require('recursive-fs');
require('colors');
var prompt = require('./prompt');


describe('app (cli)', function () {
    before(function (done) {
        var dpath = path.resolve(__dirname, 'project');
        recursive.rmdirr(dpath, function (err) {
            fs.mkdirSync(path.resolve(__dirname, 'project'));
            done();
        });
    });

    it('return an error on non existing directory', function (done) {
        var params = [
            path.resolve(__dirname, 'wrapper.js'), 'non-existing-dir', '-test-app'],
            expected = 'Config directory path doesn\'t exists!'.red;
        
        prompt.start(params, expected, function (err) {
            done(err);
        });
    });

    it('prompt for data on non existing config files', function (done) {	
        var params = [
            path.resolve(__dirname, 'wrapper.js'),
            path.resolve(__dirname, 'project'), '-test-app'];
        var data = [
            {in: 'mysql', out: 'Database name:'},
            {in: 'express-admin-simple', out: 'Database user:'},
            {in: 'liolio', out: 'Database password:'},
            {in: 'karamba', out: 'Server port:'},
            {in: '\n', out: 'Admin user:'},
            {in: 'admin', out: 'Admin password:'},
            {in: '11aaAA', out: 'end'}
        ];
        prompt.start(params, 'Database type:', function (err) {
            if (err) return done(err);
            (function loop (i, cb) {
                if (i == data.length) return cb();
                prompt.next(data[i].in, data[i].out, function (err) {
                    if (err) return cb(err);
                    loop(++i, cb);
                });
            }(0, function (err) {
                if (err) return done(err);
                should.deepEqual(require('./project/custom'), {});
                should.deepEqual(require('./project/settings'), {});
                should.deepEqual(require('./project/config'), {
                    mysql: {database: 'express-admin-simple', user: 'liolio', password:'karamba'},
                    server: {port: 3000},
                    app: {layouts: true, themes: true, languages: true}
                });
                JSON.stringify(require('./project/users'))
                    .should.match(/\{"admin":\{"name":"admin","admin":true,"salt":".*","hash":".*"\}\}/);
                done();
            }));
        });
    });

    it('start the admin on existing config files', function (done) {
        var params = [
            path.resolve(__dirname, 'wrapper.js'),
            path.resolve(__dirname, 'project'), '-test-app'];
        
        prompt.start(params, 'end', function () {
            done();
        });
    });

    after(function (done) {
        var dpath = path.resolve(__dirname, 'project');
        recursive.rmdirr(dpath, done);
    });
});
