
// https://github.com/mysqljs/mysql
function MySql () {
  try {
    var client = require('mysql')
  }
  catch (err) {
    throw Error('The `mysql` module was not found')
  }
  var connection = null
  var config = {}
  var mysql = true
  var name = 'mysql'

  var connect = (options, done) => {
    connection = client.createConnection(options)
    connection.connect((err) => {
      if (err) return done(err)
      Object.keys(connection.config).forEach((key) => {
        config[key] = connection.config[key]
      })
      config.schema = config.database
      done()
    })
    connection.on('error', (err) => {
      if (err.code == 'PROTOCOL_CONNECTION_LOST') {
        handleDisconnect(options)
      }
      else throw err
    })
  }

  var handleDisconnect = (options) => {
    setTimeout(() => {
      connect(options, (err) => {
        err && handleDisconnect(options)
      })
    }, 2000)
  }

  var query = (sql, done) => {
    connection.query(sql, (err, rows) => {
      if (err) return done(err)
      done(null, rows)
    })
  }

  var getColumnsInfo = (data) => {
    var columns = {}
    for (var key in data) {
      var column = data[key]
      columns[column.Field] = {
        type: column.Type,
        allowNull: column.Null === 'YES' ? true : false,
        key: column.Key.toLowerCase(),
        defaultValue: column.Default
        // extra: column.Extra
      }
    }
    return columns
  }

  return {
    config,
    name,
    connect,
    handleDisconnect,
    query,
    getColumnsInfo,
  }
}

// https://github.com/brianc/node-postgres
function PostgreSQL () {
  try {
    var client = require('pg')
  }
  catch (err) {
    throw Error('The `pg` module was not found')
  }
  var connection = null
  var config = {}
  var pg = true
  var name = 'pg'

  var connect = (options, done) => {
    connection = new client.Client(options)
    connection.connect((err) => {
      if (err) return done(err)
      Object.keys(connection.connectionParameters).forEach((key) => {
        config[key] = connection.connectionParameters[key]
      })
      config.schema = options.schema || 'public'
      done()
    })
  }

  var query = (sql, done) => {
    connection.query(sql, (err, result) => {
      if (err) return done(err)
      if (result.command == 'INSERT' && result.rows.length) {
        var obj = result.rows[0]
        var key = Object.keys(obj)[0]
        result.insertId = obj[key]
        return done(null, result)
      }
      // select
      done(null, result.rows)
    })
  }

  function getType (column) {
    if (/^double precision$/.test(column.Type))
      return 'double'

    else if (/^numeric$/.test(column.Type))
      return column.numeric_precision
        ? 'decimal('+column.numeric_precision+','+column.numeric_scale+')'
        : 'decimal'

    else if (/^time\s.*/.test(column.Type))
      return 'time'

    else if (/^timestamp\s.*/.test(column.Type))
      return 'timestamp'

    else if (/^bit$/.test(column.Type))
      return 'bit('+column.character_maximum_length+')'

    else if (/^character$/.test(column.Type))
      return 'char('+column.character_maximum_length+')'

    else if (/^character varying$/.test(column.Type))
      return 'varchar('+column.character_maximum_length+')'

    else if (/^boolean$/.test(column.Type))
      return 'char'

    else return column.Type
  }

  var getColumnsInfo = (data) => {
    var columns = {}
    for (var key in data) {
      var column = data[key]
      columns[column.Field] = {
        type: getType(column),
        allowNull: column.Null === 'YES' ? true : false,
        key: (column.Key && column.Key.slice(0,3).toLowerCase()) || '',
        defaultValue: column.Default && column.Default.indexOf('nextval') == 0 ? null : column.Default
        // extra: column.Extra
      }
    }
    return columns
  }

  return {
    config,
    name,
    connect,
    query,
    getColumnsInfo,
  }
}

// https://github.com/TryGhost/node-sqlite3
function SQLite () {
  try {
    var client = require('sqlite3')
  }
  catch (err) {
    throw new Error('The `sqlite3` module was not found')
  }
  var connection = null
  var config = {}
  var sqlite = true
  var name = 'sqlite'

  var connect = (options, done) => {
    connection = new client.Database(options.database)
    config = {schema:''}
    done()
  }

  var query = (sql, done) => {
    if (/^(insert|update|delete)/i.test(sql)) {
      connection.run(sql, function (err) {
        if (err) return done(err)
        done(null, {insertId: this.lastID})
      })
    }
    else {
      connection.all(sql, function (err, rows) {
        if (err) return done(err)
        done(null, rows)
      })
    }
  }

  var getColumnsInfo = (data) => {
    var columns = {}
    for (var i=0; i < data.length; i++) {
      var column = data[i]
      columns[column.name] = {
        type: column.type,
        allowNull: column.notnull === 1 ? false : true,
        key: column.pk === 1 ? 'pri' : '',
        defaultValue: column.dflt_value
      }
    }
    return columns
  }

  return {
    config,
    name,
    connect,
    query,
    getColumnsInfo,
  }
}

module.exports = (config) =>
  config.mysql ? MySql() :
  config.pg ? PostgreSQL() :
  config.sqlite ? SQLite() :
  null
