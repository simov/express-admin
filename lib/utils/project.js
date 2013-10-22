
var fs = require('fs'),
	path = require('path');
var user = require('./user');


exports.exists = function (dpath) {
	return (
		fs.existsSync(path.join(dpath, 'config.json')) &&
		fs.existsSync(path.join(dpath, 'custom.json')) &&
		fs.existsSync(path.join(dpath, 'settings.json')) &&
		fs.existsSync(path.join(dpath, 'users.json'))
	)
	? true
	: false;
}

exports.create = function (dpath, data, cb) {
	// config
	var json = {
		mysql: data.mysql,
		server: data.server,
		app: {
			layouts: true,
			themes: true,
			languages: true
		}
	};
	fs.writeFileSync(path.join(dpath, 'config.json'), JSON.stringify(json, null, 4), 'utf8');
	// custom
	json = {};
	fs.writeFileSync(path.join(dpath, 'custom.json'), JSON.stringify(json, null, 4), 'utf8');
	// settings
	json = {};
	fs.writeFileSync(path.join(dpath, 'settings.json'), JSON.stringify(json, null, 4), 'utf8');
	// user
	json = {};
	user.create(data.user.name, data.user.pass, true, function (err, usr) {
		if (err) return cb(err);
		json[usr.name] = usr;
		fs.writeFileSync(path.join(dpath, 'users.json'), JSON.stringify(json, null, 4), 'utf8');
		cb();
	});
}
