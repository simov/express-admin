
var query = require('../sql/query'),
    sql = require('../sql/sql');
var xsql = require('../../../xsql/lib/instance');
var x = new xsql({dialect:
    (sql.client.mysql&&'mysql')||
    (sql.client.pg&&'pg')||
    (sql.client.sqlite&&'sqlite')
});


function join (table, column, index) {
    if (column.oneToMany) {
        var ref = column.oneToMany,
            alias = {alias: ref.table+index};

        var join = column.fk
            ? [joins(table, column.fk, ref, ref.pk, alias)]
            : [joins(table, column.name, ref, ref.pk, alias)];
    }
    else if (column.manyToMany) {
        var ref = column.manyToMany.ref,
            link = column.manyToMany.link,
            alias = {alias: ref.table+index};

        var join = [
            joins(table, table.pk, link, link.parentPk),
            joins(link, link.childPk, ref, ref.pk, alias)
        ];
    }

    var columns = (function columns (columns, alias) {
        var result = [];
        for (var i=0; i < columns.length; i++) {
            if (x.dialect == 'mysql') {
                result.push(x.func('cast',x.as(x.name(columns[i],alias),'char')));
            }
            else if (x.dialect == 'pg') {
                result.push(x.name(columns[i],alias));
            }
            else if (x.dialect == 'sqlite') { 
                result.push(x.func('ifnull',[x.name(columns[i],alias),x.wrap('')]));
            }
        }
        return result;
    }(ref.columns, alias.alias));

    var concat = (/mysql|pg/.test(x.dialect))
        ? x.func('concat_ws',[x.wrap(' '),columns])
        // sqlite
        : columns.join("||' '||");

    var group = (/mysql|sqlite/.test(x.dialect))
        ? x.func('group_concat',['distinct',concat],' ')
        // pg
        : x.func('string_agg',['distinct',[concat,x.wrap(',')].join()],' ');

    var as = x.as(group,x.name(column.name));

    // console.log(sql.group(ref, ref.columns, column.name, alias));
    // console.log(as.yellow);


    function joins (table, fk, ref, pk, alias) {
        var tbl = table.name||table.table,
            rsch = (x.dialect=='pg'&&(ref.schema||sql.schema))||undefined,
            tsch = (x.dialect=='pg'&&(table.schema||sql.schema))||undefined,
            ali = (alias&&alias.alias)||undefined,
            ref = ref.table;

        var fks = (fk instanceof Array) ? fk : [fk];
        var pks = (pk instanceof Array) ? pk : [pk];

        var result = [];
        for (var i=0; i < fks.length; i++) {
            var pk = pks[i], fk = fks[i];

            result.push(x.eq(
                x.name(fk,tbl,tsch),
                ali ? x.name(pk,ali) : x.name(pk,ref,rsch)));
        }

        return x.join(
            ali ? x.alias(x.name(ref,rsch),x.name(ali)) : x.name(ref,rsch),
            result,
            'left'
        );
    }

    // console.log('r'.cyan, join);
    // console.log('x'.yellow, jjoin);


    return {
        ref: ref, link: link, alias: alias,
        join: join,
        select: as
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

    var where = statement(table, columns, args.filter, joins);

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

function statement (table, columns, filter, joins) {
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
            if (!column.listview.show) {
                var result = join(table, columns[i], i);
                joins.push(result.join[0]);
                joins.push(result.join[1]);
            }
            var ref = column.manyToMany.ref,
                alias = {alias: ref.table+i};
            statements.push(sql.in(ref, ref.pk, value, alias));
        }
        else {
            var clause = sql.where(column.control, value);
            if (!clause) continue;
            var name = sql.fullName(table, column.name);
            statements.push([name, clause].join(' '));
        }
    }
    return statements.length
        ? ' WHERE ' + statements.join(filter.or ? ' OR ' : ' AND ')
        : '';
}
