
var moment = require('moment');


exports.value = function (column, value) {
    if (value == '' && column.defaultValue) {
        value = column.defaultValue;
    }

    if (column.control.date) {
        if (!value) return null;
        if (moment(value).isValid())
            return moment(value).format('YYYY-MM-DD');
        return value;
    }

    else if (column.control.datetime) {
        if (!value) return null;
        if (moment(value).isValid())
            return moment(value).format('YYYY-MM-DD HH:mm:ss');
        return value;
    }

    else if (column.control.binary) {
        return value ? 'data:image/jpeg;base64,'+value.toString('base64') : value;
    }

    else if (column.control.multiple) {
        return this.setActiveMultiple(column, value);
    }

    else if (column.control.select) {
        return this.setActiveSingle(column, value);
    }

    else if (column.control.radio) {
        return this.setActiveRadio(column, value);
    }

    else {
        return value;
    }
}

exports.setActiveSingle = function (column, value) {
    if (!column.value) return value;
    var rows = column.value;
    for (var i=0; i < rows.length; i++) {
        if (rows[i]['__pk'] == value) {
            rows[i].selected = true;
            return rows;
        }
    }
    return rows;
}

exports.setActiveMultiple = function (column, value) {
    if (!column.value) return value;
    var rows = column.value;
    for (var i=0; i < rows.length; i++) {
        var pk = rows[i]['__pk'];
        value = (value instanceof Array) ? value : [value];
        for (var j=0; j < value.length; j++) {
            if (pk == value[j]) {
                rows[i].selected = true;
                break;
            }
        }
    }
    return rows;
}

exports.setActiveRadio = function (column, value) {
    if (value == 1)
        column.value[0].active = true;
    
    else if (value == 0)
        column.value[1].active = true;
    
    return column.value;
}
