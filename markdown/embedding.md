
## Embedding

Inside the `config.json` file, under the `app` key, include an additional `root` key, specifying the root mount point for your embedded _Express Admin_ application.

### config.json

```js
"app": {
    ...
    "root": "/some-path"
}
```

### Example

In this example _Express Admin_ will be located under the `/admin` path of your app.

```js
var express = require('express'),
    xAdmin = require('express-admin');

var config = {
    dpath: './express-admin-config/',
    config: require('./express-admin-config/config.json'),
    settings: require('./express-admin-config/settings.json'),
    custom: require('./express-admin-config/custom.json'),
    users: require('./express-admin-config/users.json')
};

xAdmin.init(config, function (err, admin) {
    if (err) return console.log(err);
    // web site
    var app = express();
    // mount express-admin before any other middlewares
    app.use('/admin', admin);
    // site specific middlewares
    app.use(express.bodyParser());
    // site routes
    app.get('/', function (req, res) {
        res.send('Hello World');
    });
    // site server
    app.listen(3000, function () {
        console.log('My awesome site listening on port 3000');
    });
});
```
