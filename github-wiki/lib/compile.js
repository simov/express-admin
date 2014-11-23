
var fs = require('fs'),
    path = require('path');
var hogan = require('hogan.js'),
    async = require('async'),
    Purest = require('purest');

if (!process.argv[2]) throw new Error('Specify config.json to use');
var config = require(path.resolve(process.argv[2]));

var template = {
    layout: hogan.compile(
        fs.readFileSync(path.resolve(__dirname,'../template/layout.html'), 'utf8')),
    navigation:
        fs.readFileSync(config.path.navigation, 'utf8')
};
var github = new Purest({provider:'github', defaults:{headers:{'user-agent':'Purest'}}}),
    cred = require(config.path.credentials);


var dpath = config.path.markdown,
    files = config.project.files;
var data = '', index = 0;

async.eachSeries(files, function (file, done) {
    var text = fs.readFileSync(path.join(dpath, file+'.md'), 'utf8');

    github.post('markdown', {
        qs:{access_token: cred.github.token},
        body:{
            text: text,
            mode: 'markdown'
        }
    }, function (err, res, body) {
        if (err) console.log(err);

        // separate files
        config.single = false;
        config.path.prefix = '../';
        var content = template.layout.render(config, {
            content: body.replace(/user-content-/g,''),
            navigation: template.navigation
        });

        var fpath = path.join(config.path.html, file+'.html');
        fs.writeFileSync(fpath, content, 'utf8');
        if (index == 0)
            fs.writeFileSync(path.join(config.path.html, 'index.html'), content, 'utf8');

        // single file
        data += '<div class="file">'+body;
        if (index++ < files.length-1) data += '<p><br /></p><hr />';
        data += '</div>';

        done();
    });
}, function (err) {
    // single file
    config.single = true;
    config.path.prefix = '';
    var content = template.layout.render(config, {
        content: data.replace(/user-content-/g,''),
        navigation: template.navigation
    });

    var fpath = path.resolve(config.path.html, '../index.html');
    fs.writeFileSync(fpath, content, 'utf8');
});
