
// load static values from settings
// modifies `args.config.columns` with `value`

function getSelect (options) {
    var values = [];
    for (var i=0; i < options.length; i++) {
        if ('string' === typeof options[i]) {
            values.push({__pk: options[i], __text: options[i]});
        }
        else if ('object' === typeof options[i]) {
            var value = Object.keys(options[i])[0],
                text = options[i][value];
            values.push({__pk: value, __text: text});
        }
    }
    return values;
}

function getRadio (options) {
    return [
        {text: options[0], value: 1},
        {text: options[1], value: 0}
    ];
}

exports.get = function (args) {
    var columns = args.config.columns;
    for (var i=0; i < columns.length; i++) {
        var control = columns[i].control;
        if (!(control.options instanceof Array)) continue;

        if (control.select) {
            columns[i].value = getSelect(control.options);
        }
        else if (control.radio) {
            columns[i].value = getRadio(control.options);
        }
    }
}
