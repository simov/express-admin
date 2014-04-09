
var should = require('should');
var app = require('../../app');


describe('settings initialization', function () {

    it('should init the settings', function (done) {
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
                view1: {},
                view2: {public: {local:{css:['file.css']}, external:{css:['url']}}},
                view3: {public: {local:{css:['file.css'], js:['file.js']},
                                external:{css:['url'], js:['url']}}},
            },
            users: {} // not used
        };
        app.initSettings(args);
        

        args.hasOwnProperty('db').should.equal(true);
        args.debug.should.equal(false);

        args.langs.hasOwnProperty('bg').should.equal(true);
        args.langs.hasOwnProperty('cn').should.equal(true);
        args.langs.hasOwnProperty('de').should.equal(true);
        args.langs.hasOwnProperty('en').should.equal(true);
        args.langs.hasOwnProperty('ru').should.equal(true);

        should.deepEqual(
            args.languages.language.sort(function (a, b) {
                if (a.key < b.key) return -1;
                if (a.key > b.key) return  1;
                return 0;
            }), [
            {key:'bg',name:'Български'}, {key:'cn',name:'Chinese/中文'},
            {key:'de',name:'Deutsch'}, {key:'en',name:'English'},
            {key:'ru',name:'Русский'}
        ]);

        args.layouts.should.equal(true);

        args.libs.bootstrap.should.equal('/csslib/bootstrap.min.css');
        args.libs.css.length.should.equal(5);
        args.libs.js.length.should.equal(6);
        args.libs.external.css.length.should.equal(2);
        args.libs.external.js.length.should.equal(1);

        should.deepEqual(args.slugs, {slug1:'table1',slug2:'table2',slug3:'table3'});

        args.themes.theme.length.should.equal(13);

        done();
    });
});
