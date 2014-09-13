
var moment = require('moment');


exports.value = function (column, value) {
    if (/^(datetime|timestamp).*/i.test(column.type)) {
        return value ? moment(value).format('ddd MMM DD YYYY HH:mm:ss') : '';
    }

    else if (/^date.*/i.test(column.type)) {
        return value ? moment(value).format('ddd MMM DD YYYY') : '';
    }

    else if (column.control.radio) {
        // mysql
        if (typeof value === 'number') {
            return (value == 1) // flip
                ? column.control.options[0]
                : column.control.options[1];
        }
        // pg
        if (typeof value === 'boolean') {
            return (value == true) // flip
                ? column.control.options[0]
                : column.control.options[1];
        }
    }

    else if (column.control.binary) {
        return value ? 'data:image/jpeg;base64,'+value.toString('base64') : value;
    }

    else {
        return value
    }
}
