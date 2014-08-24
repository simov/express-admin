
exports.client = {};

function quotes (result) {
    return (exports.client.mysql || exports.client.sqlite)
        ? result : result.replace(/`/g,'"');
}

exports.sql = function (name) {
    var s = '';
    switch (name) {
        // config queries
        case 'show-tables': s = this.client.mysql
                ? "SHOW TABLES IN `{0}` ;"
                : (this.client.pg
                    ? "SELECT table_name FROM information_schema.tables WHERE table_schema = '{0}' ;"
                    : "SELECT * FROM sqlite_master WHERE type = 'table' ;"
                );
        break;
        case 'show-columns': s = this.client.mysql
                ? "SHOW COLUMNS IN `{0}` IN `{1}` ;"
                : (this.client.pg
                    ? 'SELECT cs.column_name AS "Field", cs.data_type AS "Type", cs.is_nullable AS "Null", tc.constraint_type AS "Key", cs.column_default AS "Default", '+
                        'cs.numeric_precision, cs.numeric_precision_radix, cs.numeric_scale, cs.character_maximum_length '+
                        'FROM "information_schema"."columns" cs '+
                        'LEFT JOIN "information_schema"."key_column_usage" kc '+
                        '	ON cs.column_name = kc.column_name '+
                        '	AND cs.table_schema = kc.table_schema '+
                        '	AND cs.table_name = kc.table_name '+
                        'LEFT JOIN "information_schema"."table_constraints" tc '+
                        '	ON kc.constraint_name = tc.constraint_name '+
                        '	AND kc.table_schema = tc.table_schema '+
                        '	AND kc.table_name = tc.table_name '+
                        'WHERE '+
                        '	cs.table_name = \'{0}\' '+
                        '	AND cs.table_schema = \'{1}\' ;'
                    : "PRAGMA table_info('{0}') ;"
                );
        break;
    }
    return s;
}

exports.replace = function () {
    if (!arguments.length) return null;
    var sql = quotes(this.sql(arguments[0]));
    if (arguments.length > 1) {
        [].splice.call(arguments, 0, 1);
        for (var i=0; i < arguments.length; i++) {
            sql = sql.replace('{'+i+'}', arguments[i]);
        }
    }
    return sql;
}
