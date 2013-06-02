
require('colors');

var prompt = require('./prompt');


describe('prompt', function () {
    before(function (done) {
        prompt.start(function () {
            done();
        });
    });

    // database
    it('return error message on missing database credentials', function (done) {
        prompt.next('\n',
        function error (text) {
            // text.should.equal('Database credentials are required!'.red);
        },
        function success (text) {
            text.should.equal('Database name:');
            done();
        });
    });
    it('get database name', function (done) {
        prompt.next('express-admin', null,
        function success (text) {
            text.should.equal('Database user:');
            done();
        });
    });
    it('get database user', function (done) {
        prompt.next('liolio', null,
        function success (text) {
            text.should.equal('Database password:');
            done();
        });
    });
    it('get database password', function (done) {
        prompt.next('karamba', null,
        function success (text) {
            text.should.equal('Server port:');
            done();
        });
    });

    // server
    it('get server port', function (done) {
        prompt.next('4444', null,
        function success (text) {
            text.indexOf('Admin user:').should.not.equal(-1);
            done();
        });
    });
    
    // admin
    it('return error message on missing admin user name', function (done) {
        prompt.next('\n',
        function error (text) {
            // text.should.equal('Administrator user name is required!'.red);
        },
        function success (text) {
            // text.should.equal('Admin user:');
            text.indexOf('Admin user:').should.not.equal(-1);
            done();
        });
    });
    it('get admin user name', function (done) {
        prompt.next('admin', null,
        function success (text) {
            text.should.equal('Admin password:');
            done();
        });
    });
    it('return error message on invalid password', function (done) {
        prompt.next('aa11Aa',
        function error (text) {
            // text.should.equal((
            // 	'Must contains at least:\n'+
            // 	'2 lower case letters, 2 upper case letters,'+
            // 	'2 digits').red);
        },
        function success (text) {
            // text.should.equal('Admin password:');
            text.indexOf('Admin password:').should.not.equal(-1);
            done();
        });
    });
    it('get admin password', function (done) {
        prompt.next('aa11AA', null,
        function success (data) {
            var json = JSON.parse(data);
            if (json.err) return done(new Error(json.err));
            json.database.name.should.equal('express-admin');
            json.database.user.should.equal('liolio');
            json.database.password.should.equal('karamba');
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
