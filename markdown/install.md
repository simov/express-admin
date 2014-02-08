##Install

###Get the module

```bash
$ [sudo] npm install [-g] express-admin
# PostgreSQL only: run this inside the express-admin folder
$ npm install pg@2.8.2
# SQLite only: run this inside the express-admin folder
$ npm install sqlite3@2.2.0
```

###Create a project
Depending on how you installed it creating a project is simple
```bash
$ admin path/to/config/dir
# or
$ node path/to/express-admin/app.js path/to/config/dir
```

Either way the config path should exist. If it doesn't contains any config files in it already you'll be prompted to add required information for your database, server port and admin account credentials.

After that you can navigate to `localhost:[specified port]` and see your admin up and running.

The next step is to configure it.
