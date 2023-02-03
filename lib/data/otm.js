
var async = require('async')
var qb = require('../qb')()


// modifies `args.config.columns` with `value`

function getData (args, ref, done) {
  var str = qb.otm.select(args, ref)
  args.db.client.query(str, (err, rows) => {
    if (err) return done(err)
    done(null, rows)
  })
}

exports.get = (args, done) => {
  async.each(args.config.columns, (column, done) => {
    if ((!column.oneToMany && !column.manyToMany) || !column.control.select) return done()
    var ref = column.oneToMany ? column.oneToMany : column.manyToMany.ref
    getData(args, ref, (err, rows) => {
      if (err) return done(err)
      column.value = rows
      done()
    })
  }, done)
}

exports._getData = getData
