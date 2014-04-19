
var db = require('../../lib/db/database');


describe('database (db)', function () {
    it('give error on connect', function (done) {
        db.connect({mysql: {user: 'dsajhdka', password: 'jhsakj'}}, function (err) {
            err.message.should.equal("ER_ACCESS_DENIED_ERROR: "+
                "Access denied for user 'dsajhdka'@'localhost' (using password: YES)");
            done();
        });
    });
    it('connect existing user', function (done) {
        db.connect({mysql: {user: 'liolio', password: 'karamba'}}, done);
    });

    it('empty database', function (done) {
        db.empty('express-admin-empty', function (err, empty) {
            if (err) return done(err);
            empty.should.equal(true);
            done();
        });
    });
    it('not empty database', function (done) {
        db.empty('express-admin-simple', function (err, empty) {
            if (err) return done(err);
            empty.should.equal(false);
            done();
        });
    });
});
