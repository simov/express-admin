
exports.get = function (req, res, next) {
    var settings = res.locals._admin.settings,
        custom = res.locals._admin.custom;

    var tables = [];
    for (var key in settings) {
        var view = settings[key];
        if (!view.mainview.show || !view.table.pk) continue;
        tables.push({slug: view.slug, name: view.table.verbose});
    }
    var views = [], have = false;
    for (var key in custom) {
        var view = custom[key].app;
        if (view && view.mainview && view.mainview.show) {
            views.push({slug: view.slug, name: view.verbose});
            have = true;
        }
    }

    res.locals.tables = tables;
    res.locals.views = views;
    res.locals.have = have;
    
    res.locals.partials = {
        content:  'mainview'
    };
    
    next();
}
