
var path = require('path'),
    spawn = require('child_process').spawn;
require('colors');

var child = null,
    response = null,
    count = 1,
    messages = [];


exports.start = function (callback) {
    response = callback;

    var mpath = path.resolve(__dirname, 'wrapper.js');
    child = spawn('node', [mpath]);
    child.stdin.setEncoding('utf8');

    child.stdout.on('data', function (data) {
        // console.log('> ' + data);
        var text = data.toString().trim();
        
        messages.push(text);
        if (messages.length == count)
            response(messages);
    });
    
    child.stderr.on('data', function (data) {
        console.log('! ' + data);
    });
    
    child.on('exit', function (code, signal) {
        console.log('$ ' + code + ' ' + signal);
    });
}

exports.next = function (input, _count, callback) {
    if (typeof(_count) == 'function') {
        callback = _count;
        _count = 1;
    }
    messages = [];
    count = _count;
    response = callback;
    child.stdin.write(input);
}
