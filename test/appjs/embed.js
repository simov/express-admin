
var express = require('express'),
    supertest = require('supertest');
var expressAdmin = require('../../app');


describe('embedding', function () {
    var app = null;

    before(function (done) {

        app = express();
        app.get('/', function (req, res) {
            res.send('Hello World');
        });

        var admin = expressAdmin.initServer({
            config: {app:{}},
            langs:{en:{'access-denied':'test'}}
        });
        app.use('/admin', admin);
        done();
    });

    it('serve holder app route', function (done) {
        supertest(app)
            .get('/')
            .end(function (err, res) {
                if (err) return done(err);
                res.text.should.equal('Hello World');
                done();
            });
    });

    it('serve admin route', function (done) {
        supertest(app)
            .get('/admin/login')
            .end(function (err, res) {
                if (err) return done(err);
                res.text.should.match(/Express Admin/);
                done();
            });
    });
});