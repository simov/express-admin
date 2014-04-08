
var fs = require('fs'),
    path = require('path');


// prevent overriding of existing files
function getName (target, cb) {
    var ext = path.extname(target),
        fname = path.basename(target, ext),
        dpath = path.dirname(target);
    fs.exists(target, function (exists) {
        return exists ? loop(1) : cb(target, fname+ext);
    });
    function loop (i) {
        var name = fname+'-'+i,
            fpath = path.join(dpath, name+ext);
        fs.exists(fpath, function (exists) {
            return exists ? loop(++i) : cb(fpath, name+ext);
        });
    }
}

// get control type
function getType (args, name) {
    var columns = args.config.columns;
    for (var i=0; i < columns.length; i++) {
        if (columns[i].name == name) return columns[i].control;
    }
    return {};
}

function processFile (args, file, type, cb) {
    if (!file.name) return cb(null, file.name);
    // file.name; // file-name.jpg
    // file.path; // /tmp/9c9b10b72fe71be752bd3895f1185bc8

    var source = file.path,
        target = path.join(args.upath, file.name);

    fs.readFile(source, function (err, data) {
        if (err) return cb(err);
        if (type.binary) return cb(null, data);
        
        getName(target, function (target, fname) {
            fs.writeFile(target, data, function (err) {
                if (err) return cb(err);
                cb(null, fname);
            });
        });
    });
}

function loopColumns (args, files, post, cb) {
    var keys = Object.keys(files.columns);

    (function loop (index) {
        if (index == keys.length) return cb();
        var name = keys[index],
            type = getType(args, name);

        processFile(args, files.columns[name], type, function (err, result) {
            if (err) return cb(err);
            // either file name or file data
            if (result) post.columns[name] = 
                type.binary ? result.toString('hex') : result;
            loop(++index);
        });
    }(0));
}

exports.loopRecords = function (args, cb) {
    if (!args.files) return cb();

    var files = args.files[args.config.table.name],
        post = args.post[args.config.table.name];
    if (!files.records) return cb();
    (function loop (index) {
        if (index == files.records.length) return cb();
        loopColumns(args, files.records[index], post.records[index], function (err) {
            if (err) return cb(err);
            loop(++index);
        });
    }(0));
}
