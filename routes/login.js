
exports.get = (req, res, next) => {
  res.locals.partials = {
    content: 'login'
  }
  next()
}
