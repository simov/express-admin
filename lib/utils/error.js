
function AdminError (message) {
	this.name = 'AdminError';
	this.message = message || 
		'All known errors are rendered back to the user in a friendly way.';
}
AdminError.prototype = new Error();
AdminError.prototype.constructor = AdminError;

function ValidationError (error) {
	this.name = 'ValidationError';
	this.message = error || '';
}
ValidationError.prototype = new Error();
ValidationError.prototype.constructor = ValidationError;


function DatabaseError (error) {
	this.name = 'DatabaseError';
	var column = '',
		message = '';
	switch (error.code) {
		case 'ER_DUP_ENTRY':
			// ER_DUP_ENTRY: Duplicate entry 'asd' for key 'name_UNIQUE'
			var key = error.message.match(/.*key '(.*)'.*/i)[1];
			column = error.indexes[key];
			message = error.message.split(':')[1].replace(key, column).trim();
			break;
		case 'ER_BAD_NULL_ERROR':
			// ER_BAD_NULL_ERROR: Column 'need_id' cannot be null
			column = error.message.match(/.*Column '(.*)'.*/i)[1];
			message = error.message.split(':')[1];
			break;
		default:
			// throw
			column = 'MySql Error';
			message = error.message;
			break;
	}
	this.message = {};
	this.message[error.prefix+column] = {
		type: 'Database Error!',
		message: message
	}
}
DatabaseError.prototype = new Error();
DatabaseError.prototype.constructor = DatabaseError;


exports.AdminError = AdminError;
exports.ValidationError = ValidationError;
exports.DatabaseError = DatabaseError;
