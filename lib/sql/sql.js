
exports.client = {};


function quotes (result) {
    return (exports.client.mysql || exports.client.sqlite)
        ? result : result.replace(/`/g,'"');
}
function escape (value) {
    return (typeof value === 'string')
        ? "'"+value.replace(/('|")/g, '\\$1')+"'"
        : value;
}


// `name`
exports.justName = function (name) {
    var result = ['`',name,'`'].join('');
    return quotes(result);
}

// "schema"."table" or `table`
exports.table = function (table) {
    var schema = table.schema||this.schema,
        name = table.name||table.table||table.alias;
    
    return (this.client.pg && !table.alias)
        ? [this.justName(schema), this.justName(name)].join('.')
        : this.justName(name);
}

// `table`.`column`
// if table == '' returns justName instead of fullName
exports.fullName = function (table, column) {
    var result = (table)
        ? [this.table(table), this.justName(column)].join('.')
        : this.justName(column);
    return result;
}


// ['`table.column1`', '`table.column2`']
exports.fullNames = function (table, columns) {
    columns = columns instanceof Array ? columns : [columns];
    var result = [];
    for (var i=0; i < columns.length; i++) {
        result.push(this.fullName(table, columns[i]));
    }
    return result;
}

// select, order by, group by
// `table`.`column`
// `table`.`column1`,`table`.`column2`
exports.list = function (table, column) {
    var result = (column instanceof Array)
        ? this.fullNames(table, column).join()
        : this.fullName(table, column);
    return result;
}


// concat_ws(' ',`table`.`column1`,`table`.`column2`)
// `table`.`column1`||' '||`table`.`column2`
exports.concat = function (table, columns, sep) {
    sep = sep||',';
    var result = '';

    if (this.client.sqlite) {
        var col = this.fullNames(table, columns);
        for (var i=0; i < col.length; i++) {
            col[i] = ['IFNULL(',col[i],",'')"].join('')
        }
        result = col.join("||'"+sep+"'||");
    }
    else result = ["CONCAT_WS('",sep,"',",this.list(table, columns),')'].join('');

    return result;
}

// concat_ws(',',`table`.`column1`,`table`.`column2`) AS name
// `table`.`column` AS name
exports.as = function (table, columns, name) {
    var result = (columns instanceof Array)
        ? this.concat(table, columns)
        : this.fullName(table, columns);
    result = result.concat(' AS ', name);
    return result;
}


// only for mysql
// [ 'CAST(`table`.`column` AS CHAR)' ]
exports.cast = function (table, columns) {
    var result = [];
    for (var i=0; i < columns.length; i++) {
        result.push(['CAST(',this.fullName(table, columns[i]),' AS CHAR)'].join(''));
    }
    return result.join();
}
// concat (additionally cast for mysql)
exports.castConcat = function (table, columns, name) {
    var result = this.client.mysql
        ? ["CONCAT_WS(' ',",this.cast(table, columns),')'].join('')
        : this.concat(table, columns, ' ');
    
    result = result.concat(' AS ', this.justName(name))
    return result;
}
// same as castConcat excect that it wraps everything in group
exports.group = function (table, columns, name, alias) {
    var result = this.client.mysql
        ? ["CONCAT_WS(' ',",this.cast(alias||table, columns),')'].join('')
        : this.concat(alias||table, columns, ' ');
    
    switch (true) {
        case this.client.mysql:
            result = ['GROUP_CONCAT(DISTINCT ',result,')'].join('')
            break;
        case this.client.pg:
            result = ['string_agg(DISTINCT ',result,',\',\')'].join('')
            break;
        case this.client.sqlite:
            result = ['GROUP_CONCAT(DISTINCT ',result,')'].join('')
            break;		
    }
    result = result.concat(' AS ', this.justName(name));
    return result;
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


// ['child1','child2'] - ['2,4', '6,7']
// `child1` IN (2,6) AND `child2` IN (4,7)
exports.in = function (table, column, value, alias) {
    var columns = column instanceof Array ? column : [column],
        values = value instanceof Array ? value : [value];
    var arr2 = [];
    for (var i=0; i < columns.length; i++) {
        var arr = [];
        for (var j=0; j < values.length; j++) {
            arr.push(escape(values[j].toString().split(',')[i]));
        }
        arr2.push(arr);
    }

    var result = [];
    for (var i=0; i < columns.length; i++) {
        result.push([this.fullName(alias||table, columns[i]),' IN (',arr2[i].join(),')'].join(''));
    }
    result = result.join(' AND ');
    return result
}
