
var slugify = require('slugify');


/**
 * Insert new tables and columns for a settings object.
 *
 * @param {Object} settings
 * @param {Object} info
 * @param {Function} callback
 * @api public
 */

exports.refresh = function (settings, info, cb) {
	for (var table in info) {
		var columns = info[table],
			pk = primaryKey(columns);
		
		// if (!pk) continue;

		if (settings[table] === undefined) {
			settings[table] = createTable(table, pk);
		}

		for (var name in columns) {
			if (exists(settings[table].columns, name)) continue;

			settings[table].columns.push(createColumn(name, columns[name]));
		}
	}
	cb(settings);

}

/**
 * Check for column existence.
 *
 * @param {Array} columns
 * @param {String} name
 * @api private
 */

function exists (columns, name) {
	for (var i=0; i < columns.length; i++) {
		if (columns[i].name == name) return true;
	}
	return false;
}

/**
 * Create settings object for a table.
 *
 * @param {String} name
 * @param {String} pk
 * @api private
 */

function createTable (name, pk) {
	return {
		slug: slugify(name),
		table: {
			name: name,
			pk: pk,
			verbose: name,
		},
		columns: [],
		mainview: {
			show: true
		},
		filterview: {
			order: {},
			page: 25
		},
		editview: {
			readonly: false
		}
	};
}

/**
 * Create a settings object for a column.
 *
 * @param {String} name
 * @param {Object} info
 * @param {Number} idx
 * @api private
 */

function createColumn (name, info) {
	return {
		name: name,
		verbose: name,
		control: {text: true},
		type: info.type,
		allowNull: info.allowNull,
		defaultValue: info.defaultValue,
		filterview: {show: true},
		editview: {show: true}
	};
}

/**
 * Get the first found primary key from a given table's columns list.
 *
 * @param {Object} columns
 * @api private
 */

function primaryKey (columns) {
	for (var name in columns) {
		for (var property in columns[name]) {
			if (columns[name][property] === 'pri') {
				return name;
			}
		}
	}
	return '';
}

/**
 * This is not used at all, it stays here only for explanation.
 */

var SETTINGS_FORMAT = {
	slug: 'slug',
	table: {
		name: 'mysql name',
		pk: 'id',
		verbose: 'verbose name'
	},
	columns: [
		{
			verbose: 'verbose name',
			name: 'column name',
			control: {text: true},//{textarea: true[, editor: 'class']}
				//{date: true} {select: true[, multiple: true]}
			type: 'info.type',
			allowNull: 'info.allowNull',
			defaultValue: 'info.defaultValue',
			//
			oneToMany: {
				table:'name',
				pk: 'id',
				columns: ['column1', 'columnN']
			},
			manyToMany: {
				link: {
					table: 'recipe_ref',
					parentPk: 'id1',
					childPk: 'id2'
				},
				ref: { // same as oneToMany
					table: 'recipe_type',
					pk: 'id',
					columns: ['name']
				}
			},
			//
			filterview: {show: true},
			editview: {show: true}
			// runtime + key, value, error
		}
	],
	mainview: {
		show: true,
	},
	filterview: {
		order: {col: 'asc'},
		page: 25
	},
	editview: {
		readonly: false,
		oneToOne: {
			table: 'fk'
		},
		manyToOne: {
			table: 'fk'
		}
	}
}
