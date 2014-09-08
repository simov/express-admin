
var moment = require('moment'),
    validator = require('mysql-validator');


exports.value = function (column, value) {
    
    if (value === '' || value === null || value === undefined
        || (value instanceof Array && !value.length)) {
        
        // should check for column.defaultValue when creating a record
        
        if (column.allowNull) return null;
        if (column.control.binary) return null; //temp disabled
        return new Error('Column '+column.name+' cannot be empty.');
    }
    
    value = format(column, value);

    return validator.check(value, column.type);
}

function format (column, value) {
    switch (true) {
        case column.control.date:
            if (!value || !moment(value).isValid()) return value;
            return moment(value).format('YYYY-MM-DD');

        case column.control.datetime:
            if (!value || !moment(value).isValid()) return value;
            return moment(value).format('YYYY-MM-DD HH:mm:ss');

        case column.control.radio:
            if (value === true) return 't';
            else if (value === false) return 'f';

        default:
            return value;
    }
}
