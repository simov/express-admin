
exports.client = {};

function quotes (result) {
    return exports.client.mysql ? result : result.replace(/`/g,'"');
}

exports.sql = function (name) {
    var s = '';
    switch (name) {
        // select
        case 'list-view': s = this.client.mysql
                ? "SELECT {0} FROM `{1}` {2} ORDER BY {3} LIMIT {4},{5} ;"
                : "SELECT {0} FROM `{1}` {2} ORDER BY {3} LIMIT {5} OFFSET {4} ;";
        break;
        case 'get-record': s = 
                "SELECT {0} FROM `{1}` WHERE `{2}`={3} ;";
        break;
        case 'get-records': s = 
                "SELECT {0} FROM `{1}` ;";
        break;
        case 'total': s = 
                "SELECT COUNT(*) AS `count` FROM `{0}` ;";
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
                : "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ;";
        break;
        case 'show-columns': s = this.client.mysql
                ? "SHOW COLUMNS IN `{0}` IN `{1}` ;"
                : 'SELECT column_name AS "Field", data_type AS "Type", is_nullable AS "Null", \'?\' AS "Key", column_default AS "Default", \'?\' AS "Extra" FROM information_schema.columns WHERE table_name =\'{0}\';';
                // describe table_name ; - same
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
