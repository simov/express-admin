
var pwd = require('pwd');


/**
 * Create salt and hash for a given password.
 *
 * @param {String} name
 * @param {String} pass
 * @param {Boolean} admin
 * @param {Function} callback
 * @return {Object} user
 * @api public
 */

exports.create = function (name, pass, admin, cb) {
    pwd.hash(pass, function (err, salt, hash) {
        if (err) return cb(err);
        var user = {
            name: name,
            admin: admin,
            salt: salt,
            hash: hash
        };
        cb(null, user);
    });
}
