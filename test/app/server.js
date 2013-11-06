
var fs = require('fs'),
    path = require('path'),
    supertest = require('supertest');
var app = require('../../app');


describe('server initialization', function () {
    var _app;

    before(function () {
        var args = {
            dpath: null, // not used
            config: { // only config.app is used
                app: {layouts: true, themes: true, languages: true}
            },
            settings: { // creates args.slugs
                table1: {slug:'slug1'},
                table2: {slug:'slug2'},
                table3: {slug:'slug3'}
            },
            custom: { // add them to args.libs
                view1: {
                    app: {
                        path: path.resolve(__dirname, '../fixtures/custom-view/app'),
                        slug: 'view1', verbose: 'view1', mainview: {show: true}
                    }
                },
                view2: {public: {local:{css:['/file1.css']}}},
                view3: {public: {local:{path:__dirname, css:['/file2.css'], js:['/file1.js']}}}
            },
            users: {} // not used
        };
        app.initSettings(args);
        args.debug = true;
        _app = app.initServer(args);
    });
    
    describe('custom public static files', function () {
        before(function () {
            fs.writeFileSync(path.join(__dirname, 'file2.css'));
        });

        it('should include custom static files', function (done) {
            supertest(_app)
                .get('/login')
                .end(function (err, res) {
                    if (err) return done(err);
                    res.text.should.match(/<link href="\/file1\.css" rel="stylesheet" type="text\/css" media="all" \/>/);
                    res.text.should.match(/<link href="\/file2\.css" rel="stylesheet" type="text\/css" media="all" \/>/);
                    res.text.should.match(/<script src="\/file1\.js" type="text\/javascript" charset="utf-8"><\/script>/);
                    done();
                });
        });

        it('should return not found on non existent custom public path', function (done) {
            supertest(_app)
                .get('/file1.css')
                .end(function (err, res) {
                    if (err) return done(err);
                    // res.status.should.equal(302);
                    res.text.should.match(/<p>The requested page was not found.<\/p>/);
                    done();
                });
        });

        it('should return 200 on existing custom public path', function (done) {
            supertest(_app)
                .get('/file2.css')
                .end(function (err, res) {
                    if (err) return done(err);
                    res.status.should.equal(200);
                    done();
                });
        });

        after(function () {
            fs.unlinkSync(path.join(__dirname, 'file2.css'));
        });
    });

    
    it('should pass the language cookie', function (done) {
        supertest(_app)
            .get('/login')
            .end(function (err, res) {
                res.headers['set-cookie'][0].should.match(/lang=en; Max-Age=900000; Path=\/; Expires=.*\sGMT/)
                done();
            });
    });

    it('should register custom application', function (done) {
        supertest(_app)
            .get('/view1')
            .end(function (err, res) {
                res.text.should.match(/<p>This is the simplest custom view that you can get.<\/p>/);
                done();
            });
    });
});