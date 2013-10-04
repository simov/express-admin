
var mysql = require('mysql'),
	c = mysql.createConnection({
		user: 'liolio',
		password: 'karamba',
		multipleStatements: true
	});
var db = require('../../lib/utils/database');


describe('database', function () {
	it('give error on connect', function (done) {
		db.connect({user: 'dsajhdka', password: 'jhsakjhsakd'}, function (err) {
			err.message.should.equal(
				'ER_ACCESS_DENIED_ERROR: Access denied for user '+
					'\'dsajhdka\'@\'localhost\' (using password: YES)');
			done();
		});
	});
	it('connect existing user', function (done) {
		db.connect({user: 'liolio', password: 'karamba'}, function (err) {
			if (err) return done(err);
			// db.connection ...
			done();
		});
	});

	it('missing privileges', function (done) {
		db.grants('ajskdljlj', function (err, grant) {
			if (err) return done(err);
			grant.should.equal(false);
			done();
		});
	});
	it('existing privileges', function (done) {
		db.grants('express-admin-simple', function (err, grant) {
			if (err) return done(err);
			grant.should.equal(true);
			done();
		});
	});

	it('non existing database', function (done) {
		db.exists('ajskdljlj', function (err, exist) {
			if (err) return done(err);
			exist.should.equal(false);
			done();
		});
	});
	it('existing database', function (done) {
		db.exists('express-admin-simple', function (err, exist) {
			if (err) return done(err);
			exist.should.equal(true);
			done();
		});
	});

	it('empty database', function (done) {
		db.empty('express-admin-empty', function (err, empty) {
			if (err) return done(err);
			empty.should.equal(true);
			done();
		});
	});
	it('not empty database', function (done) {
		db.empty('express-admin-simple', function (err, empty) {
			if (err) return done(err);
			empty.should.equal(false);
			done();
		});
	});

	it('use schema error', function (done) {
		db.use('mysql', function (err) {
			err.message.should.equal(
				"Access denied for user 'liolio'@'localhost' to database 'mysql'");
			done();
		});
	});
	it('use schema success', function (done) {
		db.use('express-admin-simple', function (err) {
			if (err) return done(err);
			db.connection.config.database.should.equal('express-admin-simple');
			done();
		});
	});
});
