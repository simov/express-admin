
var should = require('should');
var routes = require('../../lib/app/routes');


describe('routes (app)', function () {

    it('skip tables hidden in mainview', function (done) {
        var settings = {
            table1: {table:{pk:'1'}, mainview:{show:true}, slug:'table1'},
            table2: {table:{pk:'2'}, mainview:{show:false}, slug:'table2'}
        };
        var r = routes.init(settings, {});
        should.deepEqual(r.editview, /^\/(table1)\/(\d+|add)\/?$/);
        done();
    });

    it('skip tables without primary key', function (done) {
        var settings = {
            table1: {table:{pk:'1'}, mainview:{show:true}, slug:'table1'},
            table2: {table:{pk:''}, mainview:{show:true}, slug:'table2'}
        };
        var r = routes.init(settings, {});
        should.deepEqual(r.editview, /^\/(table1)\/(\d+|add)\/?$/);
        done();
    });

    it('return match anything regex on zero table slugs', function (done) {
        var settings = {
            table1: {table:{pk:''}, mainview:{show:true}, slug:'table1'},
            table2: {table:{pk:''}, mainview:{show:true}, slug:'table2'}
        };
        var r = routes.init(settings, {});
        should.deepEqual(r.editview, /.*\/(\d+|add)\/?$/);
        done();
    });

    // custom views

    it('skip custom views without app key', function (done) {
        var custom = {
            custom1: {app: {mainview:{show:true}, slug:'custom1'}},
            custom2: {public: {local:{path:'...', js:['..']}}}
        };
        var r = routes.init({}, custom);
        should.deepEqual(r.custom, /^\/(custom1)(?:\/.*)?\/?$/);
        done();
    });

    it('skip custom views hidden in mainview', function (done) {
        var custom = {
            custom1: {app: {mainview:{show:true}, slug:'custom1'}},
            custom2: {app: {mainview:{show:false}, slug:'custom2'}}
        };
        var r = routes.init({}, custom);
        should.deepEqual(r.custom, /^\/(custom1)(?:\/.*)?\/?$/);
        done();
    });

    it('return null on zero custom view slugs', function (done) {
        var custom = {
            custom1: {app: {mainview:{show:false}, slug:'custom1'}},
            custom2: {public: {local:{path:'...', js:['..']}}}
        };
        var r = routes.init({}, custom);
        should.deepEqual(r.custom, null);
        done();
    });
});
