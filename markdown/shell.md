##Tools

###Shell

####Debugging

Set a `breakpoint` somewhere inside your custom view files and debug as usual.

```bash
$ admin --debug-brk path/to/project/config/
# or
$ node --debug-brk path/to/express-admin/app path/to/project/config/
```


####Supervisor

Auto reload your project while configuring it using [supervisior][1].

Create a folder for your project's configuration files.

```bash
$ mkdir project
```

Then while you're still there you can use `supervisor` to watch your `project` folder, specifying that the extensions are `json`.

```bash
$ supervisor -w project -e json -- path/to/express-admin/app -v project/
```

The `-v` flag that you're passing to the Express Admin app means that you are running the admin in `development` mode. In this mode the authentication and the database record updates are disabled.

You can also pass the `-l` flag which will log out all sql queries that Express Admin make for you.


####Forever

Run an admin instance continuously in the background using [forever][2].

```bash
$ forever start path/to/express-admin/app path/to/project/config/
```

  [1]: https://github.com/isaacs/node-supervisor
  [2]: https://github.com/nodejitsu/forever