
exports.get = function (req, res, next) {
    var settings = res.locals._admin.settings,
        custom = res.locals._admin.custom;

    var tables = [];
    for (var key in settings) {
        var item = settings[key];
        if (!item.mainview.show || !item.table.pk || item.table.view) continue;
        tables.push({slug: item.slug, name: item.table.verbose});
    }

    var views = [];
    for (var key in settings) {
        var item = settings[key];
        if (!item.mainview.show || !item.table.view) continue;
        views.push({slug: item.slug, name: item.table.verbose});
    }

    var customs = [];
    for (var key in custom) {
        var item = custom[key].app;
        if (!item || !item.mainview || !item.mainview.show) continue;
        customs.push({slug: item.slug, name: item.verbose});
    }

    res.locals.tables = !tables.length ? null : {items: tables};
    res.locals.views = !views.length ? null : {items: views};
    res.locals.custom = !customs.length ? null : {items: customs};
    
    res.locals.partials = {
        content:  'mainview'
    };

    next();
}
