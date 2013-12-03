##Configuration

###config.json

The application's configuration is stored inside the `config.json` file.<br />
The `mysql` key accepts any option from the [node-mysql's connection options][1].<br />
When using PostgreSQL, the `pg` key will accept any option from the [node-postgres][2] connection options.

```js
{
    "mysql": { // or "pg"
        "database": "express-admin-examples",
        "user": "liolio",
        "password": "karamba"
        // "schema": "schema-name"
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

- **mysql || pg** - connection options
    - **database** - name of the database to use for this connection
    - **user** - the MySQL user to authenticate as
    - **password** - the password of that MySQL user
    - **schema** - used only with PostgreSQL (default: "public")
- **server** - server configuration
    - **port** - the server's port number (default: 3000)
- **app** - admin application configuration
    - **layouts** - toggle the layout button
    - **themes** - toggle the themes button
    - **languages** - toggle the languages button
    - **root** - root location for the admin (omitted by default `/`)

  [1]: https://github.com/felixge/node-mysql#connection-options
  [2]: https://github.com/brianc/node-postgres