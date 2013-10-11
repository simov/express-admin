
exports.admin = function (input) {
	
}

/**
 * Admin password should have at least 2*A-Z, 2*a-z, 2*0-9.
 *
 * @param {String} input
 * @return {Boolean} valid
 * @api public
 */

exports.adminPassword = function (input) {
	function check (regex) {
		var match = input.match(regex);
		if (match && match.length > 1) return true;
		return false;
	}
	return check(/[A-Z]/g) && check(/[a-z]/g) && check(/[0-9]/g)
		? true : false;
}
