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
Run the admin with the `--debug-brk` flag and use [node-inspector][2] to drill down into the event hook parameters
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
Take a look at the [events example][1] from the Examples Repository

  [1]: https://github.com/simov/express-admin-examples/blob/master/examples/custom/events/events.js
  [2]: https://github.com/node-inspector/node-inspector