##Configuration

###config.json

The application's configuration is stored inside the `config.json` file.

- The `mysql` key accepts any option from the [node-mysql's connection options][1].
- When using PostgreSQL, the `pg` key will accept any option from the [node-postgres][2] connection options.
- When using SQLite, the `sqlite` key will contain only a `database` key with the absolute path to the database set as a value.

```js
{
    "mysql": { // or "pg" or "sqlite"
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
        "root": "/admin",
        "upload": "/upload/folder"
    }
}
```

- **mysql | pg | sqlite** - connection options
    - **database** - name of the database to use for this connection (sqlite: absolute path to a database file)
    - **user** - database user to authenticate with
    - **password** - password for that database user
    - **schema** - used only with PostgreSQL (default: "public")
- **server** - server configuration
    - **port** - the server's port number (default: 3000)
- **app** - admin application configuration
    - **layouts** - toggle the layout button
    - **themes** - toggle the themes button
    - **languages** - toggle the languages button
    - **root** - root location for the admin (used **only** when embedding - see the docs)
    - **upload** - absolute path to the upload folder (default: "public/upload")


  [1]: https://github.com/felixge/node-mysql#connection-options
  [2]: https://github.com/brianc/node-postgres