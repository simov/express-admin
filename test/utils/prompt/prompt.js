
var path = require('path'),
    spawn = require('child_process').spawn;
require('colors');

var child = null,
    error = null,
    success = null;


exports.start = function (cb) {
    var mpath = path.resolve(__dirname, 'wrapper.js');
    child = spawn('node', [mpath]);
    child.stdin.setEncoding('utf8');

    var started = false;
    child.stdout.on('data', function (data) {
        // console.log('> ' + data);
        var text = data.toString().trim();

        switch (text) {
            case 'Database name:':
                !started ? cb() : success(text);
                started = true;
                break;
            case 'Database credentials are required!'.red:
                error(text);
                break;
            case 'Administrator user name is required!'.red:
                error(text);
                break;
            case ('Must contains at least:\n'+
                '2 lower case letters, 2 upper case letters,'+
                '2 digits').red:
                error(text);
                break;
            default:
                success(text);
                break;
        }
    });
    child.stderr.on('data', function (data) {
        console.log('! ' + data);
    });
    child.on('exit', function (code, signal) {
        console.log('$ ' + code + ' ' + signal);
    });
}

exports.next = function (input, _error, _success) {
    error = _error;
    success = _success;
    child.stdin.write(input);
}
