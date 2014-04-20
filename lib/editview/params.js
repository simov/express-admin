
var dcopy = require('deep-copy');
var validate = require('./validate'),
    format = require('./format');


// `args.config.columns` is extended with `oneToMany` data
// `rows` comes either from sql select of from post request
exports.get = function (args, rows) {
    var table = args.config.table,
        _columns = args.config.columns;

    var names = [],
        blank = [];
    for (var i=0; i < _columns.length; i++) {
        names.push(_columns[i].name);
        blank.push(dcopy(_columns[i]));
    }
    for (var i=0; i < names.length; i++) {
        if (args.type === 'view') {
            blank[i].key = args.type+'['+table.name+'][records][0][columns]['+names[i]+']';
        } else {
            blank[i].key = args.type+'['+table.name+'][blank][index][columns]['+names[i]+']';
        }
    }
    var _insert = {
        key: args.type+'['+table.name+'][blank][index][insert]',
        value: true
    };

    var records = [];
    for (var i=0; i < rows.length; i++) {
        
        // var values = rows[i].columns || rows[i],
        var values = rows[i].columns,
            record = args.type+'['+table.name+'][records]['+i+']';

        var pk = {
            key: record+'[pk]',
            value: rows[i].pk || values['__pk']
        };
        
        var insert = rows[i].insert
            ? {
                key: record+'[insert]',
                value: true
            } : null;

        var remove = {
            key: record+'[remove]',
            value: rows[i].remove ? true : null
        };

        var columns = dcopy(_columns);
        for (var j=0; j < columns.length; j++) {
            
            var column = columns[j];
            column.key = record+'[columns]['+column.name+']';
            
            var value = values[column.name];
            column.error = validate.value(column, value);
            column.value = format.value(column, value);
            args.error = column.error ? true : args.error;
        }
        records.push({pk: pk, columns: columns, insert: insert, remove: remove});
    }
    return {name: table.name, verbose: table.verbose, 
            records: records, blank: blank, insert: _insert};
}
