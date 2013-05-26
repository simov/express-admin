
var path = require('path'),
    fork = require('child_process').fork;


describe('arguments', function () {
    var mpath = path.resolve(__dirname, 'wrapper.js'),
        tpath = path.resolve('../some/test/path');

    it('get config path without flags', function (done) {
        var child = fork(mpath, [tpath]);
        child.on('message', function (message) {
            message.path.should.equal(tpath);
            child.kill();
            done();
        });
        // child.send({ hello: 'world' });
    });
    it.skip('get config path from --watch flag', function (done) {
        var child = fork(mpath, ['-w', tpath]);
        child.on('message', function (message) {
            message.path.should.equal(tpath);
            child.kill();
            done();
        });
    });
    it('get config path from --dev flag', function (done) {
        var child = fork(mpath, ['-v', tpath]);
        child.on('message', function (message) {
            message.path.should.equal(tpath);
            child.kill();
            done();
        });
    });
    it.skip('get config path from multiple flags', function (done) {
        var child = fork(mpath, ['-wve', tpath]);
        child.on('message', function (message) {
            message.path.should.equal(tpath);
            child.kill();
            done();
        });
    });
});
