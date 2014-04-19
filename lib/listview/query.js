
var query = require('../sql/query'),
    sql = require('../sql/sql');


exports = module.exports = function (args) {
    var view = args.config,
        table = view.table,
        columns = view.columns;

    var names = [],
        joins = [];
    for (var i=0; i < columns.length; i++) {
        if (!columns[i].listview.show) continue;
        if (columns[i].oneToMany) {
            var ref = columns[i].oneToMany,
                cols = sql.fullNames(ref.table, ref.columns);
            names.push(sql.group(sql.cast(cols), columns[i].name));
            joins.push(sql.joins(table.name, columns[i].name, ref.table, ref.pk));
        }
        else if (columns[i].manyToMany) {
            var ref = columns[i].manyToMany.ref,
                cols = sql.fullNames(ref.table, ref.columns);

            names.push(sql.group(sql.cast(cols), columns[i].name));
            
            var link = columns[i].manyToMany.link;
            joins.push(sql.joins(table.name, table.pk, link.table, link.parentPk));
            joins.push(sql.joins(link.table, link.childPk, ref.table, ref.pk));
        }
        else {
            names.push(sql.fullName(table.name, columns[i].name));
        }
    }
    names.unshift(sql.pk(table.name, table.pk));

    var where = statement(table, columns, args.filter);

    // always group by pk inside the listview!
    var group = sql.groupby(sql.fullName(table.name, table.pk));

    var order = '';
    if (args.filter.order && args.filter.order != 'NULL') {
        for (var i=0; i < columns.length; i++) {
            if (columns[i].name == args.filter.order) {
                var direction = args.filter.direction || 'asc';
                var column = (columns[i].oneToMany || columns[i].manyToMany)
                    ? args.filter.order
                    : sql.fullName(table.name, args.filter.order);
                order = [column, direction].join(' ');
                break;
            }
        }
    }
    else if (!Object.keys(view.listview.order).length) {
        order = sql.fullName(table.name, table.pk) + ' asc';
    }
    else {
        order = sql.order(table.name, view.listview.order).join();
    }

    var from = args.page ? (args.page-1)*view.listview.page : 0;

    args.statements = {
        columns: names.join(), table: table.name, join: joins.join(' '),
        where: where, group: group, order: order,
        from: from, to: view.listview.page
    }
    return query.replace('list-view',
        /*columns*/names.join(), table.name,
        joins.join(' '), where, group, order, from, view.listview.page);
}

function statement (table, columns, filter) {
    var statements = [];
    for (var i=0; i < columns.length; i++) {
        var column = columns[i],
            value = filter.columns[column.name];
        if (!value) continue;
        var clause = sql.where(column.control, value);
        if (!clause) continue;
        var name = '';
        if (column.manyToMany) {
            var ref = column.manyToMany.ref;
            name = sql.fullName(ref.table, ref.pk);
        } else {
            name = sql.fullName(table.name, column.name);
        }
        statements.push([name, clause].join(' '));
    }
    return statements.length ? ' WHERE ' + statements.join(' AND ') : '';
}
