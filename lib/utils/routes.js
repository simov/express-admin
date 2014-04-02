
exports.init = function (root, tables, custom) {
    var regex = {
        login:  new RegExp('^\\' + root + '\\/login', 'i'),
        logout: new RegExp('^\\' + root + '\\/logout', 'i'),
        tables: null,
        custom: null,
        anything: /(?:\/.*)?/,
        list:   /(?:\/\?p=\d+)?/i,
        edit:   /\/(\d+|add)/i,
        home:   new RegExp('^\\' + root + '\\/$'),
        $:      /\/?$/i
      };

    regex.tables = getTableSlugs(root, tables);
    regex.custom = getTableSlugs(root, custom);
    return {
        editview: joinRegex(regex, 'tables', 'edit', '$'),
        listview: joinRegex(regex, 'tables', 'list', '$'),
        custom:   regex.custom ? joinRegex(regex, 'custom', 'anything', '$') : null,
        mainview: regex.home,
    };
}

// regex helpers

function joinRegex (regex) {
    var str = '';
    for (var i=1; i < arguments.length; i++) {
        str += regex[arguments[i]].source;
    }
    return new RegExp(str);
}

function getTableSlugs (root, config) {
    var slugs = [];
    for (var key in config) {
        var view = config[key].hasOwnProperty('app') ? config[key].app : config[key];
        if (!view.mainview || !view.mainview.show) continue;
        if (view.table && !view.table.pk) continue;
        slugs.push(view.slug);
    }
    if (!slugs.length) return null;
    return new RegExp(['^\\' + root + '\\/(', slugs.join('|'),')'].join(''), 'i');
}
