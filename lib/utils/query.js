
exports.sql = function (name) {
	var s = '';
	switch (name) {
		// select
		case 'list-view': s = 
				"SELECT {0} FROM `{1}` {2} ORDER BY {3} LIMIT {4},{5} ;";
		break;
		case 'get-record': s = 
				"SELECT {0} FROM `{1}` WHERE `{2}`={3} ;";
		break;
		case 'get-records': s = 
				"SELECT {0} FROM `{1}` ;";
		break;
		case 'total': s = 
				"SELECT COUNT(*) AS `count` FROM `{0}` ;";
		break;
		// edit
		case 'insert': s = 
				"INSERT INTO `{0}` ({1}) VALUES ({2}) ;";
		break;
		case 'update': s = 
				"UPDATE `{0}` SET {1} WHERE `{2}`={3} ;";
		break;
		case 'delete': s = 
				"DELETE FROM `{0}` WHERE `{1}`={2} ;";
		break;
		// many to many
		case 'insert-many': s = 
				"INSERT INTO `{0}` ({1}) VALUES {2} ;";
		break;
		case 'delete-many': s = 
				"DELETE FROM `{0}` WHERE `{1}`={2} AND `{3}` IN ({4}) ;";
		break;


		// config queries
		case 'show-grants': s = 
				"SHOW GRANTS FOR '{0}'@'localhost' ;";
		break;
		case 'show-schemas': s = 
				"SHOW SCHEMAS WHERE `Database` = '{0}' ;";
		break;
		case 'show-tables': s = 
				"SHOW TABLES IN `{0}` ;";
		break;
		case 'show-columns': s = 
				"SHOW COLUMNS IN `{0}` IN `{1}` ;";
				// describe table_name ; - same
		break;
		case 'show-indexes': s = 
				'SHOW INDEX IN `{0}` IN `{1}` ;';
		break;
		case 'foreign-keys': s = 
				"USE `information_schema` ; \
				SELECT \
					kcu.`table_name` AS 'table', \
					kcu.`column_name` AS 'foreignKey', \
					kcu.`referenced_table_name` AS 'referencedTable', \
					kcu.`referenced_column_name` AS 'referencedColumn', \
					rc.`update_rule` AS 'onUpdate', \
					rc.`delete_rule` AS 'onDelete' \
				FROM \
					`key_column_usage` kcu \
				JOIN `referential_constraints` rc \
					ON kcu.`table_name` = rc.`table_name` \
					AND kcu.`referenced_table_name` = rc.`referenced_table_name` \
				WHERE \
					kcu.`referenced_table_name` IS NOT NULL \
					AND kcu.`table_schema` = '{0}' ; \
				USE `{1}` ;";
		break;
		case 'use': s = 
				'USE `{0}` ;';
		break;
		
		default: s = 'Query name doesn\'t exist'; break;
	}
	return s;
}

exports.replace = function () {
	if (!arguments.length) return null;
	var sql = this.sql(arguments[0]);
	if (arguments.length > 1) {
		[].splice.call(arguments, 0, 1);
		for (var i=0; i < arguments.length; i++) {
			sql = sql.replace('{'+i+'}', arguments[i]);
		}
	}
	return sql;
}
