
var fs = require('fs'),
    path = require('path'),
    should = require('should');
var app = require('../../app'),
    cli = require('../../lib/app/cli');


describe('settings initialization', function () {
    // route variables

    describe('upload', function () {
        before(function () {
            if (fs.existsSync(path.join(__dirname, 'upload')))
                fs.rmdirSync(path.join(__dirname, 'upload'));
        });
        it('set default upload location', function (done) {
            var args = {config:{app:{}}};
            app.initSettings(args);
            args.config.app.upload.should.match(/^\/.*\/public\/upload$/);
            done();
        });
        it('set upload location as specified in config', function (done) {
            var args = {config:{app:{upload:path.join(__dirname, 'upload')}}};
            app.initSettings(args);
            args.config.app.upload.should.equal(path.join(__dirname, 'upload'));
            done();
        });
        it('create upload directory if not exists', function (done) {
            fs.existsSync(path.join(__dirname, 'upload')).should.equal(true);
            done();
        });
        after(function () {
            fs.rmdirSync(path.join(__dirname, 'upload'));
        });
    });

    describe('langs/slugs', function () {
        it('load all available languages', function (done) {
            var files = fs.readdirSync(path.resolve(__dirname, '../../config/lang'));

            var args = {config:{app:{}}};
            app.initSettings(args);

            Object.keys(args.langs).length.should.equal(files.length);

            for (var i=0; i < files.length; i++) {
                var name = files[i].replace(path.extname(files[i]), '');
                should.exists(args.langs[name]);
            }
            done();
        });
        it('creates slug to table name mapping', function (done) {
            var args = {config:{app:{}},
                settings:{table1:{slug:'slug1'}, table2:{slug:'slug2'}}};
            app.initSettings(args);
            should.deepEqual(args.slugs, {slug1:'table1', slug2:'table2'});
            done();
        });
    });

    describe('debug', function () {
        it('set debug mode through config', function (done) {
            var args = {config:{app:{debug:true}}};
            app.initSettings(args);
            args.debug.should.equal(true);
            done();
        });
        it('set debug mode through cli', function (done) {
            var args = {config:{app:{}}};
            cli.dev = true;
            app.initSettings(args);
            args.debug.should.equal(true);
            done();
        });
    });

    describe('events', function () {
        it('add default mocks if custom event hooks are not defined', function (done) {
            var args = {config:{app:{}},
                custom:{view1:{}, app2:{}}};
            app.initSettings(args);

            args.events.preSave('req', 'res', args, function () {
                args.events.postSave('req', 'res', args, done);
            });
        });
        it('load custom event hooks', function (done) {
            var args = {config:{app:{}},
                custom:{view1:{}, app2:{
                    events:path.resolve(__dirname, '../fixtures/custom/events.js')}}};
            app.initSettings(args);

            args.events.preSave('req', 'res', args, function () {
                args.preSave.should.equal(true);
                args.events.postSave('req', 'res', args, function () {
                    args.postSave.should.equal(true);
                    done();
                });
            });
        });
    });

    // template variables

    describe('root', function () {
        it('set app root to empty string by default', function (done) {
            var args = {config:{app:{}}};
            app.initSettings(args);
            args.config.app.root.should.equal('');
            done();
        });
        it('set app root as specified in config', function (done) {
            var args = {config:{app:{root:'/admin'}}};
            app.initSettings(args);
            args.config.app.root.should.equal('/admin');
            done();
        });
        it('remove trailing / from app root', function (done) {
            var args = {config:{app:{root:'/admin/'}}};
            app.initSettings(args);
            args.config.app.root.should.equal('/admin');
            done();
        });
    });

    describe('layouts/themes/languages', function () {
        it('set layouts flag as specified in config', function (done) {
            var args = {config:{app:{layouts:false}}};
            app.initSettings(args);
            args.layouts.should.equal(false);
            done();
        });
        it('skip themes if disabled in config', function (done) {
            var args = {config:{app:{themes:false}}};
            app.initSettings(args);
            should.equal(args.themes, null);
            done();
        });
        it('load themes if enabled in config', function (done) {
            var args = {config:{app:{themes:true}}};
            app.initSettings(args);
            should.deepEqual(args.themes.theme, require('../../config/themes'));
            done();
        });
        it('skip languages if disabled in config', function (done) {
            var args = {config:{app:{languages:false}}};
            app.initSettings(args);
            should.equal(args.languages, null);
            done();
        });
        it('load languages if enabled in config', function (done) {
            var args = {config:{app:{languages:true}}};
            app.initSettings(args);

            var files = fs.readdirSync(path.resolve(__dirname, '../../config/lang'));
            Object.keys(args.languages.language).length.should.equal(files.length);
            done();
        });
    });

    describe('static', function () {
        it('load static libs', function (done) {
            var args = {config:{app:{}}};
            app.initSettings(args);
            delete args.libs.external
            should.deepEqual(args.libs, require('../../config/libs'));
            done();
        });
        it('append custom local libs to the static libs', function (done) {
            var args = {config:{app:{}}, custom:{
                app1:{public:{local:{css:['/1.css'], js:['/1.js']}}}
            }};
            app.initSettings(args);
            args.libs.css.indexOf('/1.css').should.not.equal(-1);
            args.libs.js.indexOf('/1.js').should.not.equal(-1);
            done();
        });
        it('append custom external libs to the static external libs', function (done) {
            var args = {config:{app:{}}, custom:{
                app1:{public:{external:{css:['//1.css'], js:['//1.js']}}}
            }};
            app.initSettings(args);
            args.libs.external.css.indexOf('//1.css').should.not.equal(-1);
            args.libs.external.js.indexOf('//1.js').should.not.equal(-1);
            done();
        });
    });
});
