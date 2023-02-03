
exports.get = (req, res, next) => {
  res.locals.partials = {
    content: '404'
  }
  next()
}
