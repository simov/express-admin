
require('colors');

var prompt = require('./prompt');


describe('prompt', function () {
    before(function (done) {
        prompt.start(function (text) {
            text[0].should.equal('Database name:');
            done();
        });
    });

    // database
    it('return error message on missing database credentials', function (done) {
        prompt.next('\n', 2, function (text) {
            text[0].should.equal('Database credentials are required!'.red);
            text[1].should.equal('Database name:');
            done();
        });
    });
    it('get database name', function (done) {
        prompt.next('express-admin', function (text) {
            text[0].should.equal('Database user:');
            done();
        });
    });
    it('get database user', function (done) {
        prompt.next('liolio', function (text) {
            text[0].should.equal('Database password:');
            done();
        });
    });
    it('get database password', function (done) {
        prompt.next('karamba', function (text) {
            text[0].should.equal('Server port:');
            done();
        });
    });

    // server
    it('get server port', function (done) {
        prompt.next('4444', function (text) {
            text[0].should.equal('Admin user:');
            done();
        });
    });
    
    // admin
    it('return error message on missing admin user name', function (done) {
        prompt.next('\n', 2, function (text) {
            text[0].should.equal('Administrator user name is required!'.red);
            text[1].should.equal('Admin user:');
            done();
        });
    });
    it('get admin user name', function (done) {
        prompt.next('admin', function (text) {
            text[0].should.equal('Admin password:');
            done();
        });
    });
    it('return error message on invalid password', function (done) {
        prompt.next('aa11Aa', 2, function (text) {
            text[0].should.equal((
                'Must contains at least:\n'+
                '2 lower case letters, 2 upper case letters and 2 digits').red);
            text[1].should.equal('Admin password:');
            done();
        });
    });
    it('get admin password', function (done) {
        prompt.next('aa11AA', function (data) {
            var json = JSON.parse(data);
            if (json.err) return done(new Error(json.err));
            json.mysql.database.should.equal('express-admin');
            json.mysql.user.should.equal('liolio');
            json.mysql.password.should.equal('karamba');
            json.server.port.should.equal(4444);
            json.user.name.should.equal('admin');
            json.user.pass.should.equal('aa11AA');
            done();
        });
    });
    
    after(function (done) {
        done();
    });
});
