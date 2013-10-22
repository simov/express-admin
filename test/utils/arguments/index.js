
var path = require('path');

var prompt = require('../../common/prompt');


describe('arguments', function () {
    var mpath = path.resolve(__dirname, 'wrapper.js'),
        tpath = path.resolve('../some/test/path');

    it('get config path without flags', function (done) {
        var params = [mpath, tpath];

        prompt.start(params, tpath, function (err) {
            done(err);
        });
    });
    
    it('get config path from --dev flag', function (done) {
        var params = [mpath, '-v', tpath];

        prompt.start(params, tpath, function (err) {
            done(err);
        });
    });
});
