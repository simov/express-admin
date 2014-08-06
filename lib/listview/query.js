
var query = require('../sql/query'),
    sql = require('../sql/sql');


function join (table, column, index) {
    if (column.oneToMany) {
        var ref = column.oneToMany,
            alias = {alias: ref.table+index};

        var join = column.fk
            ? [sql.joins(table, column.fk, ref, ref.pk, alias)]
            : [sql.joins(table, column.name, ref, ref.pk, alias)];
    }
    else if (column.manyToMany) {
        var ref = column.manyToMany.ref,
            link = column.manyToMany.link,
            alias = {alias: ref.table+index};

        var join = [
            sql.joins(table, table.pk, link, link.parentPk),
            sql.joins(link, link.childPk, ref, ref.pk, alias)
        ];
    }

    return {
        ref: ref, link: link, alias: alias, join: join,
        select: sql.group(ref, ref.columns, column.name, alias)
    };
}

exports = module.exports = function (args) {
    var view = args.config,
        table = view.table,
        columns = view.columns;

    var names = [],
        joins = [];
    for (var i=0; i < columns.length; i++) {
        if (!columns[i].listview.show) continue;

        if (columns[i].oneToMany || columns[i].manyToMany) {
            var result = join(table, columns[i], i);
            joins = joins.concat(result.join);
            names.push(result.select);
        }
        else {
            names.push(sql.fullName(table, columns[i].name));
        }
    }
    names.unshift(sql.as(table, table.pk, '__pk'));

    var where = statement(table, columns, args.filter);

    // always group by pk inside the listview!
    var group = sql.groupby(table, table.pk);

    var order = '';
    if (args.filter.order) {
        for (var i=0; i < columns.length; i++) {
            if (columns[i].name == args.filter.order) {
                var direction = args.filter.direction || 'ASC';
                var column = (columns[i].oneToMany || columns[i].manyToMany)
                    ? sql.justName(args.filter.order)//alias
                    : sql.fullName(table, args.filter.order);
                order = [column, direction].join(' ');
                break;
            }
        }
    }
    else if (!Object.keys(view.listview.order).length) {
        var pk = table.pk instanceof Array ? table.pk[0] : table.pk;
        order = sql.fullName(table, pk) + ' ASC';
    }
    else {
        order = sql.order(table, view.listview.order).join();
    }

    var from = args.page ? (args.page-1)*view.listview.page : 0;

    args.statements = {
        columns: names.join(), table: sql.table(table), join: joins.join(' '),
        where: where, group: group, order: order,
        from: from, to: view.listview.page
    }
}

function statement (table, columns, filter) {
    var statements = [];
    for (var i=0; i < columns.length; i++) {
        var column = columns[i],
            value = filter.columns[column.name];
        if (!value) continue;

        if (column.oneToMany && column.fk) {
            if (value == 'NULL') continue;
            statements.push(sql.andValues(table, column.fk, value));
        }
        else if (column.manyToMany) {
            var ref = column.manyToMany.ref,
                alias = {alias: ref.table+i};
            statements.push(sql.in(ref, ref.pk, value, alias));
        }
        else {
            var clause = sql.where(column.control, value);
            if (!clause) continue;

            var name = '';
            if (column.manyToMany) {
                var ref = column.manyToMany.ref;
                name = sql.fullName(ref, ref.pk);
            } else {
                name = sql.fullName(table, column.name);
            }
            statements.push([name, clause].join(' '));
        }
    }
    return statements.length
        ? ' WHERE ' + statements.join(filter.or ? ' OR ' : ' AND ')
        : '';
}
