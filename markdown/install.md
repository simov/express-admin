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
Depending on how you installed it, creating a new project is as simple as
```bash
$ admin path/to/config/dir
# or
$ node path/to/express-admin/app.js path/to/config/dir
```

Either way the path to the configuration directory should exist. If it doesn't contains any configuration files yet, you'll be prompted to add required information for your database, server port and admin account credentials.

After that you can navigate to `http://localhost:[specified port]` and see your admin up and running.

The next step is to configure it.
