
var fs = require('fs'),
    path = require('path');
var program = require('./lib/utils/program'),
    project = require('./lib/utils/project');
require('colors');


var dpath = path.resolve(program.getConfigPath());
(function (cb) {
    if (!dpath) {
        console.log('Config directory path is required!'.cyan);
        process.exit();
    }
    if (!fs.existsSync(dpath)) {
        console.log('Config directory path doesn\'t exists!'.cyan);
        process.exit();
    }
    if (!project.exists(dpath)) {
        program.promptForData(function (err, data) {
            if (err) throw err;
            project.create(dpath, data, function () {
                cb();
            });
        });
    }
    else {
        cb();
    }
}(function () {




var express = require('express'),
    consolidate = require('consolidate'),
    hogan = require('hogan.js');

var db = require('./lib/utils/database'),
    Schema = require('./lib/utils/schema'),
    settings = require('./lib/utils/settings'),
    routes = require('./lib/utils/routes');

var r = require('./routes'),
    c = require(path.join(dpath, 'config.json'))||{},
    p = {
        settings: path.join(dpath, 'settings.json'),
        custom:   path.join(dpath, 'custom.json'),
        users:    path.join(dpath, 'users.json')
    };


db.connect(c.database.user, c.database.pass, function (err) {
    if (err) throw err;
    db.use(c.database.name, function (err) {
        if (err) throw err;
        var schema = new Schema(db);
        schema.getAllColumns(function (err, info) {
            if (err) throw err;
            var config = require(p.settings)||{};
            settings.refresh(config, info, function (settings) {
                // write back the settings
                fs.writeFileSync(p.settings, JSON.stringify(settings, null, 4), 'utf8');

                db.empty(c.database.name, function (err, empty) {
                    if (err) throw err;
                    if (empty) {
                        console.log('Empty Database!'.red);
                        process.exit();
                    } else {
                        var args = initSettings(settings);
                        initServer(args);
                    }
                });
            });
        });
    });
});

function initSettings (settings) {
    var args = {
        // route variables
        db: db,
        config: c,
        settings: settings,
        custom: require(p.custom)||{},
        users: require(p.users)||{},
        langs: (function () {
            var dpath = path.join(__dirname, 'config/lang'),
                files = fs.readdirSync(dpath),
                langs = {};
            for (var i=0; i < files.length; i++) {
                var name = files[i].replace(path.extname(files[i]), '');
                langs[name] = require(path.join(dpath, files[i]));
            }
            return langs;
        }()),
        slugs: (function () {
            // slug to table map
            var slugs = {};
            for (var key in settings) {
                slugs[settings[key].slug] = key;
            }
            return slugs;
        }()),
        debug: program.dev ? true : false,

        // template variables
        libs: require(path.join(__dirname, 'config/libs')),
        layouts: c.app.layouts,
        themes: c.app.themes
            ? {theme: require(path.join(__dirname, 'config/themes'))} : null
    };
    args.languages = (function () {
        if (!c.app.languages) return null;
        var langs = [];
        for (var key in args.langs) {
            langs.push({key: key, name: args.langs[key].name});
        }
        return {language: langs};
    }());
    for (var key in args.custom) {
        var custom = args.custom[key].public;
        if (!custom) continue;
        if (custom.js) {
            for (var i=0; i < custom.js.length; i++) {
                args.libs.js.push(custom.js[i]);
            }
        }
        if (custom.css) {
            for (var i=0; i < custom.css.length; i++) {
                args.libs.css.push(custom.css[i]);
            }
        }
    }
    return args;
}

function initServer (args) {
    // general settings
    var app = express()
        .set('views', path.resolve(__dirname, './views'))
        .set('view engine', 'html')
        .engine('html', consolidate.hogan)

        .use(express.favicon())
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

    // register custom public paths
    for (var key in args.custom) {
        if (!args.custom[key].public) continue;
        app.use(express.static(args.custom[key].public.path));
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
            var vpath = args.custom[key].path;
            if (vpath) {
                var view = require(vpath);
                app.use(view); // should have restriction somehow
                have = true;
            }
        }
        if (have) app.get(routes.custom, r.auth.restrict, r.render.admin);
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

    app.listen(c.server.port, function () {
        console.log('Express Admin listening on port'.grey, 
                    c.server.port.toString().green);
    });
}

}));
