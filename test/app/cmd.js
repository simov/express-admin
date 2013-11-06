
var fs = require('fs'),
    path = require('path'),
    should = require('should'),
    recursive = require('recursive-fs');
require('colors');

var prompt = require('../common/prompt');


describe('command line', function () {
    before(function (done) {
        var dpath = path.resolve(__dirname, 'project');
        recursive.rmdirr(dpath, function (err) {
            fs.mkdirSync(path.resolve(__dirname, 'project'));
            done();
        });
    });

    it('should return an error on non existent directory', function (done) {
        var params = [path.resolve(__dirname, '../../app.js'), 'non-existing-dir'],
            expected = 'Config directory path doesn\'t exists!'.red;
        
        prompt.start(params, expected, function (err) {
            done(err);
        });
    });

    it('should prompt for data on non existent config files', function (done) {	
        var params = [path.resolve(__dirname, 'wrapper.js'), 'test/app/project'];
        var data = [
            {in: 'express-admin-simple', out: 'Database user:'},
            {in: 'liolio', out: 'Database password:'},
            {in: 'karamba', out: 'Server port:'},
            {in: '\n', out: 'Admin user:'},
            {in: 'admin', out: 'Admin password:'},
            {in: '11aaAA', out: 'end'}
        ];
        prompt.start(params, 'Database name:', function (err) {
            (function loop (i, cb) {
                if (i == 6) return cb();
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

    it('should start the admin on existent config files', function (done) {
        var params = [path.resolve(__dirname, 'wrapper.js'), 'test/app/project'];
        
        prompt.start(params, 'end', function () {
            done();
        });
    });

    after(function (done) {
        var dpath = path.resolve(__dirname, 'project');
        recursive.rmdirr(dpath, function (err) {
            done(err);
        });
    });
});
