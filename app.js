
var fs = require('fs'),
    path = require('path');
var cli = require('./lib/app/cli'),
    project = require('./lib/app/project');
require('colors');

var express = require('express'),
    consolidate = require('consolidate'),
    hogan = require('hogan.js');

var db = require('./lib/db/database'),
    Schema = require('./lib/db/schema'),
    settings = require('./lib/app/settings'),
    routes = require('./lib/app/routes');


// creates project's config files
function initCommandLine (args, cb) {
    if (!fs.existsSync(args.dpath)) {
        console.log('Config directory path doesn\'t exists!'.red);
        process.exit();
    }
    if (project.exists(args.dpath)) return cb();
    // else
    cli.promptForData(function (err, data) {
        if (err) return cb(err);
        project.create(args.dpath, data, cb);
    });
}

// modifies args.settings
function initDatabase (args, cb) {
    db.connect(args.config, function (err) {
        if (err) return cb(err);
        db.empty(db.client.config.schema, function (err, empty) {
            if (err) return cb(err);
            if (empty) return cb(new Error('Empty schema!'));
            
            var schema = new Schema(db);
            schema.getAllColumns(function (err, info) {
                if (err) return cb(err);

                // write back the settings
                var fpath = path.join(args.dpath, 'settings.json'),
                    updated = settings.refresh(args.settings, info);
                fs.writeFileSync(fpath, JSON.stringify(updated, null, 4), 'utf8');

                args.settings = updated;
                cb();
            });
        });
    });
}

// modifies args
function initSettings (args) {
    // route variables
    args.db = db;
    
    // upload
    var upload = args.config.app.upload || path.join(__dirname, 'public/upload');
    args.config.app.upload = upload;
    if (!fs.existsSync(upload)) fs.mkdirSync(upload);
    
    // languages
    args.langs = (function () {
        var dpath = path.join(__dirname, 'config/lang'),
            files = fs.readdirSync(dpath),
            langs = {};
        for (var i=0; i < files.length; i++) {
            var name = files[i].replace(path.extname(files[i]), '');
            langs[name] = require(path.join(dpath, files[i]));
        }
        return langs;
    }());

    // slug to table map
    args.slugs = (function () {
        var slugs = {};
        for (var key in args.settings) {
            slugs[args.settings[key].slug] = key;
        }
        return slugs;
    }());

    // debug
    args.debug = args.config.app.debug || (cli.dev ? true : false);
    if (!args.debug) console.warn = function(){};

    // events
    for (var key in args.custom) {
        var fpath = args.custom[key].events;
        if (fpath) break;
    }
    var events = fpath ? require(fpath) : {};
    if (!events.hasOwnProperty('preSave'))
        events.preSave = function (req, res, args, next) {next()};
    if (!events.hasOwnProperty('postSave'))
        events.postSave = function (req, res, args, next) {next()};
    args.events = events;


    // template variables

    // root
    if (args.config.app.root) {
        var root = args.config.app.root;
        if (/.*\/$/.test(root)) args.config.app.root = root.slice(0,-1);
    } else {
        args.config.app.root = '';
    }

    // layouts/themes/languages
    args.layouts = args.config.app.layouts;
    args.themes = args.config.app.themes
        ? {theme: require(path.join(__dirname, 'config/themes'))} : null;
    
    args.languages = (function () {
        if (!args.config.app.languages) return null;
        var langs = [];
        for (var key in args.langs) {
            langs.push({key: key, name: args.langs[key].name});
        }
        return {language: langs};
    }());

    // static
    args.libs = require(path.join(__dirname, 'config/libs'));
    args.libs.external = {css: [], js: []};
    for (var key in args.custom) {
        var assets = args.custom[key].public;
        if (!assets) continue;
        if (assets.local) {
            args.libs.js = args.libs.js.concat(assets.local.js||[]);
            args.libs.css = args.libs.css.concat(assets.local.css||[]);
        }
        if (assets.external) {
            args.libs.external.js = args.libs.external.js.concat(assets.external.js||[]);
            args.libs.external.css = args.libs.external.css.concat(assets.external.css||[]);
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

        .use(express.logger('dev'))
        .use(express.bodyParser())

        .use(express.cookieParser())
        .use(express.session({key: 'express-admin', secret: 'very secret - required'}))
        .use(r.auth.status)// session middleware
        .use(express.csrf())
        
        .use(express.methodOverride())
        .use(express.static(path.join(__dirname, 'public')))
        .use(express.static(path.join(__dirname, 'node_modules/express-admin-static')));

    if (!args.debug) app.set('view cache', true);

    // register custom static local paths
    for (var key in args.custom) {
        var assets = args.custom[key].public;
        if (!assets || !assets.local || !assets.local.path ||
            !fs.existsSync(assets.local.path)) continue;
        app.use(express.static(assets.local.path));
    }

    // pass server wide variables
    app.use(function (req, res, next) {
        // app data
        res.locals._admin = args;

        // i18n
        var lang = req.cookies.lang || 'en';
        res.cookie('lang', lang, {path: '/', maxAge: 900000000});
        
        // template vars
        res.locals.string = args.langs[lang];
        res.locals.root = args.config.app.root;
        res.locals.libs = args.libs;
        res.locals.themes = args.themes;
        res.locals.layouts = args.layouts;
        res.locals.languages = args.languages;

        // required for custom views
        res.locals._admin.views = app.get('views');

        next();
    });

    // routes
    
    // init regexes
    var _routes = routes.init(args.settings, args.custom);

    // register custom apps
    (function () {
        var have = false;
        for (var key in args.custom) {
            var _app = args.custom[key].app;
            if (_app && _app.path && fs.existsSync(_app.path)) {
                var view = require(_app.path);
                app.use(view);
                have = true;
            }
        }
        if (have && _routes.custom) app.all(_routes.custom, r.auth.restrict, r.render.admin);
    }());

    // login/logout
    app.get('/login', r.login.get, r.render.admin);
    app.post('/login', r.auth.login);
    app.get('/logout', r.auth.logout);

    // editview
    app.get(_routes.editview, r.auth.restrict, r.editview.get, r.render.admin);
    app.post(_routes.editview, r.auth.restrict, r.editview.post, r.render.admin);

    // listview
    app.get(_routes.listview, r.auth.restrict, r.listview.get, r.render.admin);
    app.post(_routes.listview, r.auth.restrict, r.listview.post, r.render.admin);

    // mainview
    app.get(_routes.mainview, r.auth.restrict, r.mainview.get, r.render.admin);

    // not found
    app.all('*', r.auth.restrict, r.notfound.get, r.render.admin);

    return app;
}


// start only if this module is executed from the command line
if (require.main === module) {
    var args = {
        dpath: path.resolve(cli.getConfigPath())
    }
    initCommandLine(args, function (err) {
        if (err) return console.log(err.message.red);

        args.config = require(path.join(args.dpath, 'config.json'));
        args.settings = require(path.join(args.dpath, 'settings.json'));
        args.custom = require(path.join(args.dpath, 'custom.json'));
        args.users = require(path.join(args.dpath, 'users.json'));

        initDatabase(args, function (err) {
            if (err) return console.log(err.message.red);

            // extended settings
            initSettings(args);
            
            var app = initServer(args);

            app.listen(args.config.server.port, function () {
                console.log('Express Admin listening on port'.grey, 
                            args.config.server.port.toString().green);
            });
        });
    });
}


exports = module.exports = {
    initCommandLine: initCommandLine,
    initDatabase: initDatabase,
    initSettings: initSettings,
    initServer: initServer
}
