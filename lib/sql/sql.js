
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

// `table`.`column`
// if table == '' returns justName instead of fullName
exports.fullName = function (table, column) {
    var result = !table
        ? this.justName(column)
        : ['`',table,'`.`',column,'`'].join('');
    return quotes(result);
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

// `table1`.`column` = `table2`.`column`
// `table1`.`column` = `table2`.`column` AND
exports.andColumns = function (table, fk, refTable, pk) {
    fk = fk instanceof Array ? fk : [fk];
    pk = pk instanceof Array ? pk : [pk];

    var result = [];
    for (var i=0; i < fk.length; i++) {
        result.push([
            this.fullName(table, fk[i]),
            this.fullName(refTable, pk[i])].join(' = '));
    }
    
    result = result.join(' AND ');
    return result;
}

// `table1`.`column` = 'value'
// `table1`.`column` = 'value' AND
exports.andValues = function (table, column, value) {
    var columns = column instanceof Array ? column : [column],
        values = (value instanceof Array)
            ? value
            : (typeof value === 'string' ? value.split(',') : [value]);

    var result = [];
    for (var i=0; i < columns.length; i++) {
        result.push(
            this.fullName(table, columns[i])+' = '+escape(values[i]===undefined?null:values[i]));
    }
    result = result.join(' AND ');
    return result;
}


// concat_ws(' ',`table`.`column1`,`table`.`column2`)
// `table`.`column1`||' '||`table`.`column2`
exports.concat = function (table, columns, sep) {
    sep = sep||',';
    return this.client.sqlite
        ? this.fullNames(table, columns).join("||'"+sep+"'||")
        : ["CONCAT_WS('",sep,"',",this.list(table, columns),')'].join('');
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

// group by `table.column`
// group by `table.column1`,`table.column2`
exports.groupby = function (table, column) {
    return ['','GROUP BY',this.list(table, column),''].join(' ');
}

// left join `table1.column` ON `table2`.`column`
// left join `table1.column1` ON `table2`.`column1` AND `table1.column2` = `table2`.`column2`
exports.joins = function (table, fk, refTable, pk) {
    var result = [
        ' LEFT JOIN',this.justName(refTable),'ON',
        this.andColumns(table, fk, refTable, pk)
    ].join(' ');
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
// same as castConcat expect that it wrapts everything in group
exports.group = function (table, columns, name) {
    var result = this.client.mysql
        ? ["CONCAT_WS(' ',",this.cast(table, columns),')'].join('')
        : this.concat(table, columns, ' ');
    
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


// parentValue1,parentValue2 - ['childValue1,childValue2', 'childValue3,childValue4']
// ('pv1','pv2','cv1','cv2'),('pv1','pv2','cv3','cv4')
exports.values = function (parentValues, childValues) {
    parentValues = parentValues.toString().split(',');

    var result = [];
    for (var i=0; i < childValues.length; i++) {
        var recordValues = parentValues.concat(childValues[i].toString().split(','));
        var values = [];
        for (var j=0; j < recordValues.length; j++) {
            values.push(escape(recordValues[j]));
        }
        result.push(['(',values.join(),')'].join(''));
    }
    return result.join();
}

// ['child1','child2'] - ['2,4', '6,7']
// `child1` IN (2,6) AND `child2` IN (4,7)
exports.in = function (table, column, value) {
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
        result.push([this.fullName(table, columns[i]),' IN (',arr2[i].join(),')'].join(''));
    }
    result = result.join(' AND ');
    return result
}


/**
 * Return a where clause.
 *
 * @param {Object} control
 * @param {Mixed} value
 * @api public
 */

exports.where = function (control, value) {
    var clause = null;
    switch (true) {
        case control.select && control.multiple:
            value = (value instanceof Array) ? value : [value];
            clause = ['IN', '(', value.join(), ')']; break;

        case control.select && control.options:
            if (value == 'NULL') break;
            clause = ['=', value]; break;

        case control.select:
            if (value == 'NULL') break;
            clause = ['=', value]; break;

        case control.date || control.time || control.datetime || control.year:
            if (value[0] == '' && value[1] == '') break;
            var from = value[0] || value[1],
                to   = value[1] || value[0];
            clause = ['BETWEEN', escape(from), 'AND', escape(to)]; break;

        case control.radio:
            // string 0 or 1 - false|true
            clause = ['=', value]; break;

        case control.text || control.file:
            if (value == '') break;
            clause = ['LIKE', escape(value+'%')]; break;

        case control.textarea:
            if (value == '') break;
            clause = ['LIKE', escape('%'+value+'%')]; break;
    }
    return clause && clause.join(' ');
}
