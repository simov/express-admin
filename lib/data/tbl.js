
var qb = require('../qb')()


// get table records
exports.get = (args, done) => {
  if (args.post) {
    var table = args.config.table
    var rows = args.post[table.name].records || []
    return done(null, rows)
  }

  var str = qb.tbl.select(args)
  args.db.client.query(str, (err, rows) => {
    if (err) return done(err)
    var result = []
    for (var i=0; i < rows.length; i++) {
      result.push({columns: rows[i]})
    }
    done(null, result)
  })
}
