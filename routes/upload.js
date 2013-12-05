
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

function processFile (file, cb) {
    if (!file.name) return cb(null, file.name);
    // file.name; // file-name.jpg
    // file.path; // /tmp/9c9b10b72fe71be752bd3895f1185bc8

    var source = file.path,
        target = path.join(path.resolve(__dirname, '../../public/uploads'), file.name);

    fs.readFile(source, function (err, data) {
        if (err) return cb(err);
        getName(target, function (target, fname) {
            fs.writeFile(target, data, function (err) {
                if (err) return cb(err);
                cb(null, fname);
            });
        });
    });
}

function setName (req, file, fname) {
    var m = file.fieldName.match(/(.+)\[(.+)\]\[records\]\[(\d+)\]\[columns\]\[(.+)\]/);
    req.body[m[1]][m[2]].records[parseInt(m[3])].columns[m[4]] = fname;
}

function getFiles (req) {
    var files = [];
    for (var key in req.files) {
        var view = req.files[key];
        for (var key in view) {
            var table = view[key];
            if (!table.records) continue;
            for (var i=0; i < table.records.length; i++) {
                var record = table.records[i];
                for (var key in record.columns) {
                    files.push(record.columns[key]);
                }
            }
        }
    }
    return files;
}

exports.files = function (req, res, next) {
    var files = getFiles(req);

    (function loop (index) {
        if (index == files.length) return next();
        var file = files[index];
        processFile(file, function (err, fname) {
            if (fname != '') setName(req, file, fname);
            loop(++index);
        });
    }(0));
}
