
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
            var ref = columns[i].oneToMany;
                
            names.push(sql.group(ref.table, ref.columns, columns[i].name));
            if (columns[i].fk) {
                joins.push(sql.joins(table.name, columns[i].fk, ref.table, ref.pk));
            } else {
                joins.push(sql.joins(table.name, columns[i].name, ref.table, ref.pk));
            }
        }
        else if (columns[i].manyToMany) {
            var ref = columns[i].manyToMany.ref;
            
            names.push(sql.group(ref.table, ref.columns, columns[i].name));
            
            var link = columns[i].manyToMany.link;
            joins.push(sql.joins(table.name, table.pk, link.table, link.parentPk));
            joins.push(sql.joins(link.table, link.childPk, ref.table, ref.pk));
        }
        else {
            names.push(sql.fullName(table.name, columns[i].name));
        }
    }
    names.unshift(sql.as(table.name, table.pk, '__pk'));

    var where = statement(table, columns, args.filter);

    // always group by pk inside the listview!
    var group = sql.groupby(table.name, table.pk);

    var order = '';
    if (args.filter.order) {
        for (var i=0; i < columns.length; i++) {
            if (columns[i].name == args.filter.order) {
                var direction = args.filter.direction || 'ASC';
                var column = (columns[i].oneToMany || columns[i].manyToMany)
                    ? args.filter.order
                    : sql.fullName(table.name, args.filter.order);
                order = [column, direction].join(' ');
                break;
            }
        }
    }
    else if (!Object.keys(view.listview.order).length) {
        var pk = table.pk instanceof Array ? table.pk[0] : table.pk;
        order = sql.fullName(table.name, pk) + ' ASC';
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
        /*columns*/names.join(), sql.table(table.name),
        joins.join(' '), where, group, order, from, view.listview.page);
}

function statement (table, columns, filter) {
    var statements = [];
    for (var i=0; i < columns.length; i++) {
        var column = columns[i],
            value = filter.columns[column.name];
        if (!value) continue;

        if (column.oneToMany && column.fk) {
            if (value == 'NULL') continue;
            statements.push(sql.andValues(table.name, column.fk, value));
        }
        else if (column.manyToMany) {
            var ref = column.manyToMany.ref;
            statements.push(sql.in(ref.table, ref.pk, value));
        }
        else {
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
    }
    return statements.length ? ' WHERE ' + statements.join(' AND ') : '';
}
