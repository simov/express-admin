
var fs = require('fs'),
    path = require('path'),
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
        // it's silly I know
        prompt.start(params, 'Database name:', function (err) {
            prompt.next('express-admin-simple', 'Database user:', function (err) {
                prompt.next('liolio', 'Database password:', function (err) {
                    prompt.next('karamba', 'Server port:', function (err) {
                        prompt.next('\n', 'Admin user:', function (err) {
                            prompt.next('admin', 'Admin password:', function (err) {
                                prompt.next('11aaAA', 'end', function (err) {
                                    JSON.stringify(require('./project/custom')).should.equal('{}');
                                    JSON.stringify(require('./project/settings')).should.equal('{}');
                                    JSON.stringify(require('./project/config')).should.equal('{"mysql":{"database":"express-admin-simple","user":"liolio","password":"karamba"},"server":{"port":3000},"app":{"layouts":true,"themes":true,"languages":true}}');
                                    JSON.stringify(require('./project/users')).should.match(/\{"admin":\{"name":"admin","root":true,"salt":".*","hash":".*"\}\}/);
                                    done();
                                });
                            });
                        });
                    });
                });
            });
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
