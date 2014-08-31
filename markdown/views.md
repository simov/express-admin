
## Custom views (apps)

The admin's custom views follow the [Modular web applications with Node.js and Express][1] approach presented by [TJ Holowaychuk][2].

The only difference here is that we're dealing with `mustache` templates.


### custom.json
```js
"view1": {
    "app": {
        "path": "/absolute/path/to/custom/app.js",
        "slug": "view1",
        "verbose": "My Custom View",
        "mainview": {
            "show": true
        }
    }
}
```

### app.js
```js
var express = require('express');
var app = module.exports = express();
var path = require('path');

// set your custom views path
app.set('views', path.join(__dirname, 'views'));

app.get('/view1', function (req, res, next) {

    // create a realtive from the admin's view folder to your custom folder
    var relative = path.relative(res.locals._admin.views, app.get('views'));
    
    res.locals.partials = {

        // set the path to your templates like this
        // the content partial is declared inside the admin's base.html
        // this is the entry point for all your custom stuff
        content: path.join(relative, 'template')
    };

    // typically you want your stuff to be rendered inside the admin's UI
    // so no need to render here
    next();
});
```

You should definitely run the examples from the [examples repository][3] as each of the custom views (apps) presented there is really well commented.


### Route wide variables
Several variables are exposed to every route callback.

```js
// _admin's variable content is for internal purposes only and is not being rendered
res.locals._admin.db.connection// the admin's database connection can be reused from here
res.locals._admin.config       // the contents of the config.json file
res.locals._admin.settings     // the contents of the settings.json file
res.locals._admin.custom       // the contents of the custom.json file
res.locals._admin.users        // the contents of the users.json file

// shortcut variables that are being rendered
res.locals.libs       // list of all client side libraries
res.locals.themes     // list of all themes
res.locals.layouts    // flag indicating layouts button visibility
res.locals.languages  // list of all languages

// holds the absolute path to the admin's view directory
res.locals._admin.views
```


  [1]: http://vimeo.com/56166857
  [2]: https://github.com/visionmedia
  [3]: https://github.com/simov/express-admin-examples
