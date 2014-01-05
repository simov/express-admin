
var dcopy = require('deep-copy'),
    listview = require('../lib/core/listview'),
    editview = require('../lib/core/editview'),
    pagination = require('../lib/utils/pagination'),
    template = require('../lib/utils/template');


function getArgs (req, res) {
    var args = {
        settings : res.locals._admin.settings,
        db       : res.locals._admin.db,
        debug    : res.locals._admin.debug,
        slug     : req.params[0],
        page     : req.query.p || 0,
        data     : req.body
    };
    args.name = res.locals._admin.slugs[args.slug];
    args.config = dcopy(args.settings[args.name]);
    return args;
}

function prepareSession (req, args) {
    if (!req.session.filter) req.session.filter = {};
    var filter = req.session.filter;

    if ((req.method == 'GET' && !filter.hasOwnProperty(args.name))
    || (req.method == 'POST' && req.body.action.hasOwnProperty('clear'))) {
        return filter[args.name] = {
            columns: {},
            order: '',
            direction: '',
            show: false
        };
    }
    
    if (req.method == 'POST' && req.body.action.hasOwnProperty('filter')) {
        return filter[args.name] = {
            columns: req.body.filter||{},
            order: req.body.order,
            direction: req.body.direction,
            show: true
        };
    }

    return filter[args.name];
}

exports.get = function (req, res, next) {
    var args = getArgs(req, res);
    
    args.filter = prepareSession(req, args);

    data(req, res, args, next);
}

exports.post = function (req, res, next) {
    var args = getArgs(req, res);
    
    args.filter = prepareSession(req, args);

    data(req, res, args, next);
}

function getOrderColumns (req, args) {
    var order = [];
    for (var i=0; i < args.config.columns.length; i++) {
        var column = args.config.columns[i];
        if (!column.listview.show) continue;
        if (column.name == args.filter.order) {
            column = dcopy(column);
            column.selected = true;
        }
        order.push(column);
    }
    return order;
}

function getFilterColumns (args) {
    var filter = [];
    for (var i=0; i < args.config.columns.length; i++) {
        if (!args.config.listview.filter) continue;
        for (var j=0; j < args.config.listview.filter.length; j++) {
            if (args.config.columns[i].name == args.config.listview.filter[j]) {
                var column = dcopy(args.config.columns[i]);
                column.key = ['filter[',column.name,']'].join('');
                filter.push(column);
            }
        }
    }
    return filter;
}

function data (req, res, args, next) {
    args.query = listview.query(args);

    listview.data(args, function (err, data) {
        if (err) return next(err);
        pagination.get(args, function (err, pager) {
            if (err) return next(err);
            // always should be in front of getFilterColumns
            // as it may reduce args.config.columns
            var order = getOrderColumns(req, args);
            args.config.columns = getFilterColumns(args);

            editview.test.otm.loopColumns(args, function (err) {
                if (err) return next(err);
                editview.test.stc.loopColumns(args);

                params(req, res, args, data, pager, order, next);
            });
        });
    });
}

function params (req, res, args, data, pager, order, next) {
    // set filter active items
    for (var i=0; i < args.config.columns.length; i++) {
        var column = args.config.columns[i],
            value = args.filter.columns[column.name];
        column.value = template.value(column, value);
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
    res.locals.show = args.filter.show;

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
