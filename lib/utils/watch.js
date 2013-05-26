
var fs = require('fs');
var recursive = require('recursive-fs');


/**
 * Watch for changes in a given directory.
 *
 * @param {String} path
 * @param {Function} callback
 * @api public
 */

exports.dir = function (path, cb) {
    recursive.readdirr(path, function (err, dir, file) {
        if (err) return cb(err);
        for (var i=0; i < dir.length; i++) {
            fs.watch(dir[i], onFileChanged);
        }
        cb();
    });
}

/**
 * Kill the process on file changed.
 *
 * @param {String} event
 * @param {String} filename
 * @api private
 */

function onFileChanged (event, filename) {	
    process.exit();
}
