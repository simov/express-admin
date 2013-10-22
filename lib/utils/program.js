
var path = require('path'),
	program = require('commander'),
	validate = require('./validate');
require('colors');


program
	.option('[path]', 'start the admin configured with [path]')
	// .option('-w, --watch  [path]', 'watch for changes in your config [path]')
	.option('-v, --dev    [path]', 'development mode: authentication,CSRF are off [path]')
.parse(process.argv);


/**
 * Get the path to the user's configuration directory.
 *
 * @return {String} path
 * @api public
 */

program.getConfigPath = function () {
	var dpath = null;
	switch (true) {
		case 'string' == typeof this.watch:
			dpath = this.watch;
			break;
		case 'string' == typeof this.dev:
			dpath = this.dev;
			break;
		case this.args.length > 0:
			dpath = this.args[0];
			break;
		default:
			dpath = '';
	}
	return dpath;
}

/**
 * Prompt for database credentials.
 *
 * @param {Function} callback
 * @return {Object} database credentials data
 * @api private
 */

program.promptForDatabase = function (cb) {
	var text = ['Database name: ', 'Database user: ', 'Database password: '],
		keys = ['database', 'user', 'password'],
		data = { mysql: {} },
		self = this;
	function prompt (text, cb) {
		self.prompt(text, function (input) {
			if (input == '') {
				console.log('Database credentials are required!'.red);
				return prompt(text, cb);
			}
			cb(input);
		});
	}
	function loop (i) {
		if (i == keys.length) return cb(null, data);
		prompt(text[i], function (input) {
			data.mysql[keys[i]] = input;
			loop(++i);
		});
	}
	loop(0);
}

/**
 * Prompt for server configuration.
 *
 * @param {Function} callback
 * @return {Object} server configuration data
 * @api private
 */

program.promptForServer = function (cb) {
	var data = { server: {} };
	this.prompt('Server port: ', Number, function (input) {
		data.server.port = (input == 0) ? 3000 : input;
		cb(null, data);
	});
}

/**
 * Prompt for admin credentials.
 *
 * @param {Function} callback
 * @return {Object} admin credentials data
 * @api private
 */

program.promptForAdmin = function (cb) {
	var self = this;
	function user (cb) {
		self.prompt('Admin user: ', function (input) {
			if (input == '') {
				console.log('Administrator user name is required!'.red);
				return user(cb);
			}
			cb(input);
		});
	}

	function pass (cb) {
		self.prompt('Admin password: ', function (input) {
			if (!validate.adminPassword(input)) {
				console.log((
					'Must contains at least:\n'+
					'2 lower case letters, 2 upper case letters '+
					'and 2 digits').red);
				return pass(cb);
			}
			cb(input);
		});
	}
	user(function (name) {
		pass(function (password) {
			var data = { user: { name: name, pass: password } };
			cb(null, data);
		});
	});
}

/**
 * Prompt the user for required settings
 *
 * @param {Function} callback
 * @return {Object} data collected from the user
 * @api public
 */

program.promptForData = function (cb) {
	var func = ['promptForDatabase', 'promptForServer', 'promptForAdmin'],
		result = {},
		self = this;
	function loop (index) {
		if (index == func.length) return cb(null, result);
		self[func[index]](function (err, data) {
			if (err) return cb(err);
			var key = Object.keys(data)[0];
			result[key] = data[key];
			loop(++index);
		})
	}
	loop(0);
}

exports = module.exports = program;
