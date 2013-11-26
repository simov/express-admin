
var sql = require('./sql'),
    query = require('./query');


/**
 * MySql: https://github.com/felixge/node-mysql
 */

function mysqlClient () {
    this.client = require('mysql');
    this.connection = null;
    this.config = null;
    sql.client.mysql = true;
    query.client.mysql = true;
}

mysqlClient.prototype.connect = function (options, cb) {
    // options.typeCast = false;
    // options.multipleStatements = true;
    this.connection = this.client.createConnection(options);
    this.connection.connect(function (err) {
        if (err) return cb(err);
        this.config = this.connection.config;
        this.config.schema = this.config.database;
        cb();
    }.bind(this));
}

mysqlClient.prototype.query = function (sql, cb) {
    this.connection.query(sql, function (err, rows) {
        if (err) return cb(err);
        cb(null, rows);
    });
}

mysqlClient.prototype.getColumnsInfo = function (data) {
    var columns = {};
    for (var key in data) {
        var column = data[key];
        columns[column.Field] = {
            type: column.Type,
            allowNull: column.Null === 'YES' ? true : false,
            key: column.Key.toLowerCase(),
            defaultValue: column.Default,
            extra: column.Extra
        };
    }
    return columns;
}


/**
 * PostgreSql: https://github.com/brianc/node-postgres
 */

function pgClient () {
    this.client = require('pg');
    this.connection = null;
    this.config = null;
    sql.client.pg = true;
    query.client.pg = true;
}

pgClient.prototype.connect = function (options, cb) {
    this.connection = new this.client.Client(options);
    this.connection.connect(function (err) {
        if (err) return cb(err);
        this.config = this.connection.connectionParameters;
        this.config.schema = options.schema || 'public';
        cb();
    }.bind(this));
}

pgClient.prototype.query = function (sql, cb) {
    this.connection.query(sql, function (err, result) {
        if (err) return cb(err);
        if (result.command == 'INSERT' && result.rows.length) {
            var obj = result.rows[0],
                key = Object.keys(obj)[0];
            result.insertId = obj[key];
            return cb(null, result);
        }
        // select
        cb(null, result.rows);
    });
}

function getType (column) {
    switch (true) {
        case /^double precision$/.test(column.data_type):
            return 'double';

        case /^numeric$/.test(column.data_type):
            return column.numeric_precision
                ? 'decimal('+column.numeric_precision+','+column.numeric_scale+')'
                : 'decimal'
        
        case /^time\s.*/.test(column.data_type):
            return 'time';	
        case /^timestamp\s.*/.test(column.data_type):
            return 'timestamp';

        case /^character$/.test(column.data_type):
            return 'char';
        case /^character varying$/.test(column.data_type):
            return 'varchar('+column.character_maximum_length+')';
    }
}
pgClient.prototype.getColumnsInfo = function (data) {
    var columns = {};
    for (var key in data) {
        var column = data[key];
        columns[column.Field] = {
            type: getType(column),
            allowNull: column.Null === 'YES' ? true : false,
            key: column.Key.slice(0,3).toLowerCase(),
            defaultValue: column.Default
            // extra: column.Extra
        };
    }
    return columns;
}


/**
 * Factory
 */

function Client (config) {
    switch (true) {
        case config.hasOwnProperty('mysql'):
            return new mysqlClient();
            break;

        case config.hasOwnProperty('pg'):
            return new pgClient();
            break;
    }
}

exports = module.exports = Client;
