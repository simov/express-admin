
var async = require('async')
var dcopy = require('deep-copy')
var editview = require('../lib/editview/index')
var database = require('../lib/db/update')


function getArgs (req, res) {
  var args = {
    settings : res.locals._admin.settings,
    db       : res.locals._admin.db,
    readonly : res.locals._admin.readonly,
    debug    : res.locals._admin.debug,
    slug     : req.params[0],
    id       : req.params[1] == 'add' ? null : req.params[1].split(','),
    data     : req.body,
    upload   : req.files,
    upath    : res.locals._admin.config.admin.upload
  };
  args.name = res.locals._admin.slugs[args.slug]
  return args
}

function page (req, args) {
  if (!req.session.filter || !req.session.filter[args.name]) return ''
  var page = req.session.filter[args.name].page
  return page ? '?p='+page : ''
}

function action (req, name) {
  return {}.hasOwnProperty.call(req.body.action, name)
}

exports.get = (req, res, next) => {
  var args = getArgs(req, res);

  editview.getTypes(args, (err, data) => {
    if (err) return next(err)
    render(req, res, next, data, args)
  })
}

exports.post = (req, res, next) => {
  var args = getArgs(req, res)
  var events = res.locals._admin.events

  editview.getTypes(args, (err, data) => {
    if (err) return next(err)

    var view = req.body.view,
      table = Object.keys(view)[0]

    if (action(req, 'remove')) {
      // should be based on constraints
      args.action = 'remove'

    } else if ({}.hasOwnProperty.call(view[table].records[0], 'insert')) {
      if (args.error && !args.readonly)
        return render(req, res, next, data, args)
      args.action = 'insert'

    } else {
      if (args.error && !args.readonly)
        return render(req, res, next, data, args)
      args.action = 'update'
    }

    async.series([
      events.preSave.bind(events, req, res, args),

      database.update.bind(database, args),

      events.postSave.bind(events, req, res, args)

    ], (err) => {
      if (err) {
        req.session.error = err.message
        res.redirect(res.locals.root+'/'+args.slug+page(req, args))
        return
      }

      req.session.success = true

      // based on clicked button
      if (action(req, 'remove')) {
        // the message should be different for delete
        res.redirect(res.locals.root+'/'+args.slug+page(req, args))
      }
      else if (action(req, 'save')) {
        res.redirect(res.locals.root+'/'+args.slug+page(req, args))
      }
      else if (action(req, 'another')) {
        res.redirect(res.locals.root+'/'+args.slug+'/add')
      }
      else if (action(req, 'continue')) {
        if (args.readonly) return render(req, res, next, data, args)
        res.redirect(res.locals.root+'/'+args.slug+'/'+args.id.join())
      }
    })
  })
}

function render (req, res, next, data, args) {
  var string = res.locals.string
  var view = args.settings[args.name]

  res.locals.view = {
    tables: data.view.tables,
    name: view.table.verbose,
    slug: args.slug,
    action: req.url,
    readonly: view.editview.readonly,
    success: args.success
  }
  res.locals.breadcrumbs = {
    links: [
      {url: '/', text: string.home},
      {url: '/'+args.slug, text: view.table.verbose},
      {active: true, text: req.params[1]}
    ]
  }
  res.locals.show.error = args.error
  res.locals.show.delete = !(req.params[1] == 'add')

  data.oneToOne.one = true
  data.oneToOne.type = 'one'
  data.manyToOne.type = 'many'
  res.locals.inline = [data.oneToOne, data.manyToOne]

  res.locals.partials = {
    content:  'editview',
    view:     'editview/view',
    inline:   'editview/inline',
    column:   'editview/column'
  }

  next()
}
