
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
