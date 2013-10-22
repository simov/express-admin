
/**
 * Convert table and column names into
 * `tableName`.`columnName`
 *
 * @param {Array} columns
 * @param {String} table
 * @return {String}
 * @api public
 */

exports.fullName = function (table, column) {
	return ['`',table,'`.`',column,'`'].join('');
}

/**
 * Convert array of column names into
 * `tableName`.`columnName`
 *
 * @param {String} table
 * @param {Array} columns
 * @return {Array} result
 * @api public
 */

exports.fullNames = function (table, columns) {
	var result = [];
	for (var i=0; i < columns.length; i++) {
		result.push(['`',table,'`.`',columns[i],'`'].join(''));
	}
	return result;
}

/**
 * Convert array of column names into
 * CAST(columnName AS CHAR)
 * @tip: pass in fullNames(columns, table) as a parameter
 *
 * @param {Array} columns
 * @return {Array} result
 * @api public
 */

exports.cast = function (columns) {
	var result = [];
	for (var i=0; i < columns.length; i++) {
		result.push(['CAST(',columns[i],' AS CHAR)'].join(''));
	}
	return result;
}

/**
 * Concat array of columns and
 * select them as name
 * @tip: pass in cast(columns) and fk as parameters
 *
 * @param {Array} columns
 * @param {String} name
 * @return {String}
 * @api public
 */

exports.concat = function (columns, name) {
	return ['CONCAT_WS(\' \',',columns.join(),') AS `',name,'`'].join('');
}

/**
 * Returns a primary key statement.
 *
 * @param {String} table
 * @return {String} pk
 * @api public
 */

exports.pk = function (table, pk) {
	return this.fullName(table, pk).concat(' AS __pk');
}

 /**
 * Convert a list of order key/value pairs
 * into `table`.`column1` order, `table`.`column2` order, ...
 *
 * @param {String} table
 * @param {Object} list
 * @return {Array} result
 * @api public
 */

exports.order = function (table, list) {
	var result = [];
	for (var column in list) {
		var order = list[column];
		result.push([this.fullName(table, column), order].join(' '));
	}
	return result;
}

/**
 * Return a join statement.
 *
 * @param {String} table
 * @param {String} fk
 * @param {String} refTable
 * @param {String} pk
 * @return {String}
 * @api public
 */

exports.joins = function (table, fk, refTable, pk) {
	return [' JOIN `',refTable,'` ON ',
			this.fullName(table, fk),' = ',
			this.fullName(refTable, pk)].join('');
}

/**
* Converts a list of `table`.`column`s and a list of values 
* into a WHERE statment: WHERE `table`.`column` = value AND ...
* @tip: pass in fullNames(columns, table) as the first parameter
*
* @param {Object} columns
* @param {Object} values
* @return {String}
* @api public
*/
exports.where = function (filter) {
	if( filter.length === 0 ) return '';

	var s = 'WHERE ';
	for (var i = filter.length - 1; i >= 0; i--) {
		s += '`'+filter[i].table +'`.`'+filter[i].column +'` LIKE \'%' + filter[i].value + '%\' ';
		if(i > 1) s += 'AND ';
	};
	return s;
}

