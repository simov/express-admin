(function (name, root, factory) {
	if (typeof exports == 'object') {
		module.exports = factory();
	} else if (typeof define == 'function' && define.amd) {
		define(factory);
	} else {
		root[name] = factory();
	}
}('file', this, function () {
	var api = {};

/**
 * Read a file.
 *
 * @param {String} path
 * @param {Function} callback
 * @return {String} xhr.responseText
 * @api public
 */

api.load = function (path, cb) {
	var xhr = new XMLHttpRequest(),
		params = '?preventCache='+new Date();
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			cb(null, xhr.responseText);
		}
	};
	xhr.open('GET', path+params, true);
	try {
		xhr.send();
	} catch (e) {
		return cb(new Error('Couldn\'t load file'));
	}
}

/**
 * Read a list of files.
 *
 * @param {Array} paths
 * @param {Function} callback
 * @return {Object} result
 * @api public
 */

api.loadList = function (paths, cb) {
	var result = {};
	(function loop (index) {
		if (index == paths.length) return cb(null, result);
		file.load(paths[index], function (err, text) {
			if (err) return cb(err);
			result[paths[index]] = text;
			loop(++index);
		});
	}(0));
}

	return api;
}));
