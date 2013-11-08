##Embedding

You need to add one additional property inside your `config.json` file under the `app` key

###config.json

```js
"app": {
	...
	"root": "/some-path"
}
```

###Initialization

In this example Express Admin will be located under the `/admin` path of your app

```js
var express = require('express');
var expressAdmin = require('express-admin');
var app = express();

app.get('/', function(req, res){
    res.send('Hello World');
});

var expressAdminArgs = {
    dpath: './express-admin-config/',
    config: require('./express-admin-config/config.json'),
    settings: require('./express-admin-config/settings.json'),
    custom: require('./express-admin-config/custom.json'),
    users: require('./express-admin-config/users.json')
};

expressAdmin.initDatabase(expressAdminArgs, function (err) {
    if(err) return console.log(err);
        
    expressAdmin.initSettings(expressAdminArgs);

    var admin = expressAdmin.initServer(expressAdminArgs);
    app.use('/admin', admin);
    app.listen(3000);
});
```