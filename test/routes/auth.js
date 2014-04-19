
var should = require('should');
var auth = require('../../routes/auth'),
    user = require('../../lib/app/user');


describe('user authentication', function () {

    describe('restrict', function () {
        it('should pass in debug mode', function (done) {
            var req = {},
                res = {locals:{_admin:{debug:true}}};
            auth.restrict(req, res, done);
        });
        it('should pass on existing user\'s session', function (done) {
            var req = {session:{user:{}}},
                res = {locals:{_admin:{debug:false}}};
            auth.restrict(req, res, done);
        });
        it('should redirect to login page on missing user\'s session', function (done) {
            var req = {session:{user:null}},
                res = {locals:{_admin:{debug:false}, root:'',
                    string:{'access-denied':'Access denied!'}}};
            res.redirect = function (path) {
                path.should.equal('/login');
                req.session.error.should.equal('Access denied!');
                done();
            }
            auth.restrict(req, res);
        });
    });

    describe('login', function () {
        it('should redirect to login page on non existent user name', function (done) {
            var req = {body:{username:'liolio'},session:{}},
                res = {locals:{_admin:{users:{user1:{},user2:{}}}, root:'',
                    string:{'find-user':'Cannot find user!'}}};
            res.redirect = function (path) {
                path.should.equal('/login');
                req.session.error.should.equal('Cannot find user!');
                req.session.username.should.equal('liolio');
                done();
            }
            auth.login(req, res);
        });
        it('should redirect to login page on invalid user\'s password', function (done) {
            var req = {body:{username:'liolio',password:'wrong'},session:{}},
                res = {locals:{_admin:{users:
                    {liolio:{name:'liolio',pass:'karamba',salt:'',hash:''}}}, root:'',
                        string:{'invalid-password':'Invalid password!'}}};
            res.redirect = function (path) {
                path.should.equal('/login');
                req.session.error.should.equal('Invalid password!');
                req.session.username.should.equal('liolio');
                done();
            }
            auth.login(req, res);
        });
        it('should redirect to index page on successful login', function (done) {
            user.create('liolio', 'karamba', true, function (err, user) {
                if (err) return done(err);
                var req = {body:{username:'liolio',password:'karamba'},session:{}},
                    res = {locals:{_admin:{users:{liolio:user}}, root:''}};
                req.session.regenerate = function (cb) {cb()}
                res.redirect = function (path) {
                    path.should.equal('/');
                    should.deepEqual(req.session.user, user);
                    done();
                }
                auth.login(req, res);
            });
        });
    });

    describe('logout', function () {
        it('should redirect to login page on logout', function (done) {
            var req = {session:{}},
                res = {locals:{root:''}};
            req.session.destroy = function (cb) {cb()}
            res.redirect = function (path) {
                path.should.equal('/login');
                done();
            }
            auth.logout(req, res);
        });
    });
});
