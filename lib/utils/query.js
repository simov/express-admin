
exports.client = {};

function quotes (result) {
    return exports.client.mysql ? result : result.replace(/`/g,'"');
}

exports.sql = function (name) {
    var s = '';
    switch (name) {
        // select
        case 'list-view': s = this.client.mysql
                ? "SELECT {0} FROM `{1}` {2} {3} {4} ORDER BY {5} LIMIT {6},{7} ;"
                : "SELECT {0} FROM `{1}` {2} {3} {4} ORDER BY {5} LIMIT {7} OFFSET {6} ;";
        break;
        case 'get-record': s = 
                "SELECT {0} FROM `{1}` WHERE `{2}`={3} ;";
        break;
        case 'get-records': s = 
                "SELECT {0} FROM `{1}` ;";
        break;
        case 'total': s = 
                "SELECT COUNT(DISTINCT {0}) AS `count` FROM `{1}` {2} {3} ;"
        break;
        // edit
        case 'insert': s = this.client.mysql
                ? "INSERT INTO `{0}` ({1}) VALUES ({2}) ;"
                : "INSERT INTO `{0}` ({1}) VALUES ({2}) RETURNING `{3}` ;";
        break;
        case 'update': s = 
                "UPDATE `{0}` SET {1} WHERE `{2}`={3} ;";
        break;
        case 'delete': s = 
                "DELETE FROM `{0}` WHERE `{1}`={2} ;";
        break;
        // many to many
        case 'insert-many': s = 
                "INSERT INTO `{0}` ({1}) VALUES {2} ;";
        break;
        case 'delete-many': s = 
                "DELETE FROM `{0}` WHERE `{1}`={2} AND `{3}` IN ({4}) ;";
        break;


        // config queries
        case 'show-tables': s = this.client.mysql
                ? "SHOW TABLES IN `{0}` ;"
                : "SELECT table_name FROM information_schema.tables WHERE table_schema = '{0}' ;";
        break;
        case 'show-columns': s = this.client.mysql
                ? "SHOW COLUMNS IN `{0}` IN `{1}` ;"
                : 'SELECT cs.column_name AS "Field", cs.data_type AS "Type", cs.is_nullable AS "Null", tc.constraint_type AS "Key", cs.column_default AS "Default", '+
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
                '	AND cs.table_schema = \'{1}\' ;';
        break;
        
        default: s = 'Query name doesn\'t exist'; break;
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
