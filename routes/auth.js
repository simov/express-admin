
exports.status = (req, res, next) => {
  res.locals.show = {
    error: req.session.error,
    success: req.session.success
  }
  res.locals.username = req.session.username
  delete req.session.error
  delete req.session.success
  delete req.session.username
  next()
}

exports.restrict = (req, res, next) => {
  if (res.locals._admin.readonly) return next()

  if (req.session.user) return next()
  req.session.error = res.locals.string['access-denied']
  res.redirect(res.locals.root + '/login')
}

exports.login = (req, res) => {
  // query the db for the given username
  var user = res.locals._admin.users[req.body.username]
  if (!user) {
    req.session.error = res.locals.string['find-user']
    req.session.username = req.body.username
    res.redirect(res.locals.root + '/login')
    return
  }

  // apply the same algorithm to the POSTed password, applying
  // the hash against the pass / salt, if there is a match we
  // found the user
  if (req.body.password === user.pass) {
    // Regenerate session when signing in
    // to prevent fixation
    req.session.regenerate((err) => {
      // Store the user's primary key
      // in the session store to be retrieved,
      // or in this case the entire user object
      req.session.user = user
      res.redirect(res.locals.root + '/')
    })
  }
  else {
    req.session.error = res.locals.string['invalid-password']
    req.session.username = req.body.username
    res.redirect(res.locals.root + '/login')
  }
}

exports.logout = (req, res) => {
  // destroy the user's session to log them out
  // will be re-created next request
  req.session.destroy(() => {
    // successfully logged out
    res.redirect(res.locals.root + '/login')
  })
}
