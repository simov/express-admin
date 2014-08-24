
var sql = require('../sql/sql'),
    query = require('../sql/query');
var xsql = require('xsql');
var x = new xsql({dialect:
    (sql.client.mysql&&'mysql')||
    (sql.client.pg&&'pg')||
    (sql.client.sqlite&&'sqlite')
});
var z = require('./partials');


exports.join = function (table, column, index) {
    if (column.oneToMany) {
        var ref = column.oneToMany,
            alias = {alias: ref.table+index};

        var joins = column.fk
            ? [z.join(table, column.fk, ref, ref.pk, alias)]
            : [z.join(table, column.name, ref, ref.pk, alias)];
    }
    else if (column.manyToMany) {
        var ref = column.manyToMany.ref,
            link = column.manyToMany.link,
            alias = {alias: ref.table+index};

        var joins = [
            z.join(table, table.pk, link, link.parentPk),
            z.join(link, link.childPk, ref, ref.pk, alias)
        ];
    }

    var select = (function select (cols, alias) {
        var columns = z.cast(cols, alias);

        var concat = z.concat(columns);

        var group = z.group(concat);

        return group;
    }(ref.columns, alias.alias));

    return {
        select: x.as(select,x.name(column.name)),
        joins: joins
    };
}


exports.select = function (args) {
    var view = args.config,
        table = view.table,
        columns = view.columns;

    var names = [],
        joins = [];
    for (var i=0; i < columns.length; i++) {
        if (!columns[i].listview.show) continue;

        if (columns[i].oneToMany || columns[i].manyToMany) {
            var result = exports.join(table, columns[i], i);
            joins = joins.concat(result.joins);
            names.push(result.select);
        }
        else {
            names.push(x.name(columns[i].name,table.name,z.schema(table)));
        }
    }
    names.unshift(z.as(table, table.pk, '__pk',','));

    var where = exports.statement(table, columns, args.filter, joins);

    // always group by pk inside the listview!
    var group = (function groupby () {
        var pk = (table.pk instanceof Array) ? table.pk : [table.pk];
        return x.groupby(x.names(pk,table.name));
    }());

    var order = '';
    if (args.filter.order) {
        for (var i=0; i < columns.length; i++) {
            if (columns[i].name == args.filter.order) {
                var direction = args.filter.direction || 'ASC';
                var column = (columns[i].oneToMany || columns[i].manyToMany)
                    ? x.name(args.filter.order)//alias
                    : x.name(args.filter.order,table.name,z.schema(table));
                order = [column, direction].join(' ');
                break;
            }
        }
    }
    else if (!Object.keys(view.listview.order).length) {
        var pk = table.pk instanceof Array ? table.pk[0] : table.pk;
        order = x.name(pk,table.name,z.schema(table)) + ' ASC';
    }
    else {
        order = sql.order(table, view.listview.order).join();
    }

    var from = args.page ? (args.page-1)*view.listview.page : 0;

    args.statements = {
        columns: names.join(), table: x.name(table.name,z.schema(table)),
        join: joins.join(' '),
        where: where, group: group, order: order,
        from: from, to: view.listview.page
    }
}

exports.create = function (args) {
    var s = args.statements;
    args.query = query.replace('list-view',
        s.columns, s.table, s.join, s.where, s.group, s.order, s.from, s.to);
    args.log && console.log('lst'.cyan, args.query);
}

exports.statement = function (table, columns, filter, joins) {
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
                var result = exports.join(table, columns[i], i);
                joins.push(result.joins[0]);
                joins.push(result.joins[1]);
            }
            var ref = column.manyToMany.ref,
                alias = {alias: ref.table+i};
            statements.push(sql.in(ref, ref.pk, value, alias));
        }
        else {
            var expr = exports.expression(table, column.name, column.control, value);
            if (!expr) continue;
            statements.push(expr);
        }
    }

    return statements.length
        ? x.where(statements,(filter.or?'or':'and'))
        : '';
}

exports.expression = function (table, column, control, value) {
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
}

exports.pagination = function (args) {
    var table = args.config.table,
        s = args.statements;

    var select = (function select (cols, table) {
        var columns = z.cast(cols,table.name,z.schema(table));

        var concat = z.concat(columns,',');

        return concat;
    }(table.pk, table));

    var str = query.replace('total', select, s.table, s.join, s.where);
    args.log && console.log('pgr'.cyan, str);

    return str;
}
