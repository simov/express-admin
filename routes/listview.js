
var async = require('async'),
    dcopy = require('deep-copy');
var qb = require('../lib/qb')(),
    data = require('../lib/data'),
    format = require('../lib/format');
var filter = require('../lib/listview/filter');


function getArgs (req, res) {
    var args = {
        settings : res.locals._admin.settings,
        db       : res.locals._admin.db,
        debug    : res.locals._admin.debug,
        log      : res.locals._admin.log,
        slug     : req.params[0],
        page     : req.query.p || 0,
        data     : req.body
    };
    args.name = res.locals._admin.slugs[args.slug];
    args.config = dcopy(args.settings[args.name]);
    return args;
}

exports.get = function (req, res, next) {
    _data(req, res, next);
}

exports.post = function (req, res, next) {
    _data(req, res, next);
}

function _data (req, res, next) {
    var args = getArgs(req, res),
        events = res.locals._admin.events;

    args.filter = filter.prepareSession(req, args);
    qb.lst.select(args);

    var results = {};
    async.series([
        events.preList.bind(events, req, res, args),
        function (done) {
            data.list.get(args, function (err, result) {
                if (err) return done(err);
                results.data = result;
                done();
            });
        },
        function (done) {
            data.pagination.get(args, function (err, pager) {
                if (err) return done(err);
                // always should be in front of filter.getColumns
                // as it may reduce args.config.columns
                results.order = filter.getOrderColumns(req, args);
                args.config.columns = filter.getColumns(args);
                results.pager = pager;
                done();
            });
        },
        function (done) {
            data.otm.get(args, function (err) {
                if (err) return done(err);
                data.stc.get(args);
                done();
            });
        }
    ], function (err) {
        if (err) return next(err);
        render(
            req, res, args,
            results.data, results.pager, results.order,
            next
        );
    });
}

function render (req, res, args, ddata, pager, order, next) {
    // set filter active items
    for (var i=0; i < args.config.columns.length; i++) {
        var column = args.config.columns[i],
            value = args.filter.columns[column.name];
        column.defaultValue = null;
        column.value = format.form.value(column, value);
    }

    res.locals.view = {
        name: args.config.table.verbose,
        slug: args.slug,
        error: res.locals.error,
        table: !args.config.table.view
    };
    res.locals.breadcrumbs = {
        links: [
            {url: '/', text: res.locals.string.home},
            {active: true, text: args.config.table.verbose}
        ]
    };

    // show filter rows in two columns
    res.locals.filter = (function () {
        var filter = args.config.columns,
            rows = [];
        var size = 2,
            total = filter.length / size;
        for (var i=0; i < total; i++) {
            rows.push({row: filter.slice(i*size, (i+1)*size)});
        }
        return rows;
    }());
    res.locals.have = res.locals.filter.length ? true : false;

    res.locals.order = order;
    // order direction
    res.locals.direction = [
        {text: res.locals.string.asc, value: 'asc',
            selected: args.filter.direction == 'asc' ? true : null},
        {text: res.locals.string.desc, value: 'desc',
            selected: args.filter.direction == 'desc' ? true : null}
    ];
    res.locals.collapsed = args.filter.show;
    res.locals.or = args.filter.or;

    res.locals.columns = ddata.columns;
    res.locals.records = ddata.records;
    res.locals.pagination = pager;

    res.locals.partials = {
        content:    'listview',
        filter:     'listview/filter',
        column:     'listview/column',
        pagination: 'pagination'
    };
    
    next();
}
