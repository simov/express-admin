
var path = require('path');
var app = require('../../app'),
	program = require('../../lib/utils/program');


var args = {
	dpath: path.resolve(program.getConfigPath())
}

app.initCommandLine(args, function () {
	console.log('end');
});
