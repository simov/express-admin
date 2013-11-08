##Configuration

###config.json

The application's configuration is stored inside the `config.json` file. The `mysql` key accepts any option from the [node-mysql's connection options][1].

```js
{
    "mysql": {
        "database": "express-admin-examples",
        "user": "liolio",
        "password": "karamba"
    },
    "server": {
        "port": 3000
    },
    "app": {
        "layouts": true,
        "themes": true,
        "languages": true,
        "root": "/admin"
    }
}
```

- **mysql** - mysql connection options
    - **database** - name of the database to use for this connection
    - **user** - the MySQL user to authenticate as
    - **password** - the password of that MySQL user
- **server** - server configuration
    - **port** - the server's port number (default: 3000)
- **app** - admin application configuration
    - **layouts** - toggle the layout button
    - **themes** - toggle the themes button
    - **languages** - toggle the languages button
    - **root** - root location for the admin (omitted by default `/`)

  [1]: https://github.com/felixge/node-mysql#connection-options