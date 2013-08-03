
var spawn = require('child_process').spawn;

var child = null,
    messages = [],
    count = 1,
    response = null,
    closing = false;


exports.start = function (params, _closing, callback) {
    if (typeof(_closing) == 'function') {
        var callback = _closing;
        closing = false;
    }
    messages = [];
    count = 1;
    response = callback;

    child = spawn('node', params);
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
        // console.log('$ ' + code + ' ' + signal);
        if (closing) response();
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

exports.end = function (input, callback) {
    closing = true;
    response = callback;
    child.stdin.write(input);
}
