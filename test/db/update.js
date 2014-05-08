
var fs = require('fs'),
    path = require('path');
var should = require('should'),
    dcopy = require('deep-copy');
var db = require('../../lib/db/database'),
    editview = require('../../lib/editview/index'),
    database = require('../../lib/db/update');
var c = require('../fixtures/stress/config');


describe('update (db)', function () {
    var args = {
        settings : require('../fixtures/stress/settings'),
        debug    : true,
        name     : 'item'
    };
    before(function (done) {
        db.connect(c, function (err) {
            if (err) return done(err);
            args.db = db;
            done();
        });
    });

    it('insert parent record', function (done) {
        var queries = require('../fixtures/stress/db-insert');

        args.config = dcopy(args.settings[args.name]);
        args.id = null;
        args.data = require('../fixtures/stress/post-insert');

        editview.getTypes(args, function (err, data) {
            if (err) return done(err);
            args.action = 'insert';

            database.update(args, function (err) {
                if (err) return done(err);

                // print out
                // if (args.debug) {
                // 	for (var i=0; i < args.queries.length; i++) {
                // 		console.log(args.queries[i]);
                // 		console.log('-------------------------');
                // 	}
                // }
                
                should.deepEqual(args.queries, queries.insert);
                done();
            });
        });
    });

    it('delete parent record', function (done) {
        var queries = require('../fixtures/stress/db-delete');

        args.config = dcopy(args.settings[args.name]);
        args.id = 1;
        args.data = require('../fixtures/stress/post-delete');

        editview.getTypes(args, function (err, data) {
            if (err) return done(err);
            args.action = 'remove';

            database.update(args, function (err) {
                if (err) return done(err);

                // print out
                // if (args.debug) {
                // 	for (var i=0; i < args.queries.length; i++) {
                // 		console.log(args.queries[i]);
                // 		console.log('-------------------------');
                // 	}
                // }
                
                should.deepEqual(args.queries, queries.remove);
                done();
            });
        });
    });

    it('update parent record', function (done) {
        var queries = require('../fixtures/stress/db-update');

        args.config = dcopy(args.settings[args.name]);
        args.id = 1;
        args.data = require('../fixtures/stress/post-update');

        editview.getTypes(args, function (err, data) {
            if (err) return done(err);
            args.action = 'update';

            database.update(args, function (err) {
                if (err) return done(err);

                // print out
                // if (args.debug) {
                // 	for (var i=0; i < args.queries.length; i++) {
                // 		console.log(args.queries[i]);
                // 		console.log('-------------------------');
                // 	}
                // }
                
                should.deepEqual(args.queries, queries.update);
                done();
            });
        });
    });
});
