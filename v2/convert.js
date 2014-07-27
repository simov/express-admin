
var fs = require('fs'),
    path = require('path'),
    hogan = require('hogan.js'),
    Client = require('github');

var html = fs.readFileSync('base.html', 'utf8');
    template = hogan.compile(html);

var client = new Client({
    version: '3.0.0'
});


var dpath = path.resolve(__dirname, '../markdown/'),
    files = [
        'about', 'install',
        'config', 'settings', 'custom',
        'one-to-many', 'many-to-many', 'many-to-one', 'one-to-one',
        'compound',
        'ckeditor', 'tinymce', 'multiple',
        'views', 'events', 'embedding',
        'themes',
        'shell', 'nginx', 'apache'
    ];


var data = '';

(function loop (index, cb) {
    if (index == files.length) return cb();

    var text = fs.readFileSync(path.join(dpath ,files[index]+'.md'), 'utf8');

    client.markdown.render({
        text: text,
        mode: 'markdown'
    }, function (err, res) {
        if (err) return cb(err);
        data += '<div class="file">'+res.data;
        if (index < files.length-1) data += '<p><br /></p><hr />';
        data += '</div>';

        loop(++index, cb);
    });
}(0, function (err) {
    if (err) return console.log(err);
    var content = template.render({}, {content: data.replace(/user-content-/g,'')});
    fs.writeFileSync(path.resolve(__dirname, '../index.html'), content, 'utf8');
}));
