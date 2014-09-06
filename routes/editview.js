
var dcopy = require('deep-copy');
var editview = require('../lib/editview/index'),
    database = require('../lib/db/update');


function getArgs (req, res) {
    var args = {
        settings : res.locals._admin.settings,
        db       : res.locals._admin.db,
        debug    : res.locals._admin.debug,
        log      : res.locals._admin.log,
        slug     : req.params[0],
        id       : req.params[1] == 'add' ? null : req.params[1].split(','),
        data     : req.body,
        upload   : req.files,
        upath    : res.locals._admin.config.app.upload
    };
    args.name = res.locals._admin.slugs[args.slug];
    return args;
}

function page (req, args) {
    if (!req.session.filter || !req.session.filter[args.name]) return '';
    var page = req.session.filter[args.name].page;
    return page ? '?p='+page : '';
}

exports.get = function (req, res, next) {
    var args = getArgs(req, res);

    editview.getTypes(args, function (err, data) {
        if (err) return next(err);
        
        render(req, res, next, data, args);
    });
}

exports.post = function (req, res, next) {
    var args = getArgs(req, res),
        events = res.locals._admin.events;
    // var fs = require('fs');
    // fs.writeFileSync('dump.json', JSON.stringify(req.body, null, 4), 'utf8');

    editview.getTypes(args, function (err, data) {
        if (err) return next(err);

        var view = req.body.view,
            action = req.body.action,
            table = Object.keys(view)[0];

        if ({}.hasOwnProperty.call(action, 'remove')) {
            // should be based on constraints
            args.action = 'remove';

        } else if ({}.hasOwnProperty.call(view[table].records[0], 'insert')) {
            if (args.error && !args.debug) return render(req, res, next, data, args);
            args.action = 'insert';

        } else {
            if (args.error && !args.debug) return render(req, res, next, data, args);
            args.action = 'update';
        }


        events.preSave(req, res, args, function () {
        database.update(args, function (err) {
        events.postSave(req, res, args, function () {
            if (err) {
                req.session.error = err.message;
                res.redirect(res.locals.root+'/'+args.slug+page(req, args));
                return;
            }

            // based on clicked button
            switch (true) {
                case {}.hasOwnProperty.call(action, 'remove'):
                    // the message should be different for delete
                    req.session.success = true;
                    res.redirect(res.locals.root+'/'+args.slug+page(req, args));
                    break;
                case {}.hasOwnProperty.call(action, 'save'):
                    req.session.success = true;
                    res.redirect(res.locals.root+'/'+args.slug+page(req, args));
                    break;
                case {}.hasOwnProperty.call(action, 'another'):
                    req.session.success = true;
                    res.redirect(res.locals.root+'/'+args.slug+'/add');
                    break;
                case {}.hasOwnProperty.call(action, 'continue'):
                    req.session.success = true;
                    if (args.debug) return render(req, res, next, data, args);
                    res.redirect(res.locals.root+'/'+args.slug+'/'+args.id.join());
                    break;
            }
        });
        });
        });
    });
}

function render (req, res, next, data, args) {
    var string = res.locals.string;
    var view = args.settings[args.name];

    res.locals.view = {
        tables: data.view.tables,
        name: view.table.verbose,
        slug: args.slug,
        action: req.url,
        readonly: view.editview.readonly,
        success: args.success
    };
    res.locals.breadcrumbs = {
        links: [
            {url: '/', text: string.home},
            {url: '/'+args.slug, text: view.table.verbose},
            {active: true, text: req.params[1]}
        ]
    };
    res.locals.show.error = args.error;
    res.locals.show.delete = !(req.params[1] == 'add');

    data.oneToOne.one = true;
    data.oneToOne.type = 'one';
    data.manyToOne.type = 'many';
    res.locals.inline = [data.oneToOne, data.manyToOne];
        
    res.locals.partials = {
        content:  'editview',
        view:     'editview/view',
        inline:   'editview/inline',
        column:   'editview/column'
    };
    
    next();
}
