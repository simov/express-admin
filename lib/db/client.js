
/**
 * MySql: https://github.com/felixge/node-mysql
 */

function mysqlClient () {
    this.client = require('mysql');
    this.connection = null;
    this.config = null;

    this.mysql = true;
    this.name = 'mysql';
}

mysqlClient.prototype.connect = function (options, cb) {
    this.connection = this.client.createConnection(options);
    this.connection.connect(function (err) {
        if (err) return cb(err);
        this.config = this.connection.config;
        this.config.schema = this.config.database;
        cb();
    }.bind(this));
    
    this.connection.on('error', function (err) {
        if (err.code == 'PROTOCOL_CONNECTION_LOST') {
            this.handleDisconnect(options);
        }
        else throw err;
    }.bind(this));
}

mysqlClient.prototype.handleDisconnect = function (options) {
    setTimeout(function () {
        this.connect(options, function (err) {
            err && this.handleDisconnect(options);
        }.bind(this));
    }.bind(this), 2000);
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
            defaultValue: column.Default
            // extra: column.Extra
        };
    }
    return columns;
}


/**
 * PostgreSql: https://github.com/brianc/node-postgres
 * or: https://github.com/brianc/node-postgres-pure
 */

function pgClient () {
    var pg;
    try {pg = require('pg')}
    catch (err) {
        try {pg = require('pg.js')}
        catch (err) {
            throw Error('Could not find `pg` or `pg.js` modules');
        }
    }

    this.client = pg;
    this.connection = null;
    this.config = null;

    this.pg = true;
    this.name = 'pg';
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
        case /^double precision$/.test(column.Type):
            return 'double';

        case /^numeric$/.test(column.Type):
            return column.numeric_precision
                ? 'decimal('+column.numeric_precision+','+column.numeric_scale+')'
                : 'decimal'
        
        case /^time\s.*/.test(column.Type):
            return 'time';	
        case /^timestamp\s.*/.test(column.Type):
            return 'timestamp';

        case /^bit$/.test(column.Type):
            return 'bit('+column.character_maximum_length+')';
        case /^character$/.test(column.Type):
            return 'char('+column.character_maximum_length+')';
        case /^character varying$/.test(column.Type):
            return 'varchar('+column.character_maximum_length+')';

        case /^boolean$/.test(column.Type):
            return 'char';

        default: return column.Type;
    }
}
pgClient.prototype.getColumnsInfo = function (data) {
    var columns = {};
    for (var key in data) {
        var column = data[key];
        columns[column.Field] = {
            type: getType(column),
            allowNull: column.Null === 'YES' ? true : false,
            key: (column.Key && column.Key.slice(0,3).toLowerCase()) || '',
            defaultValue: column.Default && column.Default.indexOf('nextval')==0 ? null : column.Default
            // extra: column.Extra
        };
    }
    return columns;
}


/**
 * Sqlite: https://github.com/mapbox/node-sqlite3
 */

function sqliteClient () {
    this.client = require('sqlite3');
    this.connection = null;
    this.config = null;

    this.sqlite = true;
    this.name = 'sqlite';
}

sqliteClient.prototype.connect = function (options, cb) {
    this.connection = new this.client.Database(options.database);
    this.config = {schema:''};
    cb();
}

sqliteClient.prototype.query = function (sql, cb) {
    if (/^(insert|update|delete)/i.test(sql)) {
        this.connection.run(sql, function (err) {
            if (err) return cb(err);
            cb(null, {insertId: this.lastID});
        });
    } else {
        this.connection.all(sql, function (err, rows) {
            if (err) return cb(err);
            cb(null, rows);
        });
    }
}

sqliteClient.prototype.getColumnsInfo = function (data) {
    var columns = {};
    for (var i=0; i < data.length; i++) {
        var column = data[i];
        columns[column.name] = {
            type: column.type,
            allowNull: column.notnull === 1 ? false : true,
            key: column.pk === 1 ? 'pri' : '',
            defaultValue: column.dflt_value
        };
    }
    return columns;
}


/**
 * Factory
 */

function Client (config) {
    if (config.hasOwnProperty('mysql'))
        return new mysqlClient();

    if (config.hasOwnProperty('pg'))
        return new pgClient();

    if (config.hasOwnProperty('sqlite'))
        return new sqliteClient();

    else return new Error('Not supported database type!');
}

exports = module.exports = Client;
