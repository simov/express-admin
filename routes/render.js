
exports.admin = function (req, res) {
    
    res.locals.partials.header = 'header';
    res.locals.partials.breadcrumbs = 'breadcrumbs';
    res.locals.partials.theme = 'js/theme';
    res.locals.partials.layout = 'js/layout';

    res.render('base', {
        
        user: req.session.user,
        csrf: req.csrfToken(),

        url: {
            home: '/'
        }
    });
}
