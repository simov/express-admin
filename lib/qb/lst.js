
var x = null,
    z = require('./partials')();


function join (table, column, index) {
    if (column.oneToMany) {
        var ref = column.oneToMany,
            alias = ref.table+index;

        var joins = column.fk
            ? [z.join(table, column.fk, ref, ref.pk, alias)]
            : [z.join(table, column.name, ref, ref.pk, alias)];
    }
    else if (column.manyToMany) {
        var ref = column.manyToMany.ref,
            link = column.manyToMany.link,
            alias = ref.table+index;

        var joins = [
            z.join(table, table.pk, link, link.parentPk),
            z.join(link, link.childPk, ref, ref.pk, alias)
        ];
    }

    var concat = z.concat(ref.columns,alias,undefined,' '),
        group = z.group(concat);

    return {
        select: x.as(group,x.name(column.name)),
        joins: joins
    };
}


function select (args) {
    var view = args.config,
        table = view.table,
        columns = view.columns;

    var names = [],
        joins = [];
    for (var i=0; i < columns.length; i++) {
        if (!columns[i].listview.show) continue;

        if (columns[i].oneToMany || columns[i].manyToMany) {
            var result = join(table, columns[i], i);
            joins = joins.concat(result.joins);
            names.push(result.select);
        }
        else {
            names.push(x.name(columns[i].name,table.name,z.schema(table)));
        }
    }
    if (!table.view)
        names.unshift(x.as(z.concat(table.pk,table.name,z.schema(table),','),x.name('__pk')));

    var where = statement(table, columns, args.filter, joins);

    // always group by pk inside the listview!
    var group = (function groupby () {
        if (table.view) return;
        var pk = (table.pk instanceof Array) ? table.pk : [table.pk];
        return x.groupby(x.names(pk,table.name));
    }());

    var order = '';
    if (args.filter.order) {
        for (var i=0; i < columns.length; i++) {
            if (columns[i].name == args.filter.order) {
                var direction = args.filter.direction || 'asc';
                var column = (columns[i].oneToMany || columns[i].manyToMany)
                    ? x.name(args.filter.order)//column as alias
                    : x.name(args.filter.order,table.name,z.schema(table));
                order = [column, direction].join(' ');
                break;
            }
        }
    }
    else if (!Object.keys(view.listview.order).length) {
        if (table.view) {
            order = names[0] + ' asc';
        }
        else {
            var pk = table.pk instanceof Array ? table.pk[0] : table.pk;
            order = x.name(pk,table.name,z.schema(table)) + ' asc';
        }
    }
    else {
        order = (function (table, list) {
            var result = [];
            for (var column in list) {
                var order = list[column];
                result.push([x.name(column,table.name,z.schema(table)), order].join(' '));
            }
            return result.join();
        }(table, view.listview.order));
    }

    var from = args.page ? (args.page-1)*view.listview.page : 0;

    args.statements = {
        columns: names.join(), table: x.name(table.name,z.schema(table)),
        join: joins.join(' '),
        where: where, group: group, order: order,
        from: from, to: view.listview.page
    }
}

function create (args) {
    var s = args.statements;

    var str = [
        x.select(s.columns), x.from(s.table), s.join, s.where, s.group,
        x.orderby(s.order), x.limit(s.from,s.to), ';'
    ].join(' ');

    args.log && console.log('lst'.cyan, str);
    args.query = str;
}

function statement (table, columns, filter, joins) {
    var statements = [];
    for (var i=0; i < columns.length; i++) {
        var column = columns[i],
            value = filter.columns[column.name];
        if (!value) continue;

        if (column.oneToMany && column.fk) {
            if (value == 'NULL') continue;
            statements.push(x.and(z.eq(table, column.fk, value)));
        }
        else if (column.manyToMany) {
            if (!column.listview.show) {
                var result = join(table, columns[i], i);
                joins.push(result.joins[0]);
                joins.push(result.joins[1]);
            }
            var ref = column.manyToMany.ref,
                alias = {alias: ref.table+i};
            statements.push(z.in(ref.pk, value, alias));
        }
        else {
            var expr = expression(table, column.name, column.control, value);
            if (!expr) continue;
            statements.push(expr);
        }
    }

    return statements.length
        ? x.where(statements,(filter.or?'or':'and'))
        : '';
}

function expression (table, column, control, value) {
    var name = x.name(column,table.name,z.schema(table));

    if (control.select && !!control.options) {
        if ('string'===typeof value) value = x.string(value);
        return x.eq(name,value);
    }
    else if (control.select) {
        return x.eq(name,value);
    }
    else if (control.date || control.time || control.datetime || control.year) {
        if (value[0] == '' && value[1] == '') return null;
        var from = value[0] || value[1],
            to   = value[1] || value[0];
        return [name, x.between(x.string(from),x.string(to))].join(' ');
    }
    else if (control.radio) {
        // string 0 or 1 - false|true
        if (x.dialect == 'pg') value = (value==0 ? x.wrap('f') : x.wrap('t'));
        return x.eq(name,value);
    }
    else if (control.text || control.file) {
        return [name,x.like(x.string(value+'%'))].join(' ');
    }
    else if (control.textarea) {
        return [name,x.like(x.string('%'+value+'%'))].join(' ');
    }
    else {
        return x.eq(name,value);
    }
}

function pagination (args) {
    var table = args.config.table,
        s = args.statements;

    var concat = z.concat(table.pk,table.name,z.schema(table),',');

    var str = [
        x.select(
            table.view ? '*'
            : x.as(x.func('count',['distinct',concat],' '),x.name('count'))),
        x.from(s.table),
        s.join,
        s.where,
        ';'
    ].join(' ');

    args.log && console.log('pgr'.cyan, str);
    return str;
}

exports = module.exports = function (instance) {
    if (instance) x = instance;
    return {
        join:join, select:select, create:create,
        statement:statement, expression:expression,
        pagination:pagination
    }
}
