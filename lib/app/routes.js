
exports.init = function (tables, custom) {
    regex.tables = getTableSlugs(tables)||/.*/i;
    regex.custom = getTableSlugs(custom);
    return {
        editview: joinRegex('tables', 'edit', '$'),
        listview: joinRegex('tables', 'list', '$'),
        custom:   regex.custom ? joinRegex('custom', 'anything', '$') : null,
        mainview: regex.home,
    };
}

var regex = {
    login:  /^\/login/i,
    logout: /^\/logout/i,
    tables: null,
    custom: null,
    anything: /(?:\/.*)?/,
    list:   /(?:\/\?p=\d+)?/i,
    edit:   /\/(.+|add)/i,
    home:   /^\/$/,
    $:      /\/?$/i
};

// regex helpers

function joinRegex () {
    var str = '';
    for (var i=0; i < arguments.length; i++) {
        str += regex[arguments[i]].source;
    }
    return new RegExp(str);
}

function getTableSlugs (config) {
    var slugs = [];
    for (var key in config) {
        var item = (config[key].app)
            ? config[key].app
            : config[key];

        if (!item.mainview || !item.mainview.show) continue;
        if (item.table && !item.table.view && !item.table.pk) continue;
        slugs.push(item.slug);
    }
    if (!slugs.length) return null;
    return new RegExp(['^\\/(',slugs.join('|'),')'].join(''), 'i');
}
