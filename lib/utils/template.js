
var moment = require('moment'),
	validator = require('mysql-validator');
var query = require('./query'),
	sql = require('./sql');


exports.value = function (column, value) {
	
	if (value === '') {
		if (column.defaultValue) {
			value = column.defaultValue;
		} else if (column.allowNull) {
			return '';
		} else {
			return value;
		}
	}
	
	switch (true) {
		case column.control.date:
			// mysql.typeCast is disabled
			if (!value) return null;
			if (moment(value, 'YYYY-MM-DD').isValid()) {
				var formatted = moment(value).format('YYYY-MM-DD');
			}
			return formatted;

		case column.control.multiple:
			return setActiveMultiple(column, value);
		
		case column.control.select:
			return setActiveSingle(column, value);

		default:
			return value;
	}
}

function setActiveSingle (column, value) {
	if (!column.value) return value;
	var rows = column.value;
	for (var i=0; i < rows.length; i++) {
		if (parseInt(rows[i]['__pk']) === parseInt(value)) {
			rows[i].selected = true;
			return rows;
		}
	}
	return rows;
}

function setActiveMultiple (column, value) {
	if (!column.value) return value;
	var rows = column.value;
	for (var i=0; i < rows.length; i++) {
		var pk = parseInt(rows[i]['__pk']);
		value = (value instanceof Array) ? value : [value];
		for (var j=0; j < value.length; j++) {
			if (pk === parseInt(value[j])) {
				rows[i].selected = true;
				break;
			}
		}
	}
	return rows;
}

exports.validate = function (column, value) {
	
	if (value === '' || value === 'NULL' || value === null
		|| (value instanceof Array && !value.length)) {
		// should check for column.defaultValue too
		if (!column.allowNull) {
			return new Error('Column '+column.name+' cannot be empty.');
		} else {
			return null;
		}
	}

	return validator.check(value, column.type);
}

exports.test = {
	setActiveSingle: setActiveSingle,
	setActiveMultiple: setActiveMultiple
};
