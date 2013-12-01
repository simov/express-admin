
var fs = require('fs'),
    path = require('path');
var program = require('./lib/utils/program'),
    project = require('./lib/utils/project');
require('colors');

var express = require('express'),
    consolidate = require('consolidate'),
    hogan = require('hogan.js');

var db = require('./lib/utils/database'),
    Schema = require('./lib/utils/schema'),
    settings = require('./lib/utils/settings'),
    routes = require('./lib/utils/routes');


// creates project's config files
function initCommandLine (args, cb) {
    if (!fs.existsSync(args.dpath)) {
        console.log('Config directory path doesn\'t exists!'.red);
        process.exit();
    }
    if (!project.exists(args.dpath)) {
        program.promptForData(function (err, data) {
            if (err) throw err;
            project.create(args.dpath, data, function () {
                cb();
            });
        });
    } else {
        cb();
    }
}

// modifies args.settings
function initDatabase (args, cb) {
    db.connect(args.config, function (err) {
        if (err) return cb(err);
        var schema = new Schema(db);
        schema.getAllColumns(function (err, info) {
            if (err) return cb(err);

            settings.refresh(args.settings, info, function (settings) {
                // write back the settings
                var fpath = path.join(args.dpath, 'settings.json');
                fs.writeFileSync(fpath, JSON.stringify(settings, null, 4), 'utf8');

                db.empty(db.client.config.schema, function (err, empty) {
                    if (err) return cb(err);
                    if (empty) return cb(new Error('Empty schema!'));
                    args.settings = settings;
                    cb();
                });
            });
        });
    });
}

// modifies args
function initSettings (args) {
    // route variables
    args.db = db;
    
    if (args.config.app.root) {
        var root = args.config.app.root;
        if (/.*\/$/.test(root)) args.config.app.root = root.slice(0,-1);
    } else {
        args.config.app.root = '';
    }

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

    args.slugs = (function () {
        // slug to table map
        var slugs = {};
        for (var key in args.settings) {
            slugs[args.settings[key].slug] = key;
        }
        return slugs;
    }());

    args.debug = args.config.app.debug || (program.dev ? true : false);
    if (!args.debug) console.warn = function(){};

    // template variables
    args.libs = require(path.join(__dirname, 'config/libs'));
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

        .use(express.cookieParser('very secret - required'))
        .use(express.session())
        .use(r.auth.status)// session middleware
        .use(express.csrf())
        
        .use(express.methodOverride())
        .use(express.static(path.join(__dirname, 'public')))
        .use(express.static(path.join(__dirname, 'node_modules/express-admin-static')));

    if (!args.debug) app.set('view cache', true);

    // register custom public local paths
    for (var key in args.custom) {
        var assets = args.custom[key].public;
        if (!assets || !assets.local || !assets.local.path) continue;
        app.use(express.static(assets.local.path));
    }

    // pass server wide variables
    app.use(function (req, res, next) {
        // app data
        res.locals._admin = args;

        // i18n
        var lang = req.cookies.lang || 'en';
        res.cookie('lang', lang, {path: '/', maxAge: 900000000});
        res.locals.string = args.langs[lang];
        
        // shortcuts
        res.locals.root = args.config.app.root;
        res.locals.libs = args.libs;
        res.locals.themes = args.themes;
        res.locals.layouts = args.layouts;
        res.locals.languages = args.languages;

        // required for the custom views
        res.locals._admin.views = app.get('views');

        next();
    });

    // routes
    
    // init regexes
    routes = routes.init(args.settings, args.custom);

    // register custom apps
    (function () {
        var have = false;
        for (var key in args.custom) {
            var _app = args.custom[key].app;
            if (_app && _app.path) {
                var view = require(_app.path);
                app.use(view);
                have = true;
            }
        }
        if (have) app.all(routes.custom, r.auth.restrict, r.render.admin);
    }());

    // login/logout
    app.get('/login', r.login.get, r.render.admin);
    app.post('/login', r.auth.login);
    app.get('/logout', r.auth.logout);

    // editview
    app.get(routes.editview, r.auth.restrict, r.editview.get, r.render.admin);
    app.post(routes.editview, r.auth.restrict, r.editview.post, r.render.admin);

    // listview
    app.get(routes.listview, r.auth.restrict, r.listview.get, r.render.admin);

    // mainview
    app.get(routes.mainview, r.auth.restrict, r.mainview.get, r.render.admin);

    // not found
    app.all('*', r.auth.restrict, r.notfound.get, r.render.admin);

    return app;
}


// start only if this module is executed from the command line
if (require.main === module) {
    var args = {
        dpath: path.resolve(program.getConfigPath())
    }
    initCommandLine(args, function () {

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
