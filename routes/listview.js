
var dcopy = require('deep-copy');
// listview
var listview = {
    query: require('../lib/listview/query'),
    data: require('../lib/listview/data')},
    pagination = require('../lib/listview/pagination'),
    filter = require('../lib/listview/filter');
// editview
var editview = {
    otm: require('../lib/editview/data').otm,
    stc: require('../lib/editview/data').stc,
    format: require('../lib/editview/format')
};


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
    data(req, res, next);
}

exports.post = function (req, res, next) {
    data(req, res, next);
}

function data (req, res, next) {
    var args = getArgs(req, res),
        events = res.locals._admin.events;

    args.filter = filter.prepareSession(req, args);
    listview.query(args);

    events.preList(req, res, args, function () {
    listview.data(args, function (err, data) {
        if (err) return next(err);
        pagination.get(args, function (err, pager) {
            if (err) return next(err);
            // always should be in front of filter.getColumns
            // as it may reduce args.config.columns
            var order = filter.getOrderColumns(req, args);
            args.config.columns = filter.getColumns(args);

            editview.otm.get(args, function (err) {
                if (err) return next(err);
                editview.stc.get(args);

                render(req, res, args, data, pager, order, next);
            });
        });
    });
    });
}

function render (req, res, args, data, pager, order, next) {
    // set filter active items
    for (var i=0; i < args.config.columns.length; i++) {
        var column = args.config.columns[i],
            value = args.filter.columns[column.name];
        column.value = editview.format.value(column, value);
    }

    res.locals.view = {
        name: args.config.table.verbose,
        slug: args.slug,
        error: res.locals.error
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

    res.locals.columns = data.columns;
    res.locals.records = data.records;
    res.locals.pagination = pager;

    res.locals.partials = {
        content:    'listview',
        filter:     'listview/filter',
        column:     'listview/column',
        pagination: 'pagination'
    };
    
    next();
}
