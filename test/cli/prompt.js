
var spawn = require('child_process').spawn;

var child = null,
    output = '',
    expected = '',
    response = null,
    timeout = null;


exports.start = function (params, expect, callback) {
    this.next(null, expect, callback);

    child = spawn('node', params);
    child.stdin.setEncoding('utf8');

    child.stdout.on('data', function (data) {
        // console.log('> ' + data);
        output += data.toString().trim().replace(/\r?\n|\r/g, '');
        
        if (output == expected) response();

        clearTimeout(timeout);
        timeout = setTimeout(function () {
            response(new Error('Operation timed out!'));
        }, 1500);
    });
    
    child.stderr.on('data', function (data) {
        // console.log('! ' + data);
        output += data.toString().trim().replace(/\r?\n|\r/g, '');
        
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            response(new Error(output));
        }, 1000);
    });
    
    child.on('exit', function (code, signal) {
        // console.log('$ ' + code + ' ' + signal);
    });
}

exports.next = function (input, expect, callback) {
    output = '';
    expected = expect;
    response = callback;
    
    if (input != null) child.stdin.write(input);
}
