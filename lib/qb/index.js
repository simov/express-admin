
module.exports = (x) => ({
  lst: require('./lst')(x),
  tbl: require('./tbl')(x),
  otm: require('./otm')(x),
  mtm: require('./mtm')(x),
  partials: require('./partials')(x)
})
