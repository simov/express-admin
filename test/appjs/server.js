
var fs = require('fs'),
    path = require('path'),
    supertest = require('supertest');
var app = require('../../app');


describe('server initialization', function () {

    // test auth status middleware
    before(function () {
        console.warn = function () {}
    });

    describe('static files', function () {
        it('serve a static file from public dir', function (done) {
            supertest(app.initServer({}))
                .get('/express-admin.css')
                .end(function (err, res) {
                    if (err) return done(err);
                    res.status.should.equal(200);
                    done();
                });
        });
        it('serve a static file from express-admin-static dir', function (done) {
            supertest(app.initServer({}))
                .get('/csslib/bootstrap.min.css')
                .end(function (err, res) {
                    if (err) return done(err);
                    res.status.should.equal(200);
                    done();
                });
        });
    });

    describe('custom static files', function () {
        var args = {config:{app:{}}, langs:{en:{'access-denied':'test'}}};

        it('skip on missing public key', function (done) {
            args.custom = {view1:{css:['/custom.css']}};
            supertest(app.initServer(args))
                .get('/custom.css')
                .end(function (err, res) {
                    if (err) return done(err);
                    res.status.should.equal(302);
                    done();
                });
        });
        it('skip on missing public.local key', function (done) {
            args.custom = {view1:{public:{css:['/custom.css']}}};
            supertest(app.initServer(args))
                .get('/custom.css')
                .end(function (err, res) {
                    if (err) return done(err);
                    res.status.should.equal(302);
                    done();
                });
        });
        it('skip on missing public.local.path key', function (done) {
            args.custom = {view1:{public:{local:{css:['/custom.css']}}}};
            supertest(app.initServer(args))
                .get('/custom.css')
                .end(function (err, res) {
                    if (err) return done(err);
                    res.status.should.equal(302);
                    done();
                });
        });
        it('skip on non existing location', function (done) {
            args.custom = {view1:{public:{local:{
                path:path.resolve(__dirname, '../fixtures/non-existing'),
                css:['/custom.css']}}}};
            supertest(app.initServer(args))
                .get('/custom.css')
                .end(function (err, res) {
                    if (err) return done(err);
                    res.status.should.equal(302);
                    done();
                });
        });
        it('serve a static file from custom dir', function (done) {
            args.custom = {view1:{public:{local:{
                path:path.resolve(__dirname, '../fixtures/custom'),
                css:['/custom.css']}}}};
            supertest(app.initServer(args))
                .get('/custom.css')
                .end(function (err, res) {
                    if (err) return done(err);
                    res.status.should.equal(200);
                    done();
                });
        });
    });

    describe('server wide middleware', function () {
        var args = {config:{app:{}}, langs:{en:{'access-denied':'test'}}};

        it('set lang cookie to en by default', function (done) {
            supertest(app.initServer(args))
                .get('/')
                .end(function (err, res) {
                    if (err) return done(err);
                    res.headers['set-cookie'][0]
                        .should.match(/lang=en; Max-Age=900000; Path=\/; Expires=.*/i);
                    done();
                });
        });
        it('set session cookie under the express-admin key', function (done) {
            supertest(app.initServer(args))
                .get('/')
                .end(function (err, res) {
                    if (err) return done(err);
                    res.headers['set-cookie'][1]
                        .should.match(/express-admin=.*; Path=\/; HttpOnly/i);
                    done();
                });
        });
        it.skip('set template variables', function (done) {
            // template variables should be tested separately
            done();
        });
        it.skip('set special var used in custom views', function (done) {
            // this will be tested in custom views below
            done();
        });
    });

    describe('custom views', function () {
        var args = {config:{app:{}},
            settings: {table1:{slug:'table1', table:{pk:'id'}, mainview:{show:true}}},
            langs:{en:{'access-denied':'test'}}, debug:true};

        it('skip on missing app key', function (done) {
            args.custom = {view1:{
                slug:'view1', verbose:'view1', mainview:{show:true}}};
            supertest(app.initServer(args))
                .get('/view1')
                .end(function (err, res) {
                    if (err) return done(err);
                    res.text.should.match(/<h1>404<\/h1>/);
                    done();
                });
        });
        it('skip on missing app.path key', function (done) {
            args.custom = {view1:{app:{
                slug:'view1', verbose:'view1', mainview:{show:true}}}};
            supertest(app.initServer(args))
                .get('/view1')
                .end(function (err, res) {
                    if (err) return done(err);
                    res.text.should.match(/<h1>404<\/h1>/);
                    done();
                });
        });
        it('skip on non existing location', function (done) {
            args.custom = {view1:{app:{
                path: path.resolve(__dirname, '../fixtures/custom/app'),
                slug:'view1', verbose:'view1', mainview:{show:true}}}};
            supertest(app.initServer(args))
                .get('/view1')
                .end(function (err, res) {
                    if (err) return done(err);
                    res.text.should.match(/<h1>404<\/h1>/);
                    done();
                });
        });
        it('serve custom view', function (done) {
            args.custom = {view1:{app:{
                path: path.resolve(__dirname, '../fixtures/custom/app.js'),
                slug:'view1', verbose:'view1', mainview:{show:true}}}};
            supertest(app.initServer(args))
                .get('/view1')
                .end(function (err, res) {
                    if (err) return done(err);
                    res.text.should.match(/<p>This is the simplest custom view that you can get.<\/p>/);
                    done();
                });
        });
        it.skip('add an all callback for rendering at the end', function (done) {
            
            done();
        });
    });
});