
var fs = require('fs'),
    path = require('path'),
    recursive = require('recursive-fs'),
    should = require('should'),
    pwd = require('pwd');
var project = require('../../lib/app/project');


describe('project', function () {
    var dpath = path.join(__dirname, 'project');
    var data = {
        mysql: {database: 'express-admin-test', user: 'liolio', password: 'karamba'},
        server: {port: '3000'},
        user: {name: 'admin', pass: '11aaAA'}
    };

    before(function (done) {
        fs.mkdir(dpath, done);
    });

    it('the config files shouldn\'t exist', function (done) {
        project.exists(dpath).should.equal(false);
        done();
    });

    it('the config files should exist', function (done) {
        project.create(dpath, data, function (err) {
            if (err) return done(err);
            project.exists(dpath).should.equal(true);
            done();
        });
    });

    it('the config data should be correct', function (done) {
        
        should.deepEqual(require('./project/custom'), {});
        should.deepEqual(require('./project/settings'), {});
        should.deepEqual(require('./project/config'), data);

        var users = require('./project/users');
        users.admin.name.should.equal('admin');
        users.admin.admin.should.equal(true);
        pwd.hash('11aaAA', users.admin.salt, function (err, hash) {
            if (err) return done(err);
            users.admin.hash.should.equal(hash);
            done();
        });
    });

    after(function (done) {
        recursive.rmdirr(dpath, function (err) {
            done(err);
        });
    });
});
