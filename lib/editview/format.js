
var moment = require('moment');


exports.value = function (column, value) {
    if (value == '' && column.defaultValue)
        value = column.defaultValue;
    
    switch (true) {
        case column.control.date:
            if (!value) return null;
            if (moment(value).isValid())
                return moment(value).format('YYYY-MM-DD');
            return value;
        case column.control.datetime:
            if (!value) return null;
            if (moment(value).isValid())
                return moment(value).format('YYYY-MM-DD HH:mm:ss');
            return value;

        case column.control.binary:
            return value ? 'data:image/jpeg;base64,'+value.toString('base64') : value;

        case column.control.multiple:
            return setActiveMultiple(column, value);
        
        case column.control.select && (column.control.options instanceof Array):
            return setActiveStatic(column, value);

        case column.control.select:
            return setActiveSingle(column, value);

        case column.control.radio:
            return setActiveRadio(column, value);

        default:
            return value;
    }
}

function setActiveSingle (column, value) {
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

function setActiveMultiple (column, value) {
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

function setActiveStatic (column, value) {
    var rows = column.value;
    for (var i=0; i < rows.length; i++) {
        if (rows[i]['__pk'] === value) {
            rows[i].selected = true;
            return rows;
        }
    }
    return rows;
}

function setActiveRadio (column, value) {
    if (value == 1)
        column.value[0].active = true;
    
    else if (value == 0)
        column.value[1].active = true;
    
    return column.value;
}

exports._setActiveSingle = setActiveSingle;
exports._setActiveMultiple = setActiveMultiple;
exports._setActiveStatic = setActiveStatic;
exports._setActiveRadio = setActiveRadio;
