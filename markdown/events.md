##Events

Currently the supported event hooks are:
- preSave
- postSave


###custom.json
```js
"some-key": {
    "events": "/absolute/path/to/custom/events.js"
}
```

###events.js
Run the admin with the `--debug-brk` flag and use [node-inspector][3] to drill down into the event hook parameters
```js
exports.preSave = function (req, res, args, next) {
    debugger;
    if (args.debug) console.log('preSave');
    next();
}
exports.postSave = function (req, res, args, next) {
    debugger;
    if (args.debug) console.log('postSave');
    next();
}
```
Take a look at the event examples [here][1] and [here][2]

  [1]: https://github.com/simov/express-admin-examples/blob/master/config/custom/events/events.js
  [2]: https://github.com/simov/express-admin-tests/blob/master/config/x-relationships-compound/custom/events.js
  [3]: https://github.com/node-inspector/node-inspector