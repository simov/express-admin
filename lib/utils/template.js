
var moment = require('moment'),
    validator = require('mysql-validator');
var query = require('./query'),
    sql = require('./sql');


exports.value = function (column, value) {
    
    if (value === '') {
        if (column.defaultValue) {
            value = column.defaultValue;
        }
        if (!value) {
            return value;
        }
    }
    
    switch (true) {
        case column.control.date:
            if (!value) return null;
            if (moment(value).isValid())
                return moment(value).format('YYYY-MM-DD');
        case column.control.datetime:
            if (!value) return null;
            if (moment(value).isValid())
                return moment(value).format('YYYY-MM-DD hh:mm:ss');

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
        if (parseInt(rows[i]['__pk']) === parseInt(value)) {
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
        var pk = parseInt(rows[i]['__pk']);
        value = (value instanceof Array) ? value : [value];
        for (var j=0; j < value.length; j++) {
            if (pk === parseInt(value[j])) {
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

exports.validate = function (column, value) {
    
    if (value === '' || value === 'NULL' || value === null || value === undefined
        || (value instanceof Array && !value.length)) {
        // should check for column.defaultValue too
        if (!column.allowNull) {
            return new Error('Column '+column.name+' cannot be empty.');
        } else {
            return null;
        }
    }
    if (column.control.date) {
        if (moment(value).isValid()) {
            value = moment(value).format('YYYY-MM-DD');
        }
    }
    if (column.control.datetime) {
        if (moment(value).isValid()) {
            value = moment(value).format('YYYY-MM-DD hh:mm:ss');
        }
    }

    return validator.check(value, column.type);
}

exports.test = {
    setActiveSingle: setActiveSingle,
    setActiveMultiple: setActiveMultiple
};
