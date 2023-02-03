
var slugify = require('slugify')


// check for column existence
function exists (columns, name) {
  for (var i=0; i < columns.length; i++) {
    if (columns[i].name == name) return true
  }
  return false
}

// create settings object for a table
function createTable (name, pk, view) {
  return {
    slug: slugify(name),
    table: {
      name: name,
      pk: pk,
      verbose: name,
      view: view
    },
    columns: [],
    mainview: {
      show: true
    },
    listview: {
      order: {},
      page: 25
    },
    editview: {
      readonly: false
    }
  }
}

// create a settings object for a column
function createColumn (name, info) {
  return {
    name: name,
    verbose: name,
    control: {text: true},
    type: info.type,
    allowNull: info.allowNull,
    defaultValue: info.defaultValue,
    listview: {show: true},
    editview: {show: true}
  }
}

// get the first found primary key from a given table's columns list
function primaryKey (columns) {
  var pk = []
  for (var name in columns) {
    for (var property in columns[name]) {
      if (columns[name][property] === 'pri') {
        pk.push(name)
      }
    }
  }
  return !pk.length ? '' : (pk.length > 1 ? pk : pk[0])
}

// insert new tables and columns for a settings object
exports.refresh = (settings, info) => {
  for (var table in info) {
    var view  = info[table].__view
    delete info[table].__view

    var columns = info[table]
    var pk = primaryKey(columns)

    if (settings[table] === undefined) {
      settings[table] = createTable(table, pk, view)
    }

    for (var name in columns) {
      if (exists(settings[table].columns, name)) continue

      settings[table].columns.push(createColumn(name, columns[name]))
    }
  }
  return settings
}
