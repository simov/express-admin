
var path = require('path');
var express = require('express'),
    consolidate = require('consolidate'),
    hogan = require('hogan.js');


var app = express()
    .set('views', path.resolve(__dirname, './views'))
    .set('view engine', 'html')
    .engine('html', consolidate.hogan)

    .use(express.favicon())
    .use(express.logger('dev'));

app.get('*', function (req, res) {
    res.render('base', {
        partials: {
            navigation : 'navigation',

            about      : 'about/about',
            install    : 'about/install',
            settings   : 'about/settings',

            oneToMany  : 'relationship/oneToMany',
            manyToMany : 'relationship/manyToMany',
            oneToOne   : 'relationship/oneToOne',
            manyToOne  : 'relationship/manyToOne',
            allTogether: 'relationship/allTogether',

            themes     : 'ui/themes',
            datepicker : 'ui/datepicker',
            textarea   : 'ui/textarea',
            ckeditor   : 'ui/ckeditor',
            tinymce    : 'ui/tinymce',
            multiple   : 'ui/multiple',

            custom     : 'custom/config',

            nginx      : 'misc/nginx',
            apache     : 'misc/apache',
            scripts    : 'misc/scripts'
        }
    });
});

app.listen(3010, function () {
    console.log('Express Server listening on port 3010');
});
