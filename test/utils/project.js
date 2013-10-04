
var fs = require('fs'),
	path = require('path'),
	recursive = require('recursive-fs'),
	should = require('should'),
	pwd = require('pwd');
var project = require('../../lib/utils/project');


describe('project', function () {
	var dpath = path.join(__dirname, 'project');

	before(function (done) {
		fs.mkdir(dpath, done);
	});

	it('the config files shouldn\'t exist', function (done) {
		project.exists(dpath).should.equal(false);
		done();
	});

	it('the config files should exist', function (done) {
		var data = {
			mysql: {
				database: 'express-admin-test',
				user: 'liolio',
				password: 'karamba'
			},
			server: {
				port: '3000'
			},
			user: {
				name: 'admin',
				pass: '11aaAA'
			}
		};

		project.create(dpath, data, function (err) {
			if (err) return done(err);
			project.exists(dpath).should.equal(true);
			done();
		});
	});

	it('the config data should be correct', function (done) {
		var c = {
			config: require('./project/config'),
			custom: require('./project/custom'),
			settings: require('./project/settings'),
			users: require('./project/users')
		};

		should.deepEqual(c.custom, {});
		should.deepEqual(c.settings, {});

		var config = {
			mysql: {
				database: 'express-admin-test',
				user: 'liolio',
				password: 'karamba'
			},
			server: {
				port: '3000'
			},
			app: {
				layouts: true,
				themes: true,
				languages: true
			}
		};
		should.deepEqual(c.config, config);

		// users
		c.users.admin.name.should.equal('admin');
		c.users.admin.root.should.equal(true);
		pwd.hash('11aaAA', c.users.admin.salt, function (err, hash) {
			if (err) return done(err);
			c.users.admin.hash.should.equal(hash);
			done();
		});
	});

	after(function (done) {
		recursive.rmdirr(dpath, function (err) {
			done(err);
		});
	});
});
