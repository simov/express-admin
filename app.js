
var fs = require('fs')
var path = require('path')

var express = require('express')
var bodyParser = require('body-parser')
var multipart = require('connect-multiparty')
var cookieParser = require('cookie-parser')
var session = require('express-session')
var csrf = require('csurf')
var methodOverride = require('method-override')
var serveStatic = require('serve-static')
var consolidate = require('consolidate')
var hogan = require('hogan.js')

var moment = require('moment')
var async = require('async')

var Client = require('./lib/db/client')
var schema = require('./lib/db/schema')
var settings = require('./lib/app/settings')
var routes = require('./lib/app/routes')

var Xsql = require('xsql')
var Qb = require('./lib/qb')
var dcopy = require('deep-copy')


// sets args.db.client
// updates args.settings
function initDatabase (args, done) {
  try {
    var client = Client(args.config)
  }
  catch (err) {
    return done(err)
  }
  var qb
  async.series([
    (done) => {
      var options = args.config.mysql || args.config.pg || args.config.sqlite
      client.connect(options, (err) => {
        if (err) return done(err)
        var x = new Xsql({
          dialect: client.name,
          schema: client.config.schema
        })
        qb = Qb(x)
        done()
      })
    },
    (done) => {
      var sql = qb.partials.tables(client.config.schema)
      client.query(sql, (err, rows) => {
        if (err) return done(err)
        if (!rows.length) return done(new Error('Empty schema!'))
        done()
      })
    },
    (done) => {
      schema.getData(client, (err, data) => {
        if (err) return done(err)
        // write back the settings
        var updated = settings.refresh(args.settings, data)
        fs.writeFileSync(args.config.admin.settings, JSON.stringify(updated, null, 2), 'utf8')
        args.settings = updated
        done()
      })
    }
  ], (err) => {
    if (err) return done(err)
    args.db = {client}
    done()
  })
}

// modifies args
function initSettings (args) {
  // route variables

  // upload
  var upload = args.config.admin.upload || path.join(__dirname, 'public/upload')
  args.config.admin.upload = upload
  if (!fs.existsSync(upload)) fs.mkdirSync(upload)

  // languages
  args.langs = (() => {
    var dpath = path.join(__dirname, 'config/lang')
    var files = fs.readdirSync(dpath)
    var langs = {}
    for (var i=0; i < files.length; i++) {
      var name = files[i].replace(path.extname(files[i]), '')
      langs[name] = require(path.join(dpath, files[i]))
    }
    if (args.config.admin.locale) {
      var fpath = args.config.admin.locale
      var fname = path.basename(fpath)
      var locale = fname.replace(path.extname(fname), '')
      langs[locale] = require(fpath)
      args.locale = locale
    }
    return langs
  })()

  // slug to table map
  args.slugs = (() => {
    var slugs = {}
    for (var key in args.settings) {
      slugs[args.settings[key].slug] = key
    }
    return slugs
  })()

  // readonly mode
  args.readonly = args.config.admin.readonly || false
  // debug logs
  args.debug = args.config.admin.debug || false

  // events
  for (var key in args.custom) {
    var fpath = args.custom[key].events
    if (fpath) break
  }
  var events = fpath ? require(fpath) : {}
  if (!events.hasOwnProperty('preSave'))
    events.preSave = (req, res, args, next) => {next()}
  if (!events.hasOwnProperty('postSave'))
    events.postSave = (req, res, args, next) => {next()}
  if (!events.hasOwnProperty('preList'))
    events.preList = (req, res, args, next) => {next()}
  args.events = events


  // template variables

  // root
  if (args.config.admin.root) {
    var root = args.config.admin.root
    if (/.*\/$/.test(root)) args.config.admin.root = root.slice(0, -1)
  }
  else {
    args.config.admin.root = ''
  }

  // layouts
  args.layouts = args.config.admin.layouts !== undefined
    ? args.config.admin.layouts
    : true

  // themes
  args.themes = args.config.admin.themes === undefined || args.config.admin.themes
    ? {theme: require(path.join(__dirname, 'config/themes'))}
    : null

  // languages
  args.languages = (() => {
    if (args.config.admin.languages !== undefined && !args.config.admin.languages) return null
    var langs = []
    for (var key in args.langs) {
      langs.push({key: key, name: args.langs[key].name})
    }
    return {language: langs}
  })()

  // footer
  args.footer = args.config.admin.footer || {
    text: 'Express Admin',
    url: 'https://github.com/simov/express-admin'
  }

  // static
  args.libs = dcopy(require(path.join(__dirname, 'config/libs')))
  args.libs.external = {css: [], js: []}
  for (var key in args.custom) {
    var assets = args.custom[key].public
    if (!assets) continue
    if (assets.local) {
      args.libs.js = args.libs.js.concat(assets.local.js || [])
      args.libs.css = args.libs.css.concat(assets.local.css || [])
    }
    if (assets.external) {
      args.libs.external.js = args.libs.external.js.concat(assets.external.js || [])
      args.libs.external.css = args.libs.external.css.concat(assets.external.css || [])
    }
  }
}

