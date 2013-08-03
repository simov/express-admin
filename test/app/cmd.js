
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
        var params = [path.resolve(__dirname, '../../app.js'), 'non-existing-dir'];
        
        prompt.start(params, function (text) {
            text[0].should.equal('Config directory path doesn\'t exists!'.red);
            done();
        });
    });

    it('should prompt for data on non existent config files', function (done) {	
        var params = [path.resolve(__dirname, 'wrapper.js'), 'test/app/project'];
        // it's silly I know
        prompt.start(params, function (text) {
            text[0].should.equal('Database name:');
            prompt.next('express-admin-simple', function (text) {
                text[0].should.equal('Database user:');
                prompt.next('liolio', function (text) {
                    text[0].should.equal('Database password:');
                    prompt.next('karamba', function (text) {
                        text[0].should.equal('Server port:');
                        prompt.next('\n', function (text) {
                            text[0].should.equal('Admin user:');
                            prompt.next('admin', function (text) {
                                text[0].should.equal('Admin password:');
                                prompt.end('11aaAA', function (text) {
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
        
        prompt.start(params, true, function () {
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
