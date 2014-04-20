
var path = require('path');
    cli = require('../../lib/app/cli'),
    app = require('../../app');


var test = '';
for (var i=0; i < process.argv.length; i++) {
    if (process.argv[i].indexOf('-test') == 0) {
        test = process.argv[i];
        break;
    }
}
switch (test) {
    case '-test-args':
        console.log(cli.getConfigPath());
        break;
    case '-test-prompt':
        cli.promptForData(function (err, result) {
            if (err) console.log(JSON.stringify({err: err.message}));
            console.log(JSON.stringify(result));
        });
        break;
    case '-test-app':
        var args = {
            dpath: path.resolve(cli.getConfigPath())
        }
        app.initCommandLine(args, function () {
            console.log('end');
        });
        break;
}