function initServer (args) {
  var r = require('./routes');

  // general settings
  var app = express()
    .set('views', path.resolve(__dirname, './views'))
    .set('view engine', 'html')
    .engine('html', consolidate.hogan)

    .use(bodyParser.json())
    .use(bodyParser.urlencoded({extended: true}))
    .use(multipart())

    .use(cookieParser())
    .use(session(args.config.admin.session || {
      name: 'express-admin',
      secret: 'very secret',
      saveUninitialized: true,
      resave: true
    }))
    .use(r.auth.status)// session middleware
    .use(csrf())
    .use(methodOverride())

  // custom favicon
  if (args.config.admin.favicon) {
    app.use(serveStatic(args.config.admin.favicon))
  }

  app.use(serveStatic(path.join(__dirname, 'public')))
  app.use(serveStatic((() => {
    var dpath = path.resolve(__dirname, 'node_modules/express-admin-static')
    if (!fs.existsSync(dpath)) {
      dpath = path.resolve(__dirname, '../express-admin-static')
    }
    return dpath
  })()))

  if (!args.readonly) app.set('view cache', true)

  // register custom static local paths
  for (var key in args.custom) {
    var assets = args.custom[key].public
    if (!assets || !assets.local || !assets.local.path ||
      !fs.existsSync(assets.local.path)) continue
    app.use(serveStatic(assets.local.path))
  }

  // pass server wide variables
  app.use((req, res, next) => {
    // app data
    res.locals._admin = args

    // i18n
    var lang = req.cookies.lang || args.locale || 'en'
    res.cookie('lang', lang, {path: '/', maxAge: 900000000})
    moment.locale(lang === 'cn' ? 'zh-cn' : lang)

    // template vars
    res.locals.string = args.langs[lang]
    res.locals.root = args.config.admin.root
    res.locals.libs = args.libs
    res.locals.themes = args.themes
    res.locals.layouts = args.layouts
    res.locals.languages = args.languages
    res.locals.footer = args.footer

    // required for custom views
    res.locals._admin.views = app.get('views')

    next()
  })

  // routes

  // init regexes
  var _routes = routes.init(args.settings, args.custom)

  // register custom apps
  ;(() => {
    var have = false
    for (var key in args.custom) {
      var _app = args.custom[key].app
      if (_app && _app.path && fs.existsSync(_app.path)) {
        var view = require(_app.path)
        app.use(view)
        have = true
      }
    }
    if (have && _routes.custom) app.all(_routes.custom, r.auth.restrict, r.render.admin)
  })()

  // login/logout
  app.get('/login', r.login.get, r.render.admin)
  app.post('/login', r.auth.login)
  app.get('/logout', r.auth.logout)

  // editview
  app.get(_routes.editview, r.auth.restrict, r.editview.get, r.render.admin)
  app.post(_routes.editview, r.auth.restrict, r.editview.post, r.render.admin)

  // listview
  app.get(_routes.listview, r.auth.restrict, r.listview.get, r.render.admin)
  app.post(_routes.listview, r.auth.restrict, r.listview.post, r.render.admin)

  // mainview
  app.get(_routes.mainview, r.auth.restrict, r.mainview.get, r.render.admin)

  // not found
  app.all('*', r.auth.restrict, r.notfound.get, r.render.admin)

  return app
}

function init (config, done) {
  if (!config.config) throw new Error('Admin `config` is required!')
  if (!config.settings) config.settings = {}
  if (!config.users) config.users = {}
  if (!config.custom) config.custom = {}
  initDatabase(config, (err) => {
    if (err) return done(err)
    initSettings(config)
    done(null, initServer(config))
  })
}

module.exports = (config) => {
  var handle = express()

  init(config, (err, admin) => {
    if (err) {
      console.error(err)
      process.exit()
    }
    // mount lazily
    handle.use(admin)
  })

  return handle
}
