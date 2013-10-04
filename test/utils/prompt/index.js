
var path = require('path');
require('colors');

var prompt = require('../../common/prompt');


describe('prompt', function () {
	before(function (done) {
		var params = [path.resolve(__dirname, 'wrapper.js')];

		prompt.start(params, 'Database name:', function (err) {
			done(err);
		});
	});

	// database
	it('return error message on missing database credentials', function (done) {
		var expected = 'Database credentials are required!'.red
					+ 'Database name:';
		prompt.next('\n', expected, function (err) {
			done(err);
		});
	});
	it('get database name', function (done) {
		prompt.next('express-admin', 'Database user:', function (err) {
			done(err);
		});
	});
	it('get database user', function (done) {
		prompt.next('liolio', 'Database password:', function (err) {
			done(err);
		});
	});
	it('get database password', function (done) {
		prompt.next('karamba', 'Server port:', function (err) {
			done(err);
		});
	});

	// server
	it('get server port', function (done) {
		prompt.next('4444', 'Admin user:', function (err) {
			done(err);
		});
	});
	
	// admin
	it('return error message on missing admin user name', function (done) {
		var expected = 'Administrator user name is required!'.red
					+ 'Admin user:';
		prompt.next('\n', expected, function (err) {
			done(err);
		});
	});
	it('get admin user name', function (done) {
		prompt.next('admin', 'Admin password:', function (err) {
			done(err);
		});
	});
	it('return error message on invalid password', function (done) {
		var expected = ('Must contains at least:'
				+ '2 lower case letters, 2 upper case letters and 2 digits').red
				+ 'Admin password:';
		prompt.next('aa11Aa', expected, function (err) {
			done(err);
		});
	});
	it('get admin password', function (done) {
		var expected = '{"mysql":{"database":"express-admin","user":"liolio","password":"karamba"},"server":{"port":4444},"user":{"name":"admin","pass":"aa11AA"}}';
		prompt.next('aa11AA', expected, function (err) {
			done(err);
		});
	});
	
	after(function (done) {
		done();
	});
});
